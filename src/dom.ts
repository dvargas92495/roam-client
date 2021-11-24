import { AxiosError } from "axios";
import { parseInline, RoamContext } from "roam-marked";
import { toRoamDateUid } from "./date";
import {
  getBlockUidsByPageTitle,
  getBlockUidsReferencingBlock,
  getChildrenLengthByPageUid,
  getNthChildUidByBlockUid,
  getOrderByBlockUid,
  getPageUidByPageTitle,
  getParentUidByBlockUid,
  getTextByBlockUid,
} from "./queries";
import { RoamError, TreeNode, ViewType } from "./types";
import { createBlock, updateActiveBlock, updateBlock } from "./writes";

export const BLOCK_REF_REGEX = /\(\(([\w\d-]{9,10})\)\)/;
const aliasRefRegex = new RegExp(
  `\\[[^\\]]*\\]\\((${BLOCK_REF_REGEX.source})\\)`,
  "g"
);
const aliasTagRegex = new RegExp(
  `\\[[^\\]]*\\]\\((\\[\\[([^\\]]*)\\]\\])\\)`,
  "g"
);

export const resolveRefs = (text: string): string => {
  return text
    .replace(aliasTagRegex, (alias, del, pageName) => {
      const blockUid = getPageUidByPageTitle(pageName);
      return alias.replace(del, `${getRoamUrl(blockUid)}`);
    })
    .replace(aliasRefRegex, (alias, del, blockUid) => {
      return alias.replace(del, `${getRoamUrl(blockUid)}`);
    })
    .replace(new RegExp(BLOCK_REF_REGEX, "g"), (_, blockUid) => {
      const reference = getTextByBlockUid(blockUid);
      return reference || blockUid;
    });
};

export const addStyle = (content: string, id?: string): HTMLStyleElement => {
  const existing = document.getElementById(id || "") as HTMLStyleElement;
  if (existing) return existing;
  const css = document.createElement("style");
  css.textContent = content;
  if (id) css.id = id;
  document.getElementsByTagName("head")[0].appendChild(css);
  return css;
};

/**
 * TODO: Replace this paradigm with an tree node config instead.
 */
const getButtonConfig = (target: HTMLButtonElement, targetCommand: string) => {
  const rawParts = target.innerText
    .substring(targetCommand.length + 1)
    .split(" ");
  let quotedWord = "";
  const restOfButtonText: string[] = [];
  for (const part of rawParts) {
    if (quotedWord) {
      if (part.endsWith('"')) {
        restOfButtonText.push(
          `${quotedWord} ${part.substring(0, part.length - 1)}`
        );
        quotedWord = "";
      } else {
        quotedWord = `${quotedWord} ${part}`;
      }
    } else {
      if (part.startsWith('"')) {
        quotedWord = part.substring(1);
      } else {
        restOfButtonText.push(part);
      }
    }
  }
  const numPairs = Math.floor(restOfButtonText.length / 2);
  const buttonConfig = {} as { [key: string]: string };
  for (let i = 0; i < numPairs; i++) {
    buttonConfig[restOfButtonText[i * 2]] = restOfButtonText[i * 2 + 1];
  }
  return buttonConfig;
};

const clickEventListener = (
  targetCommand: string,
  callback: (buttonConfig: { [key: string]: string }, blockUid: string) => void
) => async (e: MouseEvent) => {
  const htmlTarget = e.target as HTMLElement;
  if (
    htmlTarget &&
    htmlTarget.tagName === "BUTTON" &&
    htmlTarget.innerText
      .toUpperCase()
      .trim()
      .startsWith(targetCommand.toUpperCase())
  ) {
    const target = htmlTarget as HTMLButtonElement;
    const buttonConfig = getButtonConfig(target, targetCommand);
    const { blockUid } = getUidsFromButton(target);
    window.roamAlphaAPI.updateBlock({ block: { uid: blockUid, string: "" } });
    callback(buttonConfig, blockUid);
  }
};

export const addOldRoamJSDependency = (extension: string) => {
  const id = `roamjs-${extension.replace(/\/main$/, "")}`;
  const existing = document.getElementById(id);
  if (!existing) {
    const script = document.createElement("script");
    script.src = `https://roamjs.com/${extension}.js`;
    script.async = true;
    script.type = "text/javascript";
    script.id = id;
    document.querySelector("head")?.appendChild(script);
  }
};

export const addRoamJSDependency = (extension: string) => {
  addOldRoamJSDependency(`${extension}/main`);
};

export const addButtonListener = (
  targetCommand: string,
  callback: (buttonConfig: { [key: string]: string }, blockUid: string) => void
) =>
  document.addEventListener(
    "click",
    clickEventListener(targetCommand, callback)
  );

/**
 * @param icon A blueprint icon which could be found in https://blueprintjs.com/docs/#icons
 */
export const createIconButton = (icon: string) => {
  const popoverButton = document.createElement("span");
  popoverButton.className = "bp3-button bp3-minimal bp3-small";
  popoverButton.tabIndex = 0;

  const popoverIcon = document.createElement("span");
  popoverIcon.className = `bp3-icon bp3-icon-${icon}`;
  popoverButton.appendChild(popoverIcon);

  return popoverButton;
};

export const getUidsFromId = (id: string) => {
  const blockUid = id.substring(id.length - 9, id.length);
  const restOfHTMLId = id.substring(0, id.length - 9);
  const potentialDateUid = restOfHTMLId.substring(
    restOfHTMLId.length - 11,
    restOfHTMLId.length - 1
  );
  const parentUid = isNaN(new Date(potentialDateUid).valueOf())
    ? potentialDateUid.substring(1)
    : potentialDateUid;
  return {
    blockUid,
    parentUid,
  };
};

export const getUids = (block: HTMLDivElement | HTMLTextAreaElement) => {
  return block ? getUidsFromId(block.id) : { blockUid: "", parentUid: "" };
};

export const getActiveUids = () =>
  getUids(document.activeElement as HTMLTextAreaElement);

export const getUidsFromButton = (button: HTMLButtonElement) => {
  const block = button.closest(".roam-block") as HTMLDivElement;
  return block ? getUids(block) : { blockUid: "", parentUid: "" };
};

export const genericError = (e: Partial<AxiosError & RoamError>) => {
  const message =
    (e.response
      ? typeof e.response.data === "string"
        ? e.response.data
        : JSON.stringify(e.response.data)
      : e.message) ||
    e.raw ||
    "Unknown Error Occurred";
  const errMsg = `Error: ${
    message.length > 50 ? `${message.substring(0, 50)}...` : message
  }`;
  updateActiveBlock(errMsg);
  return errMsg;
};

const getMutatedNodes = ({
  ms,
  tag,
  className,
  nodeList,
}: {
  ms: MutationRecord[];
  tag: string;
  className: string;
  nodeList: "addedNodes" | "removedNodes";
}) => {
  const blocks = ms.flatMap((m) =>
    Array.from(m[nodeList]).filter(
      (d: Node) =>
        d.nodeName === tag &&
        Array.from((d as HTMLElement).classList).includes(className)
    )
  );
  const childBlocks = ms.flatMap((m) =>
    Array.from(m[nodeList])
      .filter((n) => n.hasChildNodes())
      .flatMap((d) =>
        Array.from((d as HTMLElement).getElementsByClassName(className))
      )
  );
  return [...blocks, ...childBlocks];
};

export const createObserver = (
  mutationCallback: (
    mutationList: MutationRecord[],
    observer: MutationObserver
  ) => void
): void =>
  createDivObserver(
    mutationCallback,
    document.getElementsByClassName("roam-body")[0]
  );

export const createOverlayObserver = (
  mutationCallback: (mutationList: MutationRecord[]) => void
): void => createDivObserver(mutationCallback, document.body);

const createDivObserver = (
  mutationCallback: MutationCallback,
  mutationTarget: Element
) => {
  const observer = new MutationObserver(mutationCallback);
  observer.observe(mutationTarget, { childList: true, subtree: true });
};

export const createHTMLObserver = ({
  callback,
  tag,
  className,
  removeCallback,
  useBody,
}: {
  callback: (b: HTMLElement) => void;
  tag: string;
  className: string;
  removeCallback?: (b: HTMLElement) => void;
  useBody?: boolean;
}): void => {
  const blocks = document.getElementsByClassName(
    className
  ) as HTMLCollectionOf<HTMLElement>;
  Array.from(blocks).forEach(callback);

  (useBody ? createOverlayObserver : createObserver)((ms) => {
    const addedNodes = getMutatedNodes({
      ms,
      nodeList: "addedNodes",
      tag,
      className,
    });
    addedNodes.map((n) => n as HTMLElement).forEach(callback);
    if (removeCallback) {
      const removedNodes = getMutatedNodes({
        ms,
        nodeList: "removedNodes",
        tag,
        className,
      });
      removedNodes.map((n) => n as HTMLElement).forEach(removeCallback);
    }
  });
};

export const createButtonObserver = ({
  attribute,
  render,
  shortcut = attribute,
}: {
  shortcut?: string;
  attribute: string;
  render: (b: HTMLButtonElement) => void;
}): void =>
  createHTMLObserver({
    callback: (b) => {
      if (
        b.innerText.toUpperCase() ===
          attribute.toUpperCase().replace(/-/g, " ") ||
        b.innerText.toUpperCase() === shortcut.toUpperCase()
      ) {
        const dataAttribute = `data-roamjs-${attribute}`;
        if (!b.getAttribute(dataAttribute)) {
          b.setAttribute(dataAttribute, "true");
          render(b as HTMLButtonElement);
        }
      }
    },
    tag: "BUTTON",
    className: "bp3-button",
    useBody: true,
  });

export const createHashtagObserver = ({
  callback,
  attribute,
}: {
  callback: (s: HTMLSpanElement) => void;
  attribute: string;
}): void =>
  createHTMLObserver({
    useBody: true,
    tag: "SPAN",
    className: "rm-page-ref--tag",
    callback: (s: HTMLSpanElement) => {
      if (!s.getAttribute(attribute)) {
        s.setAttribute(attribute, "true");
        callback(s);
      }
    },
  });

export const createBlockObserver = (
  blockCallback: (b: HTMLDivElement) => void,
  blockRefCallback?: (b: HTMLSpanElement) => void
): void => {
  createHTMLObserver({
    callback: (e) => blockCallback(e as HTMLDivElement),
    tag: "DIV",
    className: "roam-block",
  });
  if (blockRefCallback) {
    createHTMLObserver({
      callback: blockRefCallback,
      tag: "SPAN",
      className: "rm-block-ref",
    });
  }
};

export const createPageObserver = (
  name: string,
  callback: (blockUid: string, added: boolean) => void
): void =>
  createObserver((ms) => {
    const addedNodes = getMutatedNodes({
      ms,
      nodeList: "addedNodes",
      tag: "DIV",
      className: "roam-block",
    }).map((blockNode) => ({
      blockUid: getUids(blockNode as HTMLDivElement).blockUid,
      added: true,
    }));

    const removedNodes = getMutatedNodes({
      ms,
      nodeList: "removedNodes",
      tag: "DIV",
      className: "roam-block",
    }).map((blockNode) => ({
      blockUid: getUids(blockNode as HTMLDivElement).blockUid,
      added: false,
    }));

    if (addedNodes.length || removedNodes.length) {
      const blockUids = new Set(getBlockUidsByPageTitle(name));
      [...removedNodes, ...addedNodes]
        .filter(({ blockUid }) => blockUids.has(blockUid))
        .forEach(({ blockUid, added }) => callback(blockUid, added));
    }
  });

export const createPageTitleObserver = ({
  title,
  callback,
  log = false,
}: {
  title: string;
  callback: (d: HTMLDivElement) => void;
  log?: boolean;
}): void => {
  const listener = (url: string) => {
    const d = document.getElementsByClassName(
      "roam-article"
    )[0] as HTMLDivElement;
    if (d) {
      const uid = getPageUidByPageTitle(title);
      const attribute = `data-roamjs-${uid}`;
      if ((uid && url === getRoamUrl(uid)) || (log && url === getRoamUrl())) {
        // React's rerender crushes the old article/heading
        setTimeout(() => {
          if (!d.hasAttribute(attribute)) {
            d.setAttribute(attribute, "true");
            callback(
              document.getElementsByClassName(
                "roam-article"
              )[0] as HTMLDivElement
            );
          }
        }, 1);
      } else {
        d.removeAttribute(attribute);
      }
    }
  };
  window.addEventListener("hashchange", (e) => listener(e.newURL));
  listener(window.location.href);
};

const VIEW_CONTAINER = {
  bullet: "ul",
  document: "div",
  numbered: "ol",
};
const HEADINGS = ["p", "h1", "h2", "h3"];
export const parseRoamBlocksToHtml = ({
  content,
  viewType,
  level,
  context,
}: {
  level: number;
  context: Required<RoamContext>;
  content: TreeNode[];
  viewType: ViewType;
}): string => {
  if (content.length === 0) {
    return "";
  }
  const items = content.map((t) => {
    let skipChildren = false;
    const componentsWithChildren = (s: string, ac?: string): string | false => {
      const parent = context.components(s, ac);
      if (parent) {
        return parent;
      } else if (/table/i.test(s)) {
        skipChildren = true;
        const flatten = (n: TreeNode): TreeNode[][] =>
          n.children.length
            ? n.children
                .map((c) => flatten(c))
                .flatMap((c) => c.map((cc) => [n, ...cc]))
            : [[n]];
        const rows = flatten(t).map((row) =>
          row.slice(1).map(
            (td) =>
              `<td>${parseInline(td.text, {
                ...context,
                components: componentsWithChildren,
              })}</td>`
          )
        );
        const columns = Math.max(...rows.map((row) => row.length), 0);
        const fill = Array<string>(columns).fill("<td></td>");
        const normalizedRows = rows.map((row) =>
          [...row, ...fill.slice(0, columns - row.length)].join("")
        );
        return `<table class="roam-table"><tbody>${normalizedRows
          .map((row) => `<tr>${row}</tr>`)
          .join("")}</tbody></table>`;
      } else if (/roam\/render/i.test(s)) {
        skipChildren = true;
        const acCode = ac || "";
        return `<div class="roam-render">${acCode}</div>`;
      }
      return false;
    };
    const classlist =
      t.textAlign === "left"
        ? ["text-align-left"]
        : t.textAlign === "center"
        ? ["text-align-center"]
        : t.textAlign === "right"
        ? ["text-align-right"]
        : [];
    const textToParse = t.text.replace(/#\.([^\s]*)/g, (_, className) => {
      classlist.push(className);
      return "";
    });
    const inlineMarked = parseInline(textToParse, {
      ...context,
      components: componentsWithChildren,
    });
    const innerHtml = `<${HEADINGS[t.heading]}>${inlineMarked}</${
      HEADINGS[t.heading]
    }>\n${
      skipChildren
        ? ""
        : parseRoamBlocksToHtml({
            content: t.children,
            viewType: t.viewType,
            level: level + 1,
            context,
          })
    }`;
    if (level > 0 && viewType === "document") {
      classlist.push("document-bullet");
    }
    const attrs = `id="${t.uid}"${
      classlist.length ? ` class="${classlist.join(" ")}"` : ""
    }`;
    const blockHtml =
      level === 0 && viewType === "document"
        ? `<div ${attrs}>${innerHtml}</div>`
        : `<li ${attrs}>${innerHtml}</li>`;

    return blockHtml;
  });
  const containerTag =
    level > 0 && viewType === "document" ? "ul" : VIEW_CONTAINER[viewType];
  return `<${containerTag}>${items.join("\n")}</${containerTag}>`;
};

const getDomRefs = (blockUid: string) => {
  const currentlyEditingBlock = document.querySelector(
    "textarea.rm-block-input"
  ) as HTMLTextAreaElement;
  if (getUids(currentlyEditingBlock).blockUid === blockUid) {
    return (
      currentlyEditingBlock.value.match(/\(\(([\w\d-]{9})\)\)/g) || []
    ).map((s) => s.slice(2, -2));
  }
  return [];
};

export const getReferenceBlockUid = (
  e: HTMLElement,
  className: "rm-block-ref" | "rm-alias--block"
): string => {
  const parent = e.closest(".roam-block") as HTMLDivElement;
  if (!parent) {
    return "";
  }
  const { blockUid } = getUids(parent);
  const childRefs = getBlockUidsReferencingBlock(blockUid);
  const refs = childRefs.length ? childRefs : getDomRefs(blockUid);
  const index = Array.from(parent.getElementsByClassName(className)).findIndex(
    (el) => el === e || el.contains(e)
  );
  return refs[index];
};

export const getBlockUidFromTarget = (target: HTMLElement): string => {
  const ref = target.closest(".rm-block-ref") as HTMLSpanElement;
  if (ref) {
    return ref.getAttribute("data-uid") || "";
  }

  const customView = target.closest(".roamjs-block-view") as HTMLDivElement;
  if (customView) {
    return getUids(customView).blockUid;
  }

  const aliasTooltip = target.closest(".rm-alias-tooltip__content");
  if (aliasTooltip) {
    const aliasRef = document.querySelector(
      ".bp3-popover-open .rm-alias--block"
    ) as HTMLAnchorElement;
    return getReferenceBlockUid(aliasRef, "rm-alias--block");
  }

  const { blockUid } = getUids(target.closest(".roam-block") as HTMLDivElement);
  const kanbanTitle = target.closest(".kanban-title");
  if (kanbanTitle) {
    const container = kanbanTitle.closest(".kanban-column-container");
    if (container) {
      const column = kanbanTitle.closest(".kanban-column");
      const order = Array.from(container.children).findIndex(
        (d) => d === column
      );
      return getNthChildUidByBlockUid({ blockUid, order });
    }
  }
  return blockUid;
};

export const openBlock = (blockId?: string, position?: number): void =>
  openBlockElement(document.getElementById(blockId || ""), position);

const openBlockElement = (
  block: HTMLElement | null,
  position?: number
): void => {
  if (block) {
    block.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    setTimeout(() => {
      const textArea = document.getElementById(block.id) as HTMLTextAreaElement;
      if (textArea?.tagName === "TEXTAREA") {
        const selection =
          typeof position !== "number" ? textArea.value.length : position;
        textArea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        textArea.setSelectionRange(selection, selection);
      }
    }, 50);
  }
};

export const getRoamUrl = (blockUid?: string): string =>
  `${window.location.href.replace(/\/page\/.*$/, "")}${
    blockUid ? `/page/${blockUid}` : ""
  }`;

export const getCurrentPageUid = (): string =>
  window.location.hash.match(/\/page\/(.*)$/)?.[1] || toRoamDateUid(new Date());

export const getRoamUrlByPage = (page: string): string => {
  const uid = getPageUidByPageTitle(page);
  return uid && getRoamUrl(uid);
};

export const addBlockCommand = ({
  label,
  callback,
}: {
  label: string;
  callback: (uid: string) => void;
}) => {
  const textareaRef: { current: HTMLTextAreaElement | null } = {
    current: null,
  };

  const loadBlockUid = (pageUid: string) => {
    if (textareaRef.current) {
      const uid = getUids(textareaRef.current).blockUid;
      const parentUid = getParentUidByBlockUid(uid);

      const text = getTextByBlockUid(uid);
      if (text.length) {
        return createBlock({
          node: { text: "Loading..." },
          parentUid,
          order: getOrderByBlockUid(uid) + 1,
        });
      }
      return updateBlock({
        uid,
        text: "Loading...",
      });
    }
    return createBlock({
      node: { text: "Loading..." },
      parentUid: pageUid,
      order: getChildrenLengthByPageUid(pageUid),
    });
  };

  createHTMLObserver({
    tag: "TEXTAREA",
    className: "rm-block-input",
    callback: (t: HTMLElement) =>
      (textareaRef.current = t as HTMLTextAreaElement),
  });

  window.roamAlphaAPI.ui.commandPalette.addCommand({
    label,
    callback: () => {
      const parentUid = getCurrentPageUid();
      const blockUid = loadBlockUid(parentUid);
      return callback(blockUid);
    },
  });
};

const elToTitle = (e?: Node): string => {
  if (!e) {
    return "";
  } else if (e.nodeName === "#text") {
    return e.nodeValue || "";
  } else if (
    e.nodeName === "SPAN" &&
    (e as HTMLSpanElement).classList.contains("rm-page-ref__brackets")
  ) {
    return "";
  } else if (
    e.nodeName === "SPAN" &&
    (e as HTMLSpanElement).classList.contains("rm-page-ref")
  ) {
    return `[[${Array.from(e.childNodes).map(elToTitle).join("")}]]`;
  } else {
    return Array.from(e.childNodes).map(elToTitle).join("");
  }
};

export const getPageTitleByHtmlElement = (
  e: Element
): ChildNode | undefined => {
  const container =
    e.closest(".roam-log-page") ||
    e.closest(".rm-sidebar-outline") ||
    e.closest(".roam-article") ||
    document;
  const heading =
    (container.getElementsByClassName(
      "rm-title-display"
    )[0] as HTMLHeadingElement) ||
    (container.getElementsByClassName(
      "rm-zoom-item-content"
    )[0] as HTMLSpanElement);
  return Array.from(heading.childNodes).find(
    (n) => n.nodeName === "#text" || n.nodeName === "SPAN"
  );
};

export const getPageTitleValueByHtmlElement = (e: Element) =>
  elToTitle(getPageTitleByHtmlElement(e));

export const getDropUidOffset = (
  d: HTMLDivElement
): { parentUid: string; offset: number } => {
  const separator = d.parentElement;
  const childrenContainer = separator?.parentElement;
  const children = Array.from(childrenContainer?.children || []);
  const index = children.findIndex((c) => c === separator);
  const offset = children.reduce(
    (prev, cur, ind) =>
      cur.classList.contains("roam-block-container") && ind < index
        ? prev + 1
        : prev,
    0
  );
  const parentBlock = childrenContainer?.previousElementSibling?.getElementsByClassName(
    "roam-block"
  )?.[0] as HTMLDivElement;
  const parentUid = parentBlock
    ? getUids(parentBlock).blockUid
    : childrenContainer
    ? getPageUidByPageTitle(
        getPageTitleByHtmlElement(childrenContainer)?.textContent || ""
      )
    : "";
  return {
    parentUid,
    offset,
  };
};

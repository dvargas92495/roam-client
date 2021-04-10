import { AxiosError } from "axios";
import { getBlockUidsByPageTitle } from "./queries";
import { RoamError } from "./types";
import { updateActiveBlock } from "./writes";

/**
 * TODO: Replace this paradigm with an attr config instead.
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
  mutationCallback: (mutationList: MutationRecord[]) => void
): void =>
  createDivObserver(
    mutationCallback,
    document.getElementsByClassName("roam-body")[0]
  );

export const createOverlayObserver = (
  mutationCallback: (mutationList?: MutationRecord[]) => void
): void => createDivObserver(mutationCallback, document.body);

const createDivObserver = (
  mutationCallback: (mutationList: MutationRecord[]) => void,
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
}: {
  callback: (b: HTMLElement) => void;
  tag: string;
  className: string;
  removeCallback?: (b: HTMLElement) => void;
}): void => {
  const blocks = document.getElementsByClassName(
    className
  ) as HTMLCollectionOf<HTMLElement>;
  Array.from(blocks).forEach(callback);

  createObserver((ms) => {
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
  shortcut,
  attribute,
  render,
}: {
  shortcut: string;
  attribute: string;
  render: (b: HTMLButtonElement) => void;
}): void =>
  createHTMLObserver({
    callback: (b) => {
      if (
        b.innerText.toUpperCase() ===
          attribute.toUpperCase().replace("-", " ") ||
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
  });

export const createHashtagObserver = ({
  callback,
  attribute,
}: {
  callback: (s: HTMLSpanElement) => void;
  attribute: string;
}): void =>
  createHTMLObserver({
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

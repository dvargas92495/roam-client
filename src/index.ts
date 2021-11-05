import axios from "axios";
import { addStyle, BLOCK_REF_REGEX } from "./dom";
import { getOrderByBlockUid, getPageUidByPageTitle } from "./queries";
import {
  RoamBlock,
  ClientParams,
  TextNode,
  WriteAction,
  ViewType,
  SidebarWindowInput,
  SidebarWindow,
  SidebarAction,
  PullBlock,
  InputTextNode,
} from "./types";
export {
  updateActiveBlock,
  clearBlockById,
  clearBlockByUid,
  createPage,
  createBlock,
  updateBlock,
  deleteBlock,
  openBlockInSidebar,
} from "./writes";
export { default as RestClient } from "./rest-client";
export { default as WindowClient } from "./window-client";
export {
  getAllBlockUids,
  getAllBlockUidsAndTexts,
  getAllPageNames,
  getBasicTreeByParentUid,
  getBlockUidsByPageTitle,
  getBlockUidsWithParentUid,
  getBlockUidAndTextIncludingText,
  getBlockUidsAndTextsReferencingPage,
  getBlockUidByTextOnPage,
  getBlockUidsReferencingBlock,
  getBlockUidsReferencingPage,
  getChildrenLengthByPageUid,
  getCreateTimeByBlockUid,
  getDisplayNameByEmail,
  getDisplayNameByUid,
  getEditTimeByBlockUid,
  getEditedUserEmailByBlockUid,
  getFirstChildTextByBlockUid,
  getFirstChildUidByBlockUid,
  getFullTreeByParentUid,
  getLinkedPageReferences,
  getLinkedPageTitlesUnderUid,
  getNthChildUidByBlockUid,
  getPageTitleByBlockUid,
  getPageTitleByPageUid,
  getPageTitleReferencesByPageTitle,
  getPageTitlesAndBlockUidsReferencingPage,
  getPageTitlesAndUidsDirectlyReferencingPage,
  getPageTitlesReferencingBlockUid,
  getPageTitlesStartingWithPrefix,
  getPageUidByPageTitle,
  getPageViewType,
  getParentTextByBlockUid,
  getParentTextByBlockUidAndTag,
  getParentUidByBlockUid,
  getParentUidsOfBlockUid,
  getSettingsByEmail,
  getShallowTreeByParentUid,
  getTextByBlockUid,
  getTreeByBlockUid,
  getTreeByPageName,
  fixViewType,
  isTagOnPage,
  normalizePageTitle,
} from "./queries";
export {
  DAILY_NOTE_PAGE_REGEX,
  DAILY_NOTE_PAGE_TITLE_REGEX,
  parseRoamDate,
  parseRoamDateUid,
  toRoamDate,
  toRoamDateUid,
} from "./date";
export {
  addBlockCommand,
  addButtonListener,
  addOldRoamJSDependency,
  addRoamJSDependency,
  addStyle,
  BLOCK_REF_REGEX,
  createBlockObserver,
  createButtonObserver,
  createHashtagObserver,
  createHTMLObserver,
  createIconButton,
  createObserver,
  createOverlayObserver,
  createPageObserver,
  createPageTitleObserver,
  genericError,
  getActiveUids,
  getBlockUidFromTarget,
  getCurrentPageUid,
  getDropUidOffset,
  getPageTitleByHtmlElement,
  getPageTitleValueByHtmlElement,
  getReferenceBlockUid,
  getRoamUrl,
  getRoamUrlByPage,
  getUids,
  getUidsFromButton,
  getUidsFromId,
  openBlock,
  parseRoamBlocksToHtml,
  resolveRefs,
} from "./dom";
export { watchOnce } from "./events";
export { RoamBlock, ViewType, getOrderByBlockUid, TextNode, PullBlock };
export {
  RoamNode,
  InputTextNode,
  TreeNode,
  UserSettings,
  RoamBasicNode,
} from "./types";
export { parseInline, RoamContext as RoamMarkedContext } from "roam-marked";

declare global {
  interface Window {
    roamAlphaAPI: {
      q: (query: string, ...params: any[]) => any[][];
      pull: (selector: string, id: number | string) => PullBlock;
      createBlock: WriteAction;
      updateBlock: WriteAction;
      createPage: WriteAction;
      moveBlock: WriteAction;
      deleteBlock: WriteAction;
      updatePage: WriteAction;
      deletePage: WriteAction;
      util: {
        generateUID: () => string;
      };
      data: {
        addPullWatch: (
          pullPattern: string,
          entityId: string,
          callback: (before: PullBlock, after: PullBlock) => void
        ) => boolean;
        block: {
          create: WriteAction;
          update: WriteAction;
          move: WriteAction;
          delete: WriteAction;
        };
        page: {
          create: WriteAction;
          update: WriteAction;
          delete: WriteAction;
        };
        pull: (selector: string, id: number) => PullBlock;
        q: (query: string, ...params: any[]) => any[][];
        removePullWatch: (
          pullPattern: string,
          entityId: string,
          callback: (before: PullBlock, after: PullBlock) => void
        ) => boolean;
        redo: () => void;
        undo: () => void;
        user: {
          upsert: () => void;
        };
      };
      ui: {
        rightSidebar: {
          open: () => void;
          close: () => void;
          getWindows: () => SidebarWindow[];
          addWindow: SidebarAction;
          setWindowOrder: (action: {
            window: SidebarWindowInput & { order: number };
          }) => boolean;
          collapseWindow: SidebarAction;
          pinWindow: SidebarAction;
          expandWindow: SidebarAction;
          removeWindow: SidebarAction;
          unpinWindow: SidebarAction;
        };
        commandPalette: {
          addCommand: (action: { label: string; callback: () => void }) => void;
          removeCommand: (action: { label: string }) => void;
        };
        blockContextMenu: {
          addCommand: (action: {
            label: string;
            callback: (props: {
              "block-string": string;
              "block-uid": string;
              heading: 0 | 1 | 2 | 3 | null;
              "page-uid": string;
              "read-only?": boolean;
              "window-id": string;
            }) => void;
          }) => void;
          removeCommand: (action: { label: string }) => void;
        };
        getFocusedBlock: () => null | {
          "window-id": string;
          "block-uid": string;
        };
        components: {
          renderBlock: (args: { uid: string; el: HTMLElement }) => null;
        };
        mainWindow: {
          openBlock: (p: { block: { uid: string } }) => true;
          openPage: (p: { page: { uid: string } | { title: string } }) => true;
        };
      };
    };
    roamDatomicAlphaAPI?: (
      params: ClientParams
    ) => Promise<RoamBlock & { success?: boolean }>;
    // roamjs namespace should only be used for methods that must be accessed across extension scripts
    roamjs?: {
      loaded: Set<string>;
      extension: {
        [id: string]: {
          [method: string]: (args?: unknown) => void;
        };
      };
      version: { [id: string]: string };
      // DEPRECATED remove in 2.0
      dynamicElements: Set<HTMLElement>;
    };
    roam42?: {
      smartBlocks?: {
        customCommands: {
          key: string; // `<% ${string} %> (SmartBlock function)`, sad - https://github.com/microsoft/TypeScript/issues/13969
          icon: "gear";
          value: string;
          processor: (match: string) => Promise<string | void>;
        }[];
        activeWorkflow: {
          outputAdditionalBlock: (text: string) => void;
        };
      };
    };
  }
}

const toAttributeValue = (s: string) =>
  (s.trim().startsWith("{{or: ")
    ? s.substring("{{or: ".length, s.indexOf("|"))
    : s
  ).trim();

export const getAttrConfigFromQuery = (query: string) => {
  const pageResults = window.roamAlphaAPI.q(query);
  if (pageResults.length === 0) {
    return {};
  }
  const resultAsBlock = pageResults[0][0] as RoamBlock;
  if (!resultAsBlock.attrs) {
    return {};
  }

  const configurationAttrRefs = resultAsBlock.attrs.map(
    (a: any) => a[2].source[1]
  );
  const entries = configurationAttrRefs.map(
    (r: string) =>
      (window.roamAlphaAPI.q(
        `[:find (pull ?e [:block/string]) :where [?e :block/uid "${r}"] ]`
      )[0]?.[0]?.string as string)
        ?.split("::")
        .map(toAttributeValue) || [r, "undefined"]
  );
  return Object.fromEntries(entries);
};

const ATTR_REGEX = /^(.*?)::(.*?)$/;
export const getAttrConfigFromUid = (uid: string) => {
  const allAttrs = window.roamAlphaAPI
    .q(
      `[:find (pull ?c [:block/string]) :where [?b :block/uid "${uid}"] [?c :block/parents ?b] [?c :block/refs]]`
    )
    .map((a) => a?.[0]?.string as string)
    .filter((a) => ATTR_REGEX.test(a))
    .map((r) =>
      (ATTR_REGEX.exec(r) || ["", "", ""]).slice(1, 3).map(toAttributeValue)
    )
    .filter(([k]) => !!k);
  return Object.fromEntries(allAttrs);
};

export const getConfigFromPage = (inputPage?: string) => {
  const page =
    inputPage ||
    document.getElementsByClassName("rm-title-display")[0]?.textContent;
  if (!page) {
    return {};
  }
  return getAttrConfigFromUid(getPageUidByPageTitle(page));
};

export const pushBullets = (
  bullets: string[],
  blockUid: string,
  parentUid: string
) => {
  const blockIndex = getOrderByBlockUid(blockUid);
  for (let index = 0; index < bullets.length; index++) {
    const bullet = bullets[index];
    if (index === 0) {
      window.roamAlphaAPI.updateBlock({
        block: {
          uid: blockUid,
          string: bullet,
        },
      });
    } else {
      window.roamAlphaAPI.createBlock({
        block: {
          string: bullet,
        },
        location: {
          "parent-uid": parentUid,
          order: blockIndex + index,
        },
      });
    }
  }
};

const getCurrentUser = (): string[] => {
  const globalAppState = JSON.parse(
    localStorage.getItem("globalAppState") || '["","",[]]'
  ) as (string | string[])[];
  const userIndex = globalAppState.findIndex((s) => s === "~:user");
  if (userIndex > 0) {
    return globalAppState[userIndex + 1] as string[];
  }
  return [];
};

export const getCurrentUserEmail = () => {
  const userArray = getCurrentUser();
  const emailIndex = userArray.findIndex((s) => s === "~:email");
  if (emailIndex > 0) {
    return userArray[emailIndex + 1];
  }
  return "";
};

export const getCurrentUserUid = () => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:uid");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1];
  }
  return "";
};

export const getCurrentUserDisplayName = () => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:display-name");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1] || "";
  }
  return "";
};

export const extractTag = (tag: string): string =>
  tag.startsWith("#[[") && tag.endsWith("]]")
    ? tag.substring(3, tag.length - 2)
    : tag.startsWith("[[") && tag.endsWith("]]")
    ? tag.substring(2, tag.length - 2)
    : tag.startsWith("#")
    ? tag.substring(1)
    : tag.endsWith("::")
    ? tag.substring(0, tag.length - 2)
    : tag;

export const extractRef = (ref: string): string =>
  new RegExp(
    `(?:\\(\\()?${BLOCK_REF_REGEX.source.slice(4, -4)}(?:\\)\\))?`
  ).exec(ref)?.[1] || ref;

export const toConfig = (id: string) => `roam/js/${id}`;

export const getGraph = (): string =>
  /^#\/app\/([^/]*?)(?:\/page\/.{9,10})?$/.exec(window.location.hash)?.[1] ||
  "";

export const localStorageSet = (key: string, val: string) =>
  localStorage.setItem(`roamjs:${key}:${getGraph()}`, val);

export const localStorageGet = (key: string) =>
  localStorage.getItem(`roamjs:${key}:${getGraph()}`);

export const localStorageRemove = (key: string) =>
  localStorage.removeItem(`roamjs:${key}:${getGraph()}`);

export const runExtension = async (
  extensionId: string,
  run: () => void,
  options: { skipAnalytics?: boolean } = {}
): Promise<void> => {
  if (window.roamjs?.loaded?.has?.(extensionId)) {
    return;
  }
  window.roamjs = {
    loaded: window.roamjs?.loaded || new Set(),
    extension: window.roamjs?.extension || {},
    version: window.roamjs?.version || {},
    dynamicElements: window.roamjs?.dynamicElements || new Set(),
  };
  window.roamjs.loaded.add(extensionId);
  window.roamjs.version[extensionId] = process.env.ROAMJS_VERSION || "";

  if (!options.skipAnalytics) {
    axios.post(`https://api.roamjs.com/mixpanel`, {
      eventName: "Load Extension",
      properties: { extensionId },
    });
  }
  addStyle(
    `.bp3-button:focus {
  outline-width: 2px;
}`,
    "roamjs-default"
  );

  run();
};

// @DEPRECATED - PART OF SMARTBLOCKS V1, USE BELOW
export const createCustomSmartBlockCommand = ({
  command,
  processor,
}: {
  command: string;
  processor: (afterColon?: string) => Promise<string>;
}): void => {
  const inputListener = () => {
    if (window.roam42 && window.roam42.smartBlocks) {
      const value = `<%${command.toUpperCase()}(:.*)?%>`;
      window.roam42.smartBlocks.customCommands.push({
        key: `<% ${command.toUpperCase()} %> (SmartBlock function)`,
        icon: "gear",
        processor: (match: string) => {
          const colonPrefix = `<%${command.toUpperCase()}:`;
          if (match.startsWith(colonPrefix)) {
            const afterColon = match.replace("<%${}:", "").replace("%>", "");
            return processor(afterColon);
          } else {
            return processor();
          }
        },
        value,
      });
      document.removeEventListener("input", inputListener);
    }
  };
  document.addEventListener("input", inputListener);
};

type CommandOutput = string | string[] | InputTextNode[];
type CommandHandler = (
  ...args: string[]
) => CommandOutput | Promise<CommandOutput>;
export const registerSmartBlocksCommand = ({
  text: inputText,
  handler,
}: {
  text: string;
  handler: (u: unknown) => CommandHandler;
}) => {
  const text = inputText.toUpperCase();
  const register = (retry: number): void | number | false =>
    window.roamjs?.extension?.smartblocks?.registerCommand
      ? window.roamjs.extension.smartblocks.registerCommand({
          text,
          handler,
        })
      : retry === 120 && window.roamjs
      ? !(window.roamjs = {
          ...window.roamjs,
          extension: {
            ...window.roamjs.extension,
            [text]: {
              ...window.roamjs.extension[text],
              registerSmartBlocksCommand: () => {
                window.roamjs?.extension.smartblocks.registerCommand({
                  text,
                  handler,
                });
              },
            },
          },
        })
      : window.setTimeout(() => register(retry + 1), 1000);
  register(0);
};

export const createTagRegex = (tag: string) =>
  new RegExp(`#?\\[\\[${tag}\\]\\]|#${tag}`);

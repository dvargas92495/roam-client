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
} from "./types";
export {
  updateActiveBlock,
  clearBlockById,
  clearBlockByUid,
  createPage,
  createBlock,
  updateBlock,
  deleteBlock,
} from "./writes";
export { default as RestClient } from "./rest-client";
export { default as WindowClient } from "./window-client";
export {
  getAllBlockUids,
  getAllBlockUidsAndTexts,
  getAllPageNames,
  getBlockUidsByPageTitle,
  getBlockUidAndTextIncludingText,
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
  getLinkedPageReferences,
  getLinkedPageTitlesUnderUid,
  getNthChildUidByBlockUid,
  getPageTitleByBlockUid,
  getPageTitleByPageUid,
  getPageTitleReferencesByPageTitle,
  getPageTitlesAndBlockUidsReferencingPage,
  getPageTitlesReferencingBlockUid,
  getPageTitlesStartingWithPrefix,
  getPageUidByPageTitle,
  getPageViewType,
  getParentTextByBlockUid,
  getParentTextByBlockUidAndTag,
  getParentUidByBlockUid,
  getSettingsByEmail,
  getShallowTreeByParentUid,
  getTextByBlockUid,
  getTreeByBlockUid,
  getTreeByPageName,
  fixViewType,
  TreeNode,
} from "./queries";
export {
  DAILY_NOTE_PAGE_REGEX,
  parseRoamDate,
  parseRoamDateUid,
  toRoamDate,
  toRoamDateUid,
} from "./date";
export {
  addBlockCommand,
  addButtonListener,
  BLOCK_REF_REGEX,
  createBlockObserver,
  createButtonObserver,
  createHashtagObserver,
  createHTMLObserver,
  createIconButton,
  createObserver,
  createOverlayObserver,
  createPageObserver,
  genericError,
  getActiveUids,
  getBlockUidFromTarget,
  getCurrentPageUid,
  getRoamUrl,
  getRoamUrlByPage,
  getUids,
  getUidsFromButton,
  getUidsFromId,
  openBlock,
  parseRoamBlocksToHtml,
} from "./dom";
export { watchOnce } from "./events";
export { RoamBlock, ViewType, getOrderByBlockUid, TextNode, PullBlock };
export { RoamNode, InputTextNode } from "./types";
export { parseInline } from "roam-marked";

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
      };
    };
    roamDatomicAlphaAPI?: (
      params: ClientParams
    ) => Promise<RoamBlock & { success?: boolean }>;
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
        `[:find ?s :where [?e :block/string ?s] [?e :block/uid "${r}"] ]`
      )[0][0] as string)
        ?.split("::")
        .map(toAttributeValue) || [r, "undefined"]
  );
  return Object.fromEntries(entries);
};

const ATTR_REGEX = /^(.*?)::(.*?)$/;
export const getAttrConfigFromUid = (uid: string) => {
  const allAttrs = window.roamAlphaAPI
    .q(
      `[:find ?s :where [?c :block/string ?s] [?c :block/refs] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((a) => a[0] as string)
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

export const toConfig = (id: string) => `roam/js/${id}`;

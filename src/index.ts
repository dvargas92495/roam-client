import {
  getOrderByBlockUid,
  getPageTitleByPageUid,
  getPageUidByPageTitle,
} from "./queries";
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
  getBlockUidByTextOnPage,
  getBlockUidsReferencingPage,
  getCreateTimeByBlockUid,
  getDisplayNameByEmail,
  getEditTimeByBlockUid,
  getEditedUserEmailByBlockUid,
  getFirstChildUidByBlockUid,
  getLinkedPageReferences,
  getNthChildUidByBlockUid,
  getPageTitleByBlockUid,
  getPageTitleByPageUid,
  getPageTitleReferencesByPageTitle,
  getPageTitlesAndBlockUidsReferencingPage,
  getPageTitlesReferencingBlockUid,
  getPageUidByPageTitle,
  getPageViewType,
  getParentTextByBlockUid,
  getParentTextByBlockUidAndTag,
  getParentUidByBlockUid,
  getSettingsByEmail,
  getTextByBlockUid,
  getTreeByBlockUid,
  getTreeByPageName,
  fixViewType,
  TreeNode,
} from "./queries";
export {
  parseRoamDate,
  parseRoamDateUid,
  toRoamDate,
  toRoamDateUid,
} from "./date";
export {
  addButtonListener,
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
  getUids,
  getUidsFromButton,
  getUidsFromId,
} from "./dom";
export { watchOnce } from "./events";
export { RoamBlock, ViewType, getOrderByBlockUid, TextNode, PullBlock };
export { RoamNode } from "./types";

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

type Attrs = [
  { source: string[]; value: string[] },
  { source: string[]; value: string[] },
  { source: string[]; value: string }
];

export const getAttrConfigFromUid = (uid: string) => {
  const rootAttrs = window.roamAlphaAPI.q(
    `[:find ?a :where [?b :entity/attrs ?a] [?b :block/uid "${uid}"]]`
  )?.[0]?.[0] as Attrs[];
  const childAttrs = window.roamAlphaAPI.q(
    `[:find ?a :where [?c :entity/attrs ?a] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
  )?.[0]?.[0] as Attrs[];
  if (!rootAttrs && !childAttrs) {
    return {};
  }
  const allAttrs = [...(rootAttrs || []), ...(childAttrs || [])];

  const entries = allAttrs.map((r) =>
    [getPageTitleByPageUid(r[1].value[1]) || '', r[2].value || ''].map(toAttributeValue)
  );
  return Object.fromEntries(entries);
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

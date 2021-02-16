import { getOrderByBlockUid, getParentUidByBlockUid } from "./queries";
import { RoamBlock, ClientParams, WriteAction, ViewType } from "./types";
export { updateActiveBlock, clearBlockById, clearBlockByUid } from "./writes";
export { default as RestClient } from "./rest-client";
export { default as WindowClient } from "./window-client";
export {
  getCreateTimeByBlockUid,
  getDisplayNameByEmail,
  getEditTimeByBlockUid,
  getEditedUserEmailByBlockUid,
  getLinkedPageReferences,
  getPageTitleByBlockUid,
  getPageTitleByPageUid,
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
export { parseRoamDate, toRoamDate, toRoamDateUid } from "./date";
export {
  addButtonListener,
  createIconButton,
  genericError,
  getActiveUids,
  getUids,
  getUidsFromButton,
  getUidsFromId,
} from "./dom";
export { RoamBlock, ViewType, getOrderByBlockUid };
import randomstring from "randomstring";

declare global {
  interface Window {
    roamAlphaAPI: {
      q: (query: string) => any[][];
      pull: (
        selector: string,
        id: number
      ) => {
        ":block/children"?: { ":db/id": number }[];
        ":block/string"?: string;
        ":block/order"?: number;
        ":block/uid"?: string;
        ":block/heading"?: number;
        ":block/open"?: boolean;
        ":children/view-type"?: `:${ViewType}`;
        ":block/props"?: any;
      };
      createBlock: WriteAction;
      updateBlock: WriteAction;
      createPage: WriteAction;
      moveBlock: WriteAction;
      deleteBlock: WriteAction;
      updatePage: WriteAction;
      deletePage: WriteAction;
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

export const getConfigFromPage = (inputPage?: string) => {
  const page =
    inputPage ||
    document.getElementsByClassName("rm-title-display")[0]?.textContent;
  if (!page) {
    return {};
  }
  return getAttrConfigFromQuery(
    `[:find (pull ?e [*]) :where [?e :node/title "${page}"] ]`
  );
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

const NUM = "1234567890-_";
const ALPHA = "qwertyuiopasdfghjklzxcvbnm";
export const generateBlockUid = () =>
  randomstring.generate({
    length: 9,
    charset: `${ALPHA}${ALPHA.toUpperCase()}${NUM}`,
  });

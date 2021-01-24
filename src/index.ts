import { AxiosError } from "axios";
import { getActiveUids } from "./dom";
import { getOrderByBlockUid } from "./queries";
import { RoamBlock, RoamError, ClientParams, WriteAction } from "./types";
export { default as RestClient } from "./rest-client";
export { default as WindowClient } from "./window-client";
export { getLinkedPageReferences } from "./queries";
export { parseRoamDate, toRoamDate, toRoamDateUid } from "./date";
export {
  addButtonListener,
  createIconButton,
  getActiveUids,
  getUids,
  getUidsFromButton,
  getUidsFromId,
} from "./dom";

declare global {
  interface Window {
    roamAlphaAPI: {
      q: (query: string) => (RoamBlock | string | number)[][];
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
        ":children/view-type"?: ":bullet" | ":document" | ":numbered";
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

export const genericError = (e: Partial<AxiosError & RoamError>) => {
  const message =
    (e.response
      ? typeof e.response.data === "string"
        ? e.response.data
        : JSON.stringify(e.response.data)
      : e.message) ||
    e.raw ||
    "Unknown Error Occurred";
  window.roamAlphaAPI.updateBlock({block: {
    uid: getActiveUids().blockUid,
    string: `Error: ${message.length > 50 ? `${message.substring(0, 50)}...` : message}`
  }});
};

const toAttributeValue = (s: string) =>
  (s.trim().startsWith("{{or: ")
    ? s.substring("{{or: ".length, s.indexOf("|"))
    : s
  ).trim();

export const getAttrConfigFromQuery = (query: string) => {
  const pageResults = window.roamAlphaAPI.q(query);
  const resultAsBlock = pageResults[0][0] as RoamBlock;
  if (pageResults.length === 0 || !resultAsBlock.attrs) {
    return {};
  }

  const configurationAttrRefs = resultAsBlock.attrs.map(
    (a: any) => a[2].source[1]
  );
  const entries = configurationAttrRefs.map(
    (r: string) =>
      (window.roamAlphaAPI.q(
        `[:find (pull ?e [:block/string]) :where [?e :block/uid "${r}"] ]`
      )[0][0] as RoamBlock).string
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
          order: blockIndex + index + 1,
        },
      });
    }
  }
};

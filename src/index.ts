import { fireEvent, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { waitForString } from "./dom-testing";
import { RoamBlock, RoamError, ClientParams } from "./types";
export { default as RestClient } from "./rest-client";
export { default as WindowClient } from "./window-client";
export { parseRoamDate, toRoamDate, toRoamDateUid } from "./date";
export {
  addButtonListener,
  createIconButton,
  getUids,
  getUidsFromButton,
} from "./dom";
export { openBlock } from "./user-event";

declare global {
  interface Window {
    roamAlphaAPI: {
      q: (query: string) => RoamBlock[][];
      pull: (
        selector: string,
        id: number
      ) => {
        ":block/children"?: { ":db/id": number }[];
        ":block/string"?: string;
        ":block/order"?: number;
      };
    };
    roamDatomicAlphaAPI?: (
      params: ClientParams
    ) => Promise<RoamBlock & { success?: boolean }>;
  }
}

export const asyncType = async (text: string) =>
  document.activeElement &&
  (await userEvent.type(document.activeElement, text, {
    skipClick: true,
  }));

export const genericError = (e: Partial<AxiosError & RoamError>) => {
  const message =
    (e.response
      ? typeof e.response.data === "string"
        ? e.response.data
        : JSON.stringify(e.response.data)
      : e.message) ||
    e.raw ||
    "Unknown Error Occurred";
  asyncType(
    `Error: ${message.length > 50 ? `${message.substring(0, 50)}...` : message}`
  );
};

const toAttributeValue = (s: string) =>
  (s.trim().startsWith("{{or: ")
    ? s.substring("{{or: ".length, s.indexOf("|"))
    : s
  ).trim();

export const getAttrConfigFromQuery = (query: string) => {
  const pageResults = window.roamAlphaAPI.q(query);
  if (pageResults.length === 0 || !pageResults[0][0].attrs) {
    return {};
  }

  const configurationAttrRefs = pageResults[0][0].attrs.map(
    (a: any) => a[2].source[1]
  );
  const entries = configurationAttrRefs.map(
    (r: string) =>
      window.roamAlphaAPI
        .q(
          `[:find (pull ?e [:block/string]) :where [?e :block/uid "${r}"] ]`
        )[0][0]
        .string?.split("::")
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

export const newBlockEnter = async () => {
  if (!document.activeElement) {
    return;
  }

  // Need to switch to fireEvent because user-event enters a newline when hitting enter in a text area
  // https://github.com/testing-library/user-event/blob/master/src/type.js#L505
  const enterObj = {
    key: "Enter",
    keyCode: 13,
    which: 13,
  };
  await fireEvent.keyDown(document.activeElement, enterObj);
  await fireEvent.keyUp(document.activeElement, enterObj);
  await waitForString("");
};

export const pushBullets = async (
  bullets: string[],
  blockUid?: string,
  parentUid?: string
) => {
  if (window.roamDatomicAlphaAPI && blockUid && parentUid) {
    const parent = await window.roamDatomicAlphaAPI({
      action: "pull",
      selector: "[:block/children]",
      uid: parentUid,
    });
    const block = await window.roamDatomicAlphaAPI({
      action: "pull",
      selector: "[:db/id]",
      uid: blockUid,
    });
    const blockIndex =
      parent.children?.findIndex((c) => c.id === block.id) || 0;
    for (let index = 0; index < bullets.length; index++) {
      const bullet = bullets[index];
      if (index === 0) {
        await window.roamDatomicAlphaAPI({
          action: "update-block",
          block: {
            uid: blockUid,
            string: bullet,
          },
        });
      } else {
        await window.roamDatomicAlphaAPI({
          action: "create-block",
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
  } else {
    for (let index = 0; index < bullets.length; index++) {
      const bullet = bullets[index];
      await asyncType(bullet);
      await waitForString(bullet);

      if (index < bullets.length - 1) {
        await newBlockEnter();
      }
    }
  }
};

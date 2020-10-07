import { fireEvent, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import parse from "date-fns/parse";

declare global {
  interface Window {
    roamAlphaAPI: {
      q: (
        query: string
      ) => {
        attrs?: { source: string[] }[][];
        string?: string;
      }[][];
    };
    roamDatomicAlphaAPI: (params: {
      action: "pull" | "q" | "create-block" | "update-block";
      selector?: string;
      uid?: string;
      query?: string;
      inputs?: any;
      location?: {
        "parent-uid": string;
        order: number;
      };
      block?: {
        string: string;
        uid?: string;
        open?: boolean;
      };
    }) => Promise<{
      children?: { id: number }[];
      id?: number;
      string?: string;
    }>;
  }
}

type RoamError = {
  raw: string;
  "status-code": number;
};

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
        .map((s: string) => s.trim()) || [r, "undefined"]
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

export const parseRoamDate = (s: string) =>
  parse(s, "MMMM do, yyyy", new Date());

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
    for (const index in bullets) {
      const bullet = bullets[index];
      if (index === "0") {
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
            order: blockIndex + parseInt(index) + 1,
          },
        });
      }
    }
  } else {
    for (const index in bullets) {
      const bullet = bullets[index];
      await asyncType(bullet);
      await waitForString(bullet);

      if (parseInt(index) < bullets.length - 1) {
        await newBlockEnter();
      }
    }
  }
};

const waitForString = (text: string) =>
  waitFor(
    () => {
      const textArea = document.activeElement as HTMLTextAreaElement;
      if (textArea?.value == null) {
        throw new Error(
          `Textarea is undefined. Active Element ${textArea.tagName}. Input text ${text}`
        );
      }

      let expectedTextWithoutPeriod = text.replace(/\./g, "").toUpperCase();
      let actualTextWithoutPeriod = textArea.value
        .replace(/\./g, "")
        .toUpperCase();

      // relaxing constraint for equality because there is an issue with periods.
      // in some cases, userEvent.type doesn't type the periods.
      if (actualTextWithoutPeriod !== expectedTextWithoutPeriod) {
        throw new Error("Typing not complete");
      }
    },
    {
      timeout: 5000,
    }
  );

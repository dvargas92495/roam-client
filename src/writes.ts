import {
  DAILY_NOTE_PAGE_TITLE_REGEX,
  parseRoamDate,
  toRoamDateUid,
} from "./date";
import { getActiveUids, getUidsFromId } from "./dom";
import { InputTextNode } from "./types";

export const updateActiveBlock = (text: string) =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid: getActiveUids().blockUid,
      string: text,
    },
  });

export const clearBlockById = (id: string) =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid: getUidsFromId(id).blockUid,
      string: "",
    },
  });

export const clearBlockByUid = (uid: string) =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid,
      string: "",
    },
  });

export const createBlock = ({
  node: {
    text,
    children = [],
    uid = window.roamAlphaAPI.util.generateUID(),
    heading,
    viewType,
    alignment,
  },
  parentUid,
  order = 0,
}: {
  node: InputTextNode;
  parentUid: string;
  order?: number;
}) => {
  window.roamAlphaAPI.createBlock({
    location: { "parent-uid": parentUid, order },
    block: {
      uid,
      string: text,
      heading,
      alignment,
      "children-view-type": viewType,
    },
  });
  children.forEach((n, o) =>
    createBlock({ node: n, parentUid: uid, order: o })
  );
  return uid;
};

export const createPage = ({
  title,
  tree = [],
}: {
  title: string;
  tree?: InputTextNode[];
}): string => {
  const uid = DAILY_NOTE_PAGE_TITLE_REGEX.test(title)
    ? toRoamDateUid(parseRoamDate(title))
    : window.roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createPage({ page: { title, uid } });
  tree.forEach((node, order) => createBlock({ node, parentUid: uid, order }));
  return uid;
};

export const updateBlock = ({
  text,
  uid,
  heading,
  alignment,
  viewType,
}: { uid: string } & Omit<InputTextNode, "children">) => {
  window.roamAlphaAPI.updateBlock({
    block: {
      string: text,
      uid,
      heading,
      alignment,
      "children-view-type": viewType,
    },
  });
  return uid;
};

export const deleteBlock = (uid: string) => {
  window.roamAlphaAPI.deleteBlock({ block: { uid } });
  return uid;
};

export const openBlockInSidebar = (blockUid: string): boolean | void =>
  window.roamAlphaAPI.ui.rightSidebar
    .getWindows()
    .some((w) => w.type === "block" && w["block-uid"] === blockUid)
    ? window.roamAlphaAPI.ui.rightSidebar.open()
    : window.roamAlphaAPI.ui.rightSidebar.addWindow({
        window: {
          type: "block",
          "block-uid": blockUid,
        },
      });

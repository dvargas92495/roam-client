import { getActiveUids, getUidsFromId } from "./dom";
import { InputTextNode, TextNode } from "./types";

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
  node,
  parentUid,
  order = 0,
}: {
  node: InputTextNode;
  parentUid: string;
  order?: number;
}) => {
  const uid = window.roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createBlock({
    location: { "parent-uid": parentUid, order },
    block: { uid, string: node.text },
  });
  (node.children || []).forEach((n, o) =>
    createBlock({ node: n, parentUid: uid, order: o })
  );
  return uid;
};

export const createPage = ({
  title,
  tree,
}: {
  title: string;
  tree: InputTextNode[];
}): string => {
  const uid = window.roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createPage({ page: { title, uid } });
  tree.forEach((node, order) => createBlock({ node, parentUid: uid, order }));
  return uid;
};

export const updateBlock = ({ text, uid }: { text: string; uid: string }) => {
  window.roamAlphaAPI.updateBlock({ block: { string: text, uid } });
  return uid;
};

export const deleteBlock = (uid: string) => {
  window.roamAlphaAPI.deleteBlock({ block: { uid } });
  return uid;
};

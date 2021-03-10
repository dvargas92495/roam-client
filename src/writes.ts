import { getActiveUids, getUidsFromId } from "./dom";

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

type TextNode = {
  text: string;
  children: TextNode[];
};

const createBlock = ({
  node,
  parentUid,
  order,
}: {
  node: TextNode;
  parentUid: string;
  order: number;
}) => {
  const uid = window.roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createBlock({
    location: { "parent-uid": parentUid, order },
    block: { uid, string: node.text },
  });
  node.children.forEach((n, o) =>
    createBlock({ node: n, parentUid: uid, order: o })
  );
};

export const createPage = ({
  title,
  tree,
}: {
  title: string;
  tree: TextNode[];
}): void => {
  const uid = window.roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createPage({ page: { title, uid } });
  tree.forEach((node, order) => createBlock({ node, parentUid: uid, order }));
};

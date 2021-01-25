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

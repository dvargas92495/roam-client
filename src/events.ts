import { PullBlock } from "./types";

export const watchOnce = (
  pullPattern: string,
  entityId: string,
  callback: (before: PullBlock, after: PullBlock) => boolean
) => {
  const watcher = (before: PullBlock, after: PullBlock) => {
    if (callback(before, after)) {
      window.roamAlphaAPI.data.removePullWatch(pullPattern, entityId, watcher);
    }
  };
  window.roamAlphaAPI.data.addPullWatch(pullPattern, entityId, watcher);
};

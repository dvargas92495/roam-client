import { RoamBlock, ViewType } from "./types";

export const getLinkedPageReferences = (t: string): RoamBlock[] => {
  const findParentBlock: (b: RoamBlock) => RoamBlock = (b: RoamBlock) =>
    b.title
      ? b
      : findParentBlock(
          window.roamAlphaAPI.q(
            `[:find (pull ?e [*]) :where [?e :block/children ${b.id}]]`
          )[0][0] as RoamBlock
        );
  const parentBlocks = window.roamAlphaAPI
    .q(
      `[:find (pull ?parentPage [*]) :where [?parentPage :block/children ?referencingBlock] [?referencingBlock :block/refs ?referencedPage] [?referencedPage :node/title "${t.replace(
        /"/g,
        '\\"'
      )}"]]`
    )
    .filter((block) => block.length);
  return parentBlocks.map((b) =>
    findParentBlock(b[0] as RoamBlock)
  ) as RoamBlock[];
};

export const getOrderByBlockUid = (blockUid: string) =>
  window.roamAlphaAPI.q(
    `[:find ?o :where [?r :block/order ?o] [?r :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as number;

export const getParentUidByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find ?u :where [?p :block/uid ?u] [?p :block/children ?e] [?e :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string;

export type TreeNode = {
  text: string;
  order: number;
  children: TreeNode[];
  uid: string;
  heading: number;
  open: boolean;
  viewType: ViewType;
};

const getTreeByBlockId = (blockId: number): TreeNode => {
  const block = window.roamAlphaAPI.pull(
    "[:block/children, :block/string, :block/order, :block/uid, :block/heading, :block/open, :children/view-type]",
    blockId
  );
  const children = block[":block/children"] || [];
  return {
    text: block[":block/string"] || "",
    order: block[":block/order"] || 0,
    uid: block[":block/uid"] || "",
    children: children
      .map((c) => getTreeByBlockId(c[":db/id"]))
      .sort((a, b) => a.order - b.order),
    heading: block[":block/heading"] || 0,
    open: block[":block/open"] || true,
    viewType: block[":children/view-type"]?.substring(1) as ViewType,
  };
};

export const getTreeByBlockUid = (
  blockUid: string
): { text: string; children: TreeNode[] } => {
  const block = window.roamAlphaAPI.q(
    `[:find (pull ?e [:block/children, :block/string :children/view-type]) :where [?e :block/uid "${blockUid}"]]`
  )[0][0] as RoamBlock;
  const children = block.children || [];
  const viewType = block["view-type"] || "bullet";
  return {
    text: block.string || "",
    children: children
      .map((c) => getTreeByBlockId(c.id))
      .sort((a, b) => a.order - b.order)
      .map((c) => fixViewType({ c, v: viewType })),
  };
};

export const getTreeByPageName = (name: string): TreeNode[] => {
  const result = window.roamAlphaAPI.q(
    `[:find (pull ?e [:block/children :children/view-type]) :where [?e :node/title "${name}"]]`
  );
  if (!result.length) {
    return [];
  }
  const block = result[0][0] as RoamBlock;
  const children = block.children || [];
  const viewType = block["view-type"] || "bullet";
  return children
    .map((c) => getTreeByBlockId(c.id))
    .sort((a, b) => a.order - b.order)
    .map((c) => fixViewType({ c, v: viewType }));
};

export const fixViewType = ({
  c,
  v,
}: {
  c: TreeNode;
  v: ViewType;
}): TreeNode => {
  if (!c.viewType) {
    c.viewType = v;
  }
  c.children.forEach((cc) => fixViewType({ c: cc, v: c.viewType }));
  return c;
};

export const getEditedUserEmailByBlockUid = (blockUid: string) =>
  window.roamAlphaAPI.q(
    `[:find ?e :where [?u :user/email ?e] [?b :edit/user ?u] [?b :block/uid "${blockUid}"]]`
  )?.[0]?.[0] || "";

export const getTextByBlockUid = (uid: string): string =>
  window.roamAlphaAPI.q(
    `[:find ?s :where [?e :block/string ?s] [?e :block/uid "${uid}"]]`
  )?.[0]?.[0] || "";

import {
  RoamBasicNode,
  RoamBlock,
  RoamUnorderedBasicNode,
  TextAlignment,
  TreeNode,
  UserSettings,
  ViewType,
} from "./types";

export const normalizePageTitle = (title: string) =>
  title.replace(/\\/, "\\\\").replace(/"/g, '\\"');

export const allBlockMapper = (t: TreeNode): TreeNode[] => [
  t,
  ...t.children.flatMap(allBlockMapper),
];

// DEPRECATED - Remove for 2.0.0
export const getChildRefUidsByBlockUid = (b: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?r :block/uid ?u] [?e :block/refs ?r] [?e :block/uid "${b}"]]`
    )
    .map((r) => r[0] as string);

// DEPRECATED - Remove for 2.0.0
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
      `[:find (pull ?parentPage [*]) :where [?parentPage :block/children ?referencingBlock] [?referencingBlock :block/refs ?referencedPage] [?referencedPage :node/title "${normalizePageTitle(
        t
      )}"]]`
    )
    .filter((block) => block.length);
  return parentBlocks.map((b) =>
    findParentBlock(b[0] as RoamBlock)
  ) as RoamBlock[];
};

export const getPageTitleReferencesByPageTitle = (title: string) =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?b :node/title ?t] [?b :block/children ?c] [?c :block/refs ?r] [?r :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((p) => p[0] as string);

export const getOrderByBlockUid = (blockUid: string) =>
  window.roamAlphaAPI.q(
    `[:find ?o :where [?r :block/order ?o] [?r :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as number;

export const getParentUidByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find ?u :where [?p :block/uid ?u] [?p :block/children ?e] [?e :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string;

const getTreeByBlockId = (blockId: number): TreeNode => {
  const block = window.roamAlphaAPI.pull("[*]", blockId);
  const children = block[":block/children"] || [];
  const props = block[":block/props"] || {};
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
    editTime: new Date(block[":edit/time"] || 0),
    textAlign: block[":block/text-align"] || "left",
    props: {
      imageResize: Object.fromEntries(
        Object.keys(props[":image-size"] || {}).map((p) => [
          p,
          {
            height: props[":image-size"][p][":height"],
            width: props[":image-size"][p][":width"],
          },
        ])
      ),
      iframe: Object.fromEntries(
        Object.keys(props[":iframe"] || {}).map((p) => [
          p,
          {
            height: props[":iframe"][p][":size"][":height"],
            width: props[":iframe"][p][":size"][":width"],
          },
        ])
      ),
    },
  };
};

export const getTreeByBlockUid = (blockUid: string): TreeNode => {
  if (!blockUid) {
    return {
      text: "",
      order: 0,
      uid: "",
      children: [],
      heading: 0,
      open: true,
      viewType: "bullet",
      editTime: new Date(0),
      textAlign: "left",
      props: {
        imageResize: {},
        iframe: {},
      },
    };
  }
  const blockId = window.roamAlphaAPI.q(
    `[:find ?e :where [?e :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as number;
  return getTreeByBlockId(blockId);
};

export const getTreeByPageName = (name: string): TreeNode[] => {
  const result = window.roamAlphaAPI.q(
    `[:find (pull ?e [:block/children :children/view-type]) :where [?e :node/title "${normalizePageTitle(
      name
    )}"]]`
  );
  if (!result.length) {
    return [];
  }
  const block = result[0][0] as RoamBlock;
  const children = block?.children || [];
  const viewType = block?.["view-type"] || "bullet";
  return children
    .map((c) => getTreeByBlockId(c.id))
    .sort((a, b) => a.order - b.order)
    .map((c) => fixViewType({ c, v: viewType }));
};

// DEPRECATED - Remove for 2.0.0
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
    `[:find (pull ?e [:block/string]) :where [?e :block/uid "${uid}"]]`
  )?.[0]?.[0]?.string || "";

export const getPageTitleByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find (pull ?p [:node/title]) :where [?e :block/uid "${blockUid}"] [?e :block/page ?p]]`
  )?.[0]?.[0]?.title || "";

export const getPageTitleByPageUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find (pull ?p [:node/title]) :where [?p :block/uid "${blockUid}"]]`
  )?.[0]?.[0]?.title || "";

export const getParentTextByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find ?s :where [?p :block/string ?s] [?p :block/children ?e] [?e :block/uid "${blockUid}"]]`
  )?.[0]?.[0] || "";

export const getParentTextByBlockUidAndTag = ({
  blockUid,
  tag,
}: {
  blockUid: string;
  tag: string;
}) =>
  window.roamAlphaAPI.q(
    `[:find ?s :where [?p :block/string ?s] [?p :block/refs ?t] [?t :node/title "${tag}"] [?b :block/parents ?p] [?b :block/uid "${blockUid}"]]`
  )?.[0]?.[0] || "";

export const getSettingsByEmail = (email: string) =>
  (window.roamAlphaAPI.q(
    `[:find ?settings :where[?e :user/settings ?settings] [?e :user/email "${email}"]]`
  )?.[0]?.[0] as UserSettings) || {};

export const getDisplayNameByEmail = (email: string) =>
  (window.roamAlphaAPI.q(
    `[:find ?name :where[?e :user/display-name ?name] [?e :user/email "${email}"]]`
  )?.[0]?.[0] as string) || "";

export const getDisplayNameByUid = (uid: string): string =>
  window.roamAlphaAPI.q(
    `[:find ?s :where [?p :node/title ?s] [?e :user/display-page ?p] [?e :user/uid "${uid}"]]`
  )?.[0]?.[0] || "";

export const getCreateTimeByBlockUid = (uid: string): number =>
  window.roamAlphaAPI.q(
    `[:find ?t :where [?e :create/time ?t] [?e :block/uid "${uid}"]]`
  )?.[0]?.[0] as number;

export const getEditTimeByBlockUid = (uid: string): number =>
  window.roamAlphaAPI.q(
    `[:find ?t :where [?e :edit/time ?t] [?e :block/uid "${uid}"]]`
  )?.[0]?.[0] as number;

export const getAllPageNames = (): string[] =>
  window.roamAlphaAPI
    .q("[:find ?s :where [?e :node/title ?s]]")
    .map((b) => b[0] as string);

export const getAllBlockUids = (): string[] =>
  window.roamAlphaAPI
    .q(`[:find ?u :where [?e :block/uid ?u] [?e :block/string]]`)
    .map((f) => f[0]);

export const getAllBlockUidsAndTexts = (): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(`[:find ?u ?s :where [?e :block/uid ?u] [?e :block/string ?s]]`)
    .map((f) => ({ uid: f[0] as string, text: f[1] as string }));

export const getPageViewType = (title: string): ViewType =>
  (window.roamAlphaAPI.q(
    `[:find ?v :where [?e :children/view-type ?v] [?e :node/title "${normalizePageTitle(
      title
    )}"]]`
  )?.[0]?.[0] as ViewType) || "bullet";

export const getPageUidByPageTitle = (title: string): string =>
  (window.roamAlphaAPI.q(
    `[:find (pull ?e [:block/uid]) :where [?e :node/title "${normalizePageTitle(
      title
    )}"]]`
  )?.[0]?.[0]?.uid as string) || "";

export const getBlockUidAndTextIncludingText = (
  t: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u ?contents :where [?block :block/uid ?u] [?block :block/string ?contents][(clojure.string/includes? ?contents  "${t}")]]`
    )
    .map(([uid, text]: string[]) => ({ uid, text }));

export const getBlockUidsAndTextsReferencingPage = (
  title: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u ?s :where [?r :block/uid ?u] [?r :block/string ?s] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map(([uid, text]: string[]) => ({ uid, text }));

export const getBlockUidByTextOnPage = ({
  text,
  title,
}: {
  text: string;
  title: string;
}): string =>
  (window.roamAlphaAPI.q(
    `[:find ?u :where [?b :block/page ?p] [?b :block/uid ?u] [?b :block/string "${text}"] [?p :node/title "${title}"]]`
  )?.[0]?.[0] as string) || "";

export const getBlockUidsReferencingBlock = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?r :block/uid ?u] [?r :block/refs ?b] [?b :block/uid "${uid}"]]`
    )
    .map((s) => s[0]);

export const getBlockUidsReferencingPage = (title: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?r :block/uid ?u] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((s) => s[0]);

export const getChildrenLengthByPageUid = (uid: string): number =>
  window.roamAlphaAPI.q(
    `[:find ?c :where [?e :block/children ?c] [?e :block/uid "${uid}"]]`
  ).length;

export const getPageTitlesStartingWithPrefix = (prefix: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?title :where [?b :node/title ?title][(clojure.string/starts-with? ?title  "${prefix}")]]`
    )
    .map((r) => r[0] as string);

export const getPageTitlesReferencingBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?r :block/uid "${uid}"] [?b :block/refs ?r] [?b :block/page ?p] [?p :node/title ?t]]`
    )
    .map((s) => s[0]);

export const getPageTitlesAndBlockUidsReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find (pull ?pr [:node/title]) (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
        pageName
      )}"] [?r :block/refs ?p] [?r :block/page ?pr]]`
    )
    .map(([{ title }, { uid }]: Record<string, string>[]) => ({ title, uid }));

export const getPageTitlesAndUidsDirectlyReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t ?u :where [?r :block/uid ?u] [?r :node/title ?t] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        pageName
      )}"]]`
    )
    .map(([title, uid]: string[]) => ({ title, uid }));

export const getBlockUidsByPageTitle = (title: string) =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where  [?b :block/uid ?u] [?b :block/page ?e] [?e :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((b) => b[0] as string);

export const getNthChildUidByBlockUid = ({
  blockUid,
  order,
}: {
  blockUid: string;
  order: number;
}): string =>
  window.roamAlphaAPI.q(
    `[:find ?u :where [?c :block/uid ?u] [?c :block/order ${order}] [?p :block/children ?c] [?p :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string;

export const getFirstChildUidByBlockUid = (blockUid: string): string =>
  getNthChildUidByBlockUid({ blockUid, order: 0 });

export const getFirstChildTextByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find ?s :where [?c :block/string ?s] [?c :block/order 0] [?p :block/children ?c] [?p :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string;

export const getShallowTreeByParentUid = (
  parentUid: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find (pull ?c [:block/uid :block/string :block/order]) :where [?b :block/uid "${parentUid}"] [?b :block/children ?c]]`
    )
    .sort((a, b) => a[0].order - b[0].order)
    .map(([a]: { uid: string; string: string }[]) => ({
      uid: a.uid,
      text: a.string,
    }));

export const getLinkedPageTitlesUnderUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?r :node/title ?t] [?c :block/refs ?r] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

export const getBlockUidsWithParentUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?c :block/uid ?u] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

export const getParentUidsOfBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?p :block/uid ?u] [?b :block/parents ?p] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

const sortBasicNodes = (c: RoamUnorderedBasicNode[]): RoamBasicNode[] =>
  c
    .sort(({ order: a }, { order: b }) => a - b)
    .map(({ order, children = [], ...node }) => ({
      children: sortBasicNodes(children),
      ...node,
    }));

export const getBasicTreeByParentUid = (uid: string): RoamBasicNode[] =>
  sortBasicNodes(
    window.roamAlphaAPI
      .q(
        `[:find (pull ?c [[:block/string :as "text"] :block/uid :block/order {:block/children ...}]) :where [?b :block/uid "${uid}"] [?b :block/children ?c]]`
      )
      .map((a) => a[0] as RoamUnorderedBasicNode)
  );

type RoamRawBlock = {
  text: string;
  uid: string;
  order: number;
  heading?: number;
  open: boolean;
  viewType?: ViewType;
  textAlign?: TextAlignment;
  editTime: number;
  props?: {};
  children?: RoamRawBlock[];
};

const formatRoamNode = (n: Partial<RoamRawBlock>, v: ViewType): TreeNode => ({
  text: n.text || "",
  open: typeof n.open === "undefined" ? true : n.open,
  order: n.order || 0,
  uid: n.uid || "",
  heading: n.heading || 0,
  viewType: n.viewType || v,
  editTime: new Date(n.editTime || 0),
  props: { imageResize: {}, iframe: {} },
  textAlign: n.textAlign || "left",
  children: (n.children || [])
    .sort(({ order: a }, { order: b }) => a - b)
    .map((r) => formatRoamNode(r, n.viewType || v)),
});

export const getFullTreeByParentUid = (uid: string): TreeNode =>
  formatRoamNode(
    window.roamAlphaAPI.q(
      `[:find (pull ?b [
      [:block/string :as "text"] 
      [:node/title :as "text"] 
      :block/uid 
      :block/order 
      :block/heading 
      :block/open 
      [:children/view-type :as "viewType"] 
      [:block/text-align :as "textAlign"] 
      [:edit/time :as "editTime"] 
      :block/props 
      {:block/children ...}
    ]) :where [?b :block/uid "${uid}"]]`
    )?.[0]?.[0] || ({} as RoamRawBlock),
    window.roamAlphaAPI
      .q(
        `[:find
      (pull ?p [:children/view-type]) :where
      [?c :block/uid "${uid}"] [?c :block/parents ?p]]`
      )
      .reverse()
      .map((a) => a[0])
      .map((a) => a && a["view-type"])
      .find((a) => !!a) || "bullet"
  );

export const isTagOnPage = ({
  tag,
  title,
}: {
  tag: string;
  title: string;
}): boolean =>
  !!window.roamAlphaAPI.q(
    `[:find ?r :where [?r :node/title "${normalizePageTitle(
      tag
    )}"] [?b :block/refs ?r] [?b :block/page ?p] [?p :node/title "${normalizePageTitle(
      title
    )}"]]`
  )?.[0]?.[0];

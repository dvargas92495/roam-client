export type RoamBasicBlock = {
  string: string;
  uid: string;
};

export type RoamBasicPage = { title: string; uid: string };

export type RoamBasicNode = {
  text: string;
  uid: string;
  children: RoamBasicNode[];
};

export type RoamUnorderedBasicNode = {
  text: string;
  uid: string;
  order: number;
  children?: RoamUnorderedBasicNode[];
};

export type RoamPull = {
  "create/time"?: number;
  "node/title"?: string;
  "log/id"?: number;
  "block/uid"?: string;
  "edit/time"?: number;
  "block/children"?: RoamNode[];
  "block/open"?: boolean;
  "block/order"?: number;
  "block/string"?: string;
} & RoamNode;

export type PullBlock = {
  ":block/children"?: { ":db/id": number }[];
  ":block/string"?: string;
  ":block/order"?: number;
  ":block/uid"?: string;
  ":block/heading"?: number;
  ":block/open"?: boolean;
  ":block/text-align"?: TextAlignment;
  ":children/view-type"?: `:${ViewType}`;
  ":edit/time"?: number;
  ":block/props"?: any;
};

export type RoamPullResult = RoamPull | null;

export type ViewType = "document" | "bullet" | "numbered";

export type TextAlignment = "left" | "center" | "right";

export type RoamBlock = {
  attrs?: { source: string[] }[][];
  children?: { id: number }[];
  id?: number;
  string?: string;
  title?: string;
  time?: number;
  uid?: string;
  order?: number;
  "view-type"?: ViewType;
};

export type RoamError = {
  raw: string;
  "status-code": number;
};

export type TreeNode = {
  text: string;
  order: number;
  children: TreeNode[];
  uid: string;
  heading: number;
  open: boolean;
  viewType: ViewType;
  editTime: Date;
  textAlign: TextAlignment;
  props: {
    imageResize: {
      [link: string]: {
        height: number;
        width: number;
      };
    };
    iframe: {
      [link: string]: {
        height: number;
        width: number;
      };
    };
  };
};

export type TextNode = {
  text: string;
  children: TextNode[];
};

export type InputTextNode = {
  text: string;
  children?: InputTextNode[];
  uid?: string;
  heading?: number;
  textAlign?: TextAlignment;
  viewType?: ViewType;
  open?: boolean;
};

type PlusType = [number, string];

export type RoamNode = { "db/id": number };

export type RoamQuery = RoamPull & {
  "block/graph"?: RoamNode;
  "node/graph+title"?: PlusType;
  "block/graph+uid"?: PlusType;
  "node/graph"?: RoamNode;
  "edit/email"?: string;
  "entity/graph"?: RoamNode;
};

export type RoamQueryResult = number & RoamQuery;

export type ClientParams = {
  action:
    | "pull"
    | "q"
    | "create-block"
    | "update-block"
    | "create-page"
    | "move-block"
    | "delete-block"
    | "delete-page"
    | "update-page";
  selector?: string;
  uid?: string;
  query?: string;
  inputs?: string[];
} & ActionParams;

type ActionParams = {
  location?: {
    "parent-uid": string;
    order: number;
  };
  block?: {
    string?: string;
    uid?: string;
    open?: boolean;
    heading?: number;
    "text-align"?: TextAlignment;
    "children-view-type"?: ViewType;
  };
  page?: {
    title?: string;
    uid?: string;
  };
};

export type WriteAction = (a: ActionParams) => boolean;

export type UserSettings = {
  "global-filters": {
    includes: string[];
    removes: string[];
  };
};

type SidebarWindowType =
  | SidebarBlockWindow
  | SidebarMentionsWindow
  | SidebarGraphWindow
  | SidebarOutlineWindow;

export type SidebarWindowInput = {
  "block-uid": string;
  type: SidebarWindowType["type"];
};

type SidebarBlockWindow = {
  type: "block";
  "block-uid": string;
};

type SidebarOutlineWindow = {
  type: "outline";
  "page-uid": string;
};

type SidebarMentionsWindow = {
  type: "mentions";
  "mentions-uid": string;
};

type SidebarGraphWindow = {
  type: "graph";
  // "page-uid": string; Currently not working despite documentation
  "block-uid": string;
};

export type SidebarAction = (action: { window: SidebarWindowInput }) => boolean;

export type SidebarWindow = {
  "collapsed?": boolean;
  order: number;
  "pinned?": boolean;
  "window-id": string;
} & SidebarWindowType;

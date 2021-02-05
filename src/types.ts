export type RoamBasicBlock = {
  string: string;
  uid: string;
};

export type RoamBasicPage = { title: string; uid: string };

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

export type RoamPullResult = RoamPull | null;

export type ViewType = "document" | "bullet" | "numbered";

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

type PlusType = [number, string];

type RoamNode = { "db/id": number };

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

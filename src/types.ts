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

export type RoamBlock = {
  children?: { id: number }[];
  id?: number;
  string?: string;
  title?: string;
  time?: number;
  uid?: string;
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

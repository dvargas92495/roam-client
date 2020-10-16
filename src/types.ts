export type RoamBasicBlock = {
  string: string;
  uid: string;
};

export type RoamBasicPage = { title: string; uid: string };

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

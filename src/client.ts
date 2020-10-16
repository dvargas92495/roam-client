import {
  RoamBasicBlock,
  RoamBasicPage,
  RoamPullResult,
  RoamQueryResult,
} from "./types";

export type ClientParams = {
  action:
    | "pull"
    | "q"
    | "create-block"
    | "update-block"
    | "create-page"
    | "move-block";
  selector?: string;
  uid?: string;
  query?: string;
  inputs?: string[];
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
    title: string;
    uid?: string;
  };
};

export class RoamClient {
  protected post(body: ClientParams): Promise<any> {
    throw new Error("Not Implemented");
  }

  public createBlock({
    parentUid,
    order,
    text,
    uid,
  }: {
    parentUid: string;
    order: number;
    text: string;
    uid?: string;
  }) {
    return this.post({
      location: {
        "parent-uid": parentUid,
        order,
      },
      block: {
        string: text,
        uid,
      },
      action: "create-block",
    }).then((r) => r[0] as RoamBasicBlock);
  }

  public createPage(page: { title: string; uid?: string }) {
    return this.post({
      page,
      action: "create-page",
    }).then((r) => r[0] as RoamBasicPage);
  }

  public moveBlock({
    parentUid,
    order,
    uid,
  }: {
    parentUid: string;
    order: number;
    uid?: string;
  }) {
    return this.post({
      location: {
        "parent-uid": parentUid,
        order,
      },
      block: {
        uid,
      },
      action: "move-block",
    }).then((r) => r as boolean);
  }

  public pull(params: { selector?: string; uid: string }) {
    return this.post({
      selector: params.selector || "[*]",
      uid: params.uid,
      action: "pull",
    }).then((r) => r as RoamPullResult);
  }

  public q({ query, inputs }: { query: string; inputs?: string[] }) {
    return this.post({
      action: "q",
      query,
      inputs,
    }).then(
      (r) => r.map((res: RoamQueryResult[]) => res[0]) as RoamQueryResult[]
    );
  }

  public updateBlock({
    uid,
    text,
    open,
  }: {
    uid: string;
    text: string;
    open: boolean;
  }) {
    return this.post({
      block: {
        string: text,
        uid,
        open,
      },
      action: "update-block",
    });
  }
}

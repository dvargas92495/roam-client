export type ClientParams = {
  action: "pull" | "q" | "create-block" | "update-block";
  selector?: string;
  uid?: string;
  query?: string;
  inputs?: string[];
  location?: {
    "parent-uid": string;
    order: number;
  };
  block?: {
    string: string;
    uid?: string;
    open?: boolean;
  };
};

export class RoamClient {
  protected post(body: ClientParams) {
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
    });
  }

  public q({ query, inputs }: { query: string; inputs?: string[] }) {
    return this.post({
      action: "q",
      query,
      inputs,
    });
  }
}

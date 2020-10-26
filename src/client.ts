import {
  RoamBasicBlock,
  RoamBasicPage,
  RoamPullResult,
  RoamQueryResult,
  ClientParams,
} from "./types";

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

  public deleteBlock(block: { uid: string }) {
    return this.post({
      block,
      action: "delete-block",
    }).then((r) => r as boolean);
  }

  public deletePage(page: { uid: string }) {
    return this.post({
      page,
      action: "delete-page",
    }).then((r) => r as boolean);
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
    text?: string;
    open?: boolean;
  }) {
    return this.post({
      block: {
        string: text || "",
        uid,
        open,
      },
      action: "update-block",
    }).then((r) => r as boolean);
  }

  public updatePage(page: { title: string; uid: string }) {
    return this.post({
      page,
      action: "update-page",
    }).then((r) => r as boolean);
  }

  public async findOrCreatePage(pageName: string, uid?: string) {
    const queryResults = await this.q({
      query: `[:find ?e :where [?e :node/title "${pageName}"]]`,
    });
    if (queryResults.length === 0) {
      const basicPage = await this.createPage({
        title: pageName,
        uid,
      });
      return basicPage.uid;
    }
    return queryResults[0]["block/uid"];
  }
}

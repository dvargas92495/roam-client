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

  public createAttribute({
    key,
    value,
    parentUid,
  }: {
    key: string;
    value: string;
    parentUid: string;
  }) {
    return this.appendBlock({
      text: `${key}:: ${value}`,
      parentUid,
    });
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
      query: `[:find (pull ?e [:block/uid]) :where [?e :node/title "${pageName}"]]`,
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

  public async findOrCreateBlock({
    text,
    parentUid,
  }: {
    text: string;
    parentUid: string;
  }) {
    const queryResults = await this.q({
      query: `[:find (pull ?c [:block/uid]) :where [?c :block/string "${text}"] [?p :block/children ?c] [?p :block/uid "${parentUid}"]]`,
    });
    if (queryResults.length === 0) {
      return await this.appendBlock({ text, parentUid });
    }
    return queryResults[0]["block/uid"];
  }

  public async upsertBlock({
    uid,
    text,
    parentUid,
  }: {
    uid: string;
    text: string;
    parentUid: string;
  }) {
    const queryResults = await this.q({
      query: `[:find (pull ?b [:block/uid]) :where [?b :block/uid "${uid}"]]`,
    });
    if (queryResults.length === 0) {
      return this.appendBlock({ text, parentUid, uid }).then(() => true);
    }
    return this.updateBlock({ uid, text });
  }

  public async appendBlock({
    text,
    parentUid,
    uid,
  }: {
    text: string;
    parentUid: string;
    uid?: string;
  }) {
    const parents = await this.q({
      query: `[:find (pull ?p [:block/children, :block/uid]) :where [?p :block/uid "${parentUid}"]]`,
    });
    if (parents.length === 0 || !parents[0]) {
      throw new Error(`No existing parent of uid ${parentUid}`);
    }
    const children = parents[0]["block/children"];
    const basicPage = await this.createBlock({
      text,
      parentUid,
      order: children?.length || 0,
      uid,
    });
    return basicPage.uid;
  }
}

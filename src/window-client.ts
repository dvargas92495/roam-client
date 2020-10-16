import { ClientParams, RoamClient } from "./client";

class WindowClient extends RoamClient {
  constructor() {
    super();
    if (!window) {
      throw new Error("Client could only be used in a Window");
    }
    if (!window.roamDatomicAlphaAPI) {
      throw new Error("Client could only be used with new Roam backend");
    }
  }

  protected post(body: ClientParams) {
    return window
      .roamDatomicAlphaAPI(body)
      .then((r) => (typeof r.success !== "undefined" ? r.success : r));
  }
}

export default WindowClient;

import { ClientParams } from "./types";
import { RoamClient } from "./client";

class WindowClient extends RoamClient {
  constructor() {
    super();
    if (!window) {
      throw new Error("Client could only be used in a Window");
    }
  }

  protected post(body: ClientParams) {
    if (!window.roamDatomicAlphaAPI) {
      throw new Error("Client could only be used with new Roam backend");
    }
    return window
      .roamDatomicAlphaAPI(body)
      .then((r) => (typeof r.success !== "undefined" ? r.success : r));
  }
}

export default WindowClient;

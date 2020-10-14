import axios from "axios";
import { ClientParams, RoamClient } from "./client";

type RestClientProps = {
  apiKey?: string;
  apiToken?: string;
  graphName: string;
  contentType?:
    | "application/json"
    | "application/edn"
    | "application/transit+json";
};

class RestClient extends RoamClient {
  apiKey: string;
  apiToken: string;
  graphName: string;
  contentType:
    | "application/json"
    | "application/edn"
    | "application/transit+json";

  constructor(props: RestClientProps) {
    super();
    this.apiKey = props.apiKey || process.env.ROAM_CLIENT_API_KEY || "";
    this.apiToken = props.apiToken || process.env.ROAM_CLIENT_API_TOKEN || "";
    this.graphName = props.graphName;
    this.contentType = props.contentType || "application/json";

    if (!this.apiKey) {
      throw new Error("Rest Client is missing an API Key");
    }

    if (!this.apiToken) {
      throw new Error("Rest Client is missing an API Token");
    }
  }

  protected post(body: ClientParams) {
    return axios.post(
      "https://4c67k7zc26.execute-api.us-west-2.amazonaws.com/v1/alphaAPI",
      {
        ...body,
        "graph-name": this.graphName,
      },
      {
        headers: {
          "x-api-key": this.apiKey,
          "x-api-token": this.apiToken,
          "Content-Type": this.contentType,
        },
      }
    );
  }
}

export default RestClient;

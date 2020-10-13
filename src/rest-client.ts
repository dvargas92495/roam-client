type RestClientProps = {
    apiKey?: string,
    apiToken?: string,
    graphName: string,
    contentType?: "application/json" | "application/edn" | "application/transit+json"
}

class RestClient {
    apiKey: string;
    apiToken: string;
    graphName: string;
    contentType: "application/json" | "application/edn" | "application/transit+json"

    constructor(props : RestClientProps) {
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
}

export default RestClient;

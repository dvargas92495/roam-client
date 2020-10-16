import { RestClient } from "../src";
import axios from "axios";

test("Could successfully instantiate client", () => {
  const client = new RestClient({
    apiKey: "API_KEY",
    apiToken: "API_TOKEN",
    graphName: "MY_GRAPH",
    contentType: "application/json",
  });
  expect(client).toBeDefined();
});

test("Throws error when missing key", () => {
  expect(
    () =>
      new RestClient({
        apiToken: "API_TOKEN",
        graphName: "MY_GRAPH",
        contentType: "application/json",
      })
  ).toThrow();
});

test("Throws error when missing token", () => {
  expect(
    () =>
      new RestClient({
        apiKey: "API_KEY",
        graphName: "MY_GRAPH",
        contentType: "application/json",
      })
  ).toThrow();
});

test("Instantiate with just graph name", () => {
  const env = { ...process.env };
  process.env.ROAM_CLIENT_API_KEY = "API_KEY";
  process.env.ROAM_CLIENT_API_TOKEN = "API_TOKEN";
  const client = new RestClient({
    graphName: "MY_GRAPH",
  });
  expect(client).toBeDefined();
  process.env = { ...env };
});

test("Create Block with Rest Client", async () => {
  const client = new RestClient({
    apiKey: "API_KEY",
    apiToken: "API_TOKEN",
    graphName: "MY_GRAPH",
    contentType: "application/json",
  });
  await client.createBlock({
    parentUid: "parentUid",
    order: 0,
    text: "text",
    uid: "childUid",
  });
  expect(axios.post).toBeCalledWith(
    "https://4c67k7zc26.execute-api.us-west-2.amazonaws.com/v1/alphaAPI",
    {
      action: "create-block",
      "graph-name": "MY_GRAPH",
      location: {
        "parent-uid": "parentUid",
        order: 0,
      },
      block: {
        string: "text",
        uid: "childUid",
      },
    },
    {
      headers: {
        "x-api-key": "API_KEY",
        "x-api-token": "API_TOKEN",
        "Content-Type": "application/json",
      },
    }
  );
  jest.clearAllMocks();
});

test("Create Block with Rest Client", async () => {
  const client = new RestClient({
    apiKey: "API_KEY",
    apiToken: "API_TOKEN",
    graphName: "MY_GRAPH",
    contentType: "application/json",
  });
  await client.q({
    query: "[:find ?e in $ ?title :where [?e :node/title ?title]]",
    inputs: ["title"],
  });
  expect(axios.post).toBeCalledWith(
    "https://4c67k7zc26.execute-api.us-west-2.amazonaws.com/v1/alphaAPI",
    {
      action: "q",
      'graph-name': "MY_GRAPH",
      query: "[:find ?e in $ ?title :where [?e :node/title ?title]]",
      inputs: ["title"],
    },
    {
      headers: {
        "x-api-key": "API_KEY",
        "x-api-token": "API_TOKEN",
        "Content-Type": "application/json",
      },
    }
  );
  jest.clearAllMocks();
});

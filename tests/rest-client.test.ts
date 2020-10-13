import { RestClient } from "../src";

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

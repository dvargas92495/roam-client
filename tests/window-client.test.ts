import { WindowClient } from "../src";
const mockWindow = jest.fn();
window.roamDatomicAlphaAPI = mockWindow;

test("Could successfully instantiate window client", () => {
  const client = new WindowClient();
  expect(client).toBeDefined();
});

test("Create Block with Window Client", async () => {
  const client = new WindowClient();
  mockWindow.mockResolvedValue([{ string: "text", uid: "childUid" }]);
  const response = await client.createBlock({
    parentUid: "parentUid",
    order: 0,
    text: "text",
    uid: "childUid",
  });
  expect(mockWindow).toBeCalledWith({
    action: "create-block",
    location: {
      "parent-uid": "parentUid",
      order: 0,
    },
    block: {
      string: "text",
      uid: "childUid",
    },
  });
  expect(response.string).toBe("text");
  expect(response.uid).toBe("childUid");
  jest.clearAllMocks();
});

test("Move Block with Window Client", async () => {
  const client = new WindowClient();
  mockWindow.mockResolvedValue({ success: true });
  const response = await client.moveBlock({
    parentUid: "parentUid",
    order: 0,
    uid: "childUid",
  });
  expect(mockWindow).toBeCalledWith({
    action: "move-block",
    location: {
      "parent-uid": "parentUid",
      order: 0,
    },
    block: {
      uid: "childUid",
    },
  });
  expect(response).toBe(true);
  jest.clearAllMocks();
});

test("Update Block with Window Client", async () => {
  const client = new WindowClient();
  mockWindow.mockResolvedValue({
    success: true,
  });
  const response = await client.updateBlock({
    open: true,
    text: "text",
    uid: "childUid",
  });
  expect(mockWindow).toBeCalledWith({
    action: "update-block",
    block: {
      uid: "childUid",
      open: true,
      string: "text",
    },
  });
  expect(response).toBe(true);
  jest.clearAllMocks();
});

test("Delete Block with Window Client", async () => {
  const client = new WindowClient();
  mockWindow.mockResolvedValue({
    success: true,
  });
  const response = await client.deleteBlock({
    uid: "childUid",
  });
  expect(mockWindow).toBeCalledWith({
    action: "delete-block",
    block: {
      uid: "childUid",
    },
  });
  expect(response).toBe(true);
  jest.clearAllMocks();
});

test("Pull with Window Client", async () => {
  const client = new WindowClient();
  await client.pull({
    selector: "[:block/string]",
    uid: "yS-It9SFL",
  });
  expect(mockWindow).toBeCalledWith({
    action: "pull",
    selector: "[:block/string]",
    uid: "yS-It9SFL",
  });
  jest.clearAllMocks();
});

test("Q with Window Client", async () => {
  const client = new WindowClient();
  mockWindow.mockResolvedValue([[1]]);
  const response = await client.q({
    query: "[:find ?e in $ ?title :where [?e :node/title ?title]]",
    inputs: ["title"],
  });
  expect(mockWindow).toBeCalledWith({
    action: "q",
    query: "[:find ?e in $ ?title :where [?e :node/title ?title]]",
    inputs: ["title"],
  });
  expect(response).toHaveLength(1);
  expect(response[0]).toBe(1);
  jest.clearAllMocks();
});

test("Create Page with Window Client", async () => {
  const client = new WindowClient();
  mockWindow.mockResolvedValue({
    success: [{ title: "My Page", uid: "mpgy3y0p2" }],
  });
  const response = await client.createPage({
    title: "My Page",
    uid: "mpgy3y0p2",
  });
  expect(mockWindow).toBeCalledWith({
    action: "create-page",
    page: {
      title: "My Page",
      uid: "mpgy3y0p2",
    },
  });
  expect(response.title).toBe("My Page");
  expect(response.uid).toBe("mpgy3y0p2");
  jest.clearAllMocks();
});

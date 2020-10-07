import { getAttrConfigFromQuery } from "../src";

test("Get config object from query", () => {
  window.roamAlphaAPI = {
    q: jest.fn((s: string) => {
      if (s === "input") {
        return [
          [
            {
              attrs: [
                [{ source: [] }, { source: [] }, { source: ["parentId", "abcdefghi"] }],
              ],
            },
          ],
        ];
      } else if (
        s ===
        `[:find (pull ?e [:block/string]) :where [?e :block/uid "abcdefghi"] ]`
      ) {
        return [
          [
            {
              string: "Key::Value",
            },
          ],
        ];
      } else {
        return [];
      }
    }),
  };
  const config = getAttrConfigFromQuery("input");
  expect(config).toHaveProperty("Key");
  expect(config["Key"]).toBe("Value");
});

import { getAttrConfigFromQuery, getConfigFromPage } from "../src";
import { alphaRest } from "./util";

test("Get config object from query", () => {
  window.roamAlphaAPI = {
    ...alphaRest,
    q: jest.fn((s: string) => {
      if (s === "input") {
        return [
          [
            {
              attrs: [
                [
                  { source: [] },
                  { source: [] },
                  { source: ["parentId", "abcdefghi"] },
                ],
              ],
            },
          ],
        ];
      } else if (
        s ===
        `[:find ?s :where [?e :block/string ?s] [?e :block/uid "abcdefghi"] ]`
      ) {
        return [["Key::Value"]];
      } else {
        return [];
      }
    }),
  };
  const config = getAttrConfigFromQuery("input");
  expect(config).toHaveProperty("Key");
  expect(config["Key"]).toBe("Value");
});

test("Get Config from Page input", () => {
  window.roamAlphaAPI = {
    ...alphaRest,
    q: jest.fn((s: string) => {
      if (s === '[:find (pull ?e [*]) :where [?e :node/title "input"] ]') {
        return [
          [
            {
              attrs: [
                [
                  { source: [] },
                  { source: [] },
                  { source: ["parentId", "abcdefghi"] },
                ],
              ],
            },
          ],
        ];
      } else if (
        s ===
        `[:find ?s :where [?e :block/string ?s] [?e :block/uid "abcdefghi"] ]`
      ) {
        return [["Key::Value"]];
      } else {
        return [];
      }
    }),
  };
  const config = getConfigFromPage("input");
  expect(config).toHaveProperty("Key");
  expect(config["Key"]).toBe("Value");
});

test("Get Config from Page Title", () => {
  const header = document.createElement("h1");
  header.className = "rm-title-display";
  header.textContent = "input";
  document.body.appendChild(header);

  window.roamAlphaAPI = {
    ...alphaRest,
    q: jest.fn((s: string) => {
      if (s === '[:find (pull ?e [*]) :where [?e :node/title "input"] ]') {
        return [
          [
            {
              attrs: [
                [
                  { source: [] },
                  { source: [] },
                  { source: ["parentId", "abcdefghi"] },
                ],
              ],
            },
          ],
        ];
      } else if (
        s ===
        `[:find ?s :where [?e :block/string ?s] [?e :block/uid "abcdefghi"] ]`
      ) {
        return [["Key::Value"]];
      } else {
        return [];
      }
    }),
  };
  const config = getConfigFromPage("input");
  expect(config).toHaveProperty("Key");
  expect(config["Key"]).toBe("Value");
});

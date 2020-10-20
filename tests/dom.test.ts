import { createIconButton, getUids } from "../src";

test("Icon button is rendered", () => {
  const iconButton = createIconButton("sort");
  expect(iconButton).toMatchInlineSnapshot(
    `
    <span
      class="bp3-button bp3-minimal bp3-small"
      tabindex="0"
    >
      <span
        class="bp3-icon bp3-icon-sort"
      />
    </span>
  `
  );
});

test("getUids get parent and block for regular page", () => {
  const block = document.createElement("div");
  block.id =
    "block-input-abcd1234abcd1234abcd1234abcd-body-outline-abcdefghi-jklmnopqr";
  const { blockUid, parentUid } = getUids(block);
  expect(blockUid).toBe("jklmnopqr");
  expect(parentUid).toBe("abcdefghi");
});

test("getUids get parent and block for daily page", () => {
  const block = document.createElement("div");
  block.id =
    "block-input-abcd1234abcd1234abcd1234abcd-body-outline-10-20-2020-jklmnopqr";
  const { blockUid, parentUid } = getUids(block);
  expect(blockUid).toBe("jklmnopqr");
  expect(parentUid).toBe("10-20-2020");
});

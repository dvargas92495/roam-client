import { createIconButton } from "../src";

test("Icon button is rendered", () => {
  const iconButton = createIconButton("sort");
  expect(iconButton).toMatchInlineSnapshot(
    "",
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

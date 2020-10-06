import userEvent from "@testing-library/user-event";
import { asyncType } from "../src";
import { getFocusedTextArea } from "./util";

test("Async Type enters text", async () => {
  const textarea = getFocusedTextArea();
  await asyncType("example");
  expect(textarea).toHaveValue("example");
});

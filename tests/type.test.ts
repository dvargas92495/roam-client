import userEvent from "@testing-library/user-event";
import { asyncType, newBlockEnter } from "../src";
import { getFocusedTextArea } from "./util";

test("Async Type enters text", async () => {
  const textarea = getFocusedTextArea();
  await asyncType("example");
  expect(textarea).toHaveValue("example");
});

test("Pressing Enter creates new block", async () => {
  const textarea = getFocusedTextArea();
  textarea.onkeyup = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const newTextArea = document.createElement("textarea");
      document.body.appendChild(newTextArea);
      newTextArea.focus();
    }
  };
  await newBlockEnter();
  expect(textarea).not.toHaveFocus();
  const newTextArea = document.body.lastChild;
  expect(newTextArea).toHaveFocus();
});

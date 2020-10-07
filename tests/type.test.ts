import { asyncType, newBlockEnter, pushBullets } from "../src";
import { getFocusedTextArea } from "./util";
import { when } from "jest-when";

const textareaKeyup = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const newTextArea = document.createElement("textarea");
    document.body.appendChild(newTextArea);
    newTextArea.onkeyup = textareaKeyup;
    newTextArea.focus();
  }
};

test("Async Type enters text", async () => {
  const textarea = getFocusedTextArea();
  await asyncType("example");
  expect(textarea).toHaveValue("example");
});

test("Pressing Enter creates new block", async () => {
  const textarea = getFocusedTextArea();
  textarea.onkeyup = textareaKeyup;
  await newBlockEnter();
  expect(textarea).not.toHaveFocus();
  const newTextArea = document.body.lastChild;
  expect(newTextArea).toHaveFocus();
});

test("Push bullets types in current bullet and creates two more", async () => {
  const textarea = getFocusedTextArea();
  textarea.onkeyup = textareaKeyup;
  await pushBullets(["First block", "Second block", "Third block"]);
  expect(document.body.children).toHaveLength(3);
  expect(document.body.children[0]).toHaveValue("First block");
  expect(document.body.children[1]).toHaveValue("Second block");
  expect(document.body.children[2]).toHaveValue("Third block");
});

afterEach(() =>
  Array.from(document.body.children).forEach((c) =>
    document.body.removeChild(c)
  )
);

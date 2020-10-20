import userEvent from "@testing-library/user-event";
import { waitForActiveTextarea, waitForString } from "./dom-testing";

export const openBlock = async (e: Element) => {
  await userEvent.click(e);
  await waitForActiveTextarea();
};

export const clear = async () => {
  const textArea = document.activeElement as HTMLTextAreaElement;
  await userEvent.clear(textArea);
  await waitForString("");
}

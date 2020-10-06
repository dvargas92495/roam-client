import userEvent from "@testing-library/user-event";

export const asyncType = async (text: string) =>
  document.activeElement &&
  (await userEvent.type(document.activeElement, text, {
    skipClick: true,
  }));

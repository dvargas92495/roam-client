import { waitFor } from "@testing-library/dom";

export const waitForActiveTextarea = async () => {
  await waitFor(
    () => {
      if (document.activeElement?.tagName !== "TEXTAREA") {
        throw new Error("Textarea didn't render");
      }
    },
    {
      timeout: 5000,
    }
  );
};

export const waitForString = (text: string) =>
  waitFor(
    () => {
      const textArea = document.activeElement as HTMLTextAreaElement;
      if (textArea?.value == null) {
        throw new Error(
          `Textarea is undefined. Active Element ${textArea.tagName}. Input text ${text}`
        );
      }

      const expectedTextWithoutPeriod = text.replace(/\./g, "").toUpperCase();
      const actualTextWithoutPeriod = textArea.value
        .replace(/\./g, "")
        .toUpperCase();

      // relaxing constraint for equality because there is an issue with periods.
      // in some cases, userEvent.type doesn't type the periods.
      if (actualTextWithoutPeriod !== expectedTextWithoutPeriod) {
        throw new Error(
          `Typing not complete. Actual: ${actualTextWithoutPeriod} Expected: ${expectedTextWithoutPeriod}`
        );
      }
    },
    {
      timeout: 5000,
    }
  );

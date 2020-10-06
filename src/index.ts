import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";

type RoamError = {
  raw: string;
  "status-code": number;
};

export const asyncType = async (text: string) =>
  document.activeElement &&
  (await userEvent.type(document.activeElement, text, {
    skipClick: true,
  }));

export const genericError = (e: Partial<AxiosError & RoamError>) => {
  const message =
    (e.response
      ? typeof e.response.data === "string"
        ? e.response.data
        : JSON.stringify(e.response.data)
      : e.message) ||
    e.raw ||
    "";
  if (message) {
    asyncType(
      `Error: ${
        message.length > 50 ? `${message.substring(0, 50)}...` : message
      }`
    );
  } else {
    console.error(e);
  }
};

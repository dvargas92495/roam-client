import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import parse from "date-fns/parse";

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
    "Unknown Error Occurred";
  asyncType(
    `Error: ${message.length > 50 ? `${message.substring(0, 50)}...` : message}`
  );
};

export const parseRoamDate = (s: string) =>
  parse(s, "MMMM do, yyyy", new Date());
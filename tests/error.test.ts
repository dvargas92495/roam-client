import { genericError } from "../src";
import { getFocusedTextArea } from "./util";

test("Test generic error with Error", () => {
  const textarea = getFocusedTextArea();
  genericError(new Error("Example Error"));
  expect(textarea).toHaveValue("Error: Example Error");
});

test("Test generic error with AxiosError", () => {
  const textarea = getFocusedTextArea();
  const axiosError = {
    response: {
      data: "Example Error",
      status: 500,
      statusText: "Server Error",
      headers: {},
      config: {},
    },
  };
  genericError(axiosError);
  expect(textarea).toHaveValue("Error: Example Error");
});

test("Test generic error with RoamError", () => {
  const textarea = getFocusedTextArea();
  const roamError = {
    raw: "Example Error",
  };
  genericError(roamError);
  expect(textarea).toHaveValue("Error: Example Error");
});

test("Test generic error with Nothing", () => {
  const textarea = getFocusedTextArea();
  genericError({});
  expect(textarea).toHaveValue("Error: Unknown Error Occurred");
});

import { parseRoamDate, toRoamDate, toRoamDateUid } from "../src";

test("Roam Date should be parsed correctly", () => {
  const parsedDate = parseRoamDate("October 7th, 2020");
  expect(parsedDate.getFullYear()).toBe(2020);
  expect(parsedDate.getMonth()).toBe(9);
  expect(parsedDate.getDate()).toBe(7);
});

test("Date should be formatted to title correctly", () => {
  const date = new Date("10/16/2020");
  const dateString = toRoamDate(date);
  expect(dateString).toBe("October 16th, 2020");
});

test("Date should be formatted to uid correctly", () => {
  const date = new Date("10/16/2020");
  const dateString = toRoamDateUid(date);
  expect(dateString).toBe("10-16-2020");
});

import { parseRoamDate } from "../src"

test("Roam Date should be parsed correctly", () => {
    const parsedDate = parseRoamDate("October 7th, 2020");
    expect(parsedDate.getFullYear()).toBe(2020);
    expect(parsedDate.getMonth()).toBe(9);
    expect(parsedDate.getDate()).toBe(7);
});

import format from "date-fns/format";
import parse from "date-fns/parse";

export const parseRoamDate = (s: string) =>
  parse(s, "MMMM do, yyyy", new Date());

export const parseRoamDateUid = (s: string) =>
  parse(s, "MM-dd-yyyy", new Date());

export const toRoamDate = (d: Date) =>
  isNaN(d.valueOf()) ? "" : format(d, "MMMM do, yyyy");

export const toRoamDateUid = (d: Date) =>
  isNaN(d.valueOf()) ? "" : format(d, "MM-dd-yyyy");

export const DAILY_NOTE_PAGE_REGEX = /(January|February|March|April|May|June|July|August|September|October|November|December) [0-3]?[0-9](st|nd|rd|th), [0-9][0-9][0-9][0-9]/;

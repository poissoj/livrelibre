import { format } from "date-fns";

export const formatDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const formatDateFR = (date: Date) =>
  [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");

export const toInputDate = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

/** Converts an ISO date string (`YYYY-MM-DD`) to the French format (`DD/MM/YYYY`). */
export const formatISODateFR = (date: string) =>
  date.split("-").reverse().join("/");

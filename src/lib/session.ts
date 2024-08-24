import type { SessionOptions } from "iron-session";

if (!process.env.COOKIE_PASSWORD) {
  throw new Error("COOKIE_PASSWORD is not set.");
}

export const sessionOptions: SessionOptions = {
  password: process.env.COOKIE_PASSWORD,
  cookieName: "livreLibre",
};

export type User = {
  name: string;
  id: number;
  role: "admin" | "guest" | "anonymous" | "ssg";
};

export type SessionData = { user?: User };

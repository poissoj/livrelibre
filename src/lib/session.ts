import type { IronSessionOptions } from "iron-session";

if (!process.env.COOKIE_PASSWORD) {
  throw new Error("COOKIE_PASSWORD is not set.");
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.COOKIE_PASSWORD,
  cookieName: "livreLibre",
};

export type User = {
  name: string;
  role: "admin" | "guest" | "anonymous" | "ssg";
};

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}

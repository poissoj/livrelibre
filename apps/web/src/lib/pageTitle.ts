import { APP_NAME } from "./config";

/** Builds the document title, keeping the app-name suffix in a single place. */
export const formatPageTitle = (title?: string): string =>
  title ? `${title} | ${APP_NAME}` : APP_NAME;

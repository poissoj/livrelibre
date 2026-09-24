import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({
  path: fileURLToPath(new URL("../apps/server/.env.local", import.meta.url)),
});

// Never hit the real (rate-limited) book-lookup API from tests. The value must
// stay a valid URL for env.ts validation, but points to an unbound local port.
process.env.ISBN_SEARCH_URL = "http://127.0.0.1:9/";

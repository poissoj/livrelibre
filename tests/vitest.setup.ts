import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({
  path: fileURLToPath(new URL("../apps/server/.env.local", import.meta.url)),
});

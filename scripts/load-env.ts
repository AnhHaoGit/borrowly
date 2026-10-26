import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

import("./sync-books-to-elasticsearch").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

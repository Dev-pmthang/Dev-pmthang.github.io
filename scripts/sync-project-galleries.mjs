import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { generateProjectGalleries } = require("./generate-project-galleries.js");

const __filename = fileURLToPath(import.meta.url);

export function syncProjectGalleries() {
  return generateProjectGalleries();
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (invokedPath === __filename) {
  try {
    syncProjectGalleries();
  } catch (error) {
    console.error("Sync project galleries failed.");
    console.error(error);
    process.exitCode = 1;
  }
}

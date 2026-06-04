import path from "node:path";
import { fileURLToPath } from "node:url";
import { watch } from "node:fs";
import { syncProjectGalleries } from "./sync-project-galleries.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const projectsRoot = path.join(repoRoot, "assets", "img", "projects");

let syncTimer = null;
let syncInProgress = false;

async function runSync() {
  if (syncInProgress) {
    return;
  }

  syncInProgress = true;

  try {
    await syncProjectGalleries();
  } catch (error) {
    console.error("Gallery sync failed:", error);
  } finally {
    syncInProgress = false;
  }
}

function scheduleSync() {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    syncTimer = null;
    void runSync();
  }, 250);
}

await runSync();

console.log(`Watching project image folders: ${projectsRoot}`);
watch(projectsRoot, { recursive: true }, () => {
  scheduleSync();
});

await new Promise(() => {});

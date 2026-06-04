import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const projectsRoot = path.join(repoRoot, "assets", "img", "projects");
const outputPath = path.join(repoRoot, "assets", "data", "project-galleries.js");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function toTitleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function createAltText(folderName, fileName) {
  const projectName = folderName.replace(/[-_]+/g, " ");
  const imageName = path.parse(fileName).name.replace(/[-_]+/g, " ");
  const normalizedProjectName = toTitleCase(projectName).trim();
  const normalizedImageName = toTitleCase(imageName).trim();

  if (normalizedProjectName.localeCompare(normalizedImageName, "en", { sensitivity: "base" }) === 0) {
    return normalizedProjectName;
  }

  return `${normalizedProjectName} - ${normalizedImageName}`.trim();
}

function getImageSortRank(filePath) {
  const fileName = path.basename(filePath).toLowerCase();

  if (/(?:^|[_-])(bot|bottom|back|rear)(?:[_.-]|$)/.test(fileName)) {
    return 2;
  }

  if (/(?:^|[_-])(top|front|master)(?:[_.-]|$)/.test(fileName)) {
    return 0;
  }

  return 1;
}

async function getProjectGalleryManifest() {
  const entries = await fs.readdir(projectsRoot, { withFileTypes: true });
  const manifest = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const folderName = entry.name;
    const folderPath = path.join(projectsRoot, folderName);
    const files = await fs.readdir(folderPath, { withFileTypes: true });

    const images = files
      .filter((file) => file.isFile() && imageExtensions.has(path.extname(file.name).toLowerCase()))
      .map((file) => ({
        src: `assets/img/projects/${folderName}/${file.name}`,
        alt: createAltText(folderName, file.name)
      }))
      .sort((left, right) => {
        const rankDifference = getImageSortRank(left.src) - getImageSortRank(right.src);

        if (rankDifference !== 0) {
          return rankDifference;
        }

        return left.src.localeCompare(right.src, "en", { numeric: true, sensitivity: "base" });
      });

    if (images.length > 0) {
      manifest[folderName] = images;
    }
  }

  return manifest;
}

async function writeManifestFile(manifest) {
  const fileContent = `window.PROJECT_GALLERIES = ${JSON.stringify(manifest, null, 2)};\n`;
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, fileContent, "utf8");
}

export async function syncProjectGalleries() {
  const manifest = await getProjectGalleryManifest();
  await writeManifestFile(manifest);

  const projectCount = Object.keys(manifest).length;
  const imageCount = Object.values(manifest).reduce((total, images) => total + images.length, 0);
  console.log(`Synced ${projectCount} project galleries with ${imageCount} image(s).`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === __filename) {
  await syncProjectGalleries();
}

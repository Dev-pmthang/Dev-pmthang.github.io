const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const projectsRoot = path.join(repoRoot, "assets", "img", "projects");
const outputPath = path.join(repoRoot, "assets", "data", "project-galleries.js");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

function normalizeLabel(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isImageFile(fileName) {
  return imageExtensions.has(path.extname(fileName).toLowerCase());
}

function createAltText(projectName, fileName) {
  const projectLabel = normalizeLabel(projectName);
  const imageLabel = normalizeLabel(path.parse(fileName).name);
  return [projectLabel, imageLabel].filter(Boolean).join(" ").trim();
}

function compareNaturally(left, right) {
  return left.localeCompare(right, "en", {
    numeric: true,
    sensitivity: "base"
  });
}

function getKeywordRank(value, keywords, fallbackRank) {
  const normalizedValue = value.toLowerCase();

  for (let index = 0; index < keywords.length; index += 1) {
    const keyword = keywords[index];

    if (normalizedValue.includes(keyword)) {
      return index;
    }
  }

  return fallbackRank;
}

function getImageSortMeta(fileName) {
  const lowerFileName = fileName.toLowerCase();
  const extension = path.extname(lowerFileName);
  const baseName = path.basename(lowerFileName, extension);

  const manualOrderMatch = baseName.match(/^(\d+)[-_ ]/);
  const manualOrder = manualOrderMatch ? Number.parseInt(manualOrderMatch[1], 10) : Number.MAX_SAFE_INTEGER;

  const subjectRank = getKeywordRank(
    baseName,
    ["master", "main", "slave", "node"],
    4
  );

  const isBottomView = /(bot|bottom|rear|back)/.test(baseName);
  const isTopView = /(top|front)/.test(baseName);
  const sideRank = isTopView ? 0 : isBottomView ? 2 : 1;

  const isCaseLike = /(3d|box|case|enclosure)/.test(baseName);
  const isRenderLike = /(render|altium)/.test(baseName) || [".png", ".webp", ".svg"].includes(extension);
  const typeRank = isCaseLike ? 2 : isRenderLike ? 0 : 1;

  return {
    manualOrder,
    subjectRank,
    sideRank,
    typeRank
  };
}

function compareProjectImages(left, right) {
  const leftMeta = getImageSortMeta(left);
  const rightMeta = getImageSortMeta(right);

  if (leftMeta.manualOrder !== rightMeta.manualOrder) {
    return leftMeta.manualOrder - rightMeta.manualOrder;
  }

  if (leftMeta.subjectRank !== rightMeta.subjectRank) {
    return leftMeta.subjectRank - rightMeta.subjectRank;
  }

  if (leftMeta.typeRank !== rightMeta.typeRank) {
    return leftMeta.typeRank - rightMeta.typeRank;
  }

  if (leftMeta.sideRank !== rightMeta.sideRank) {
    return leftMeta.sideRank - rightMeta.sideRank;
  }

  return compareNaturally(left, right);
}

function buildProjectGalleryManifest() {
  if (!fs.existsSync(projectsRoot)) {
    return {};
  }

  const manifest = {};
  const projectFolders = fs
    .readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareNaturally);

  for (const projectFolder of projectFolders) {
    const projectPath = path.join(projectsRoot, projectFolder);

    const imageFiles = fs
      .readdirSync(projectPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && isImageFile(entry.name))
      .map((entry) => entry.name)
      .sort(compareProjectImages);

    if (imageFiles.length === 0) {
      continue;
    }

    manifest[projectFolder] = imageFiles.map((fileName) => ({
      src: `assets/img/projects/${projectFolder}/${fileName}`,
      alt: createAltText(projectFolder, fileName)
    }));
  }

  return manifest;
}

function writeProjectGalleryManifest(manifest) {
  const fileContent = `window.PROJECT_GALLERIES = ${JSON.stringify(manifest, null, 2)};\n`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fileContent, "utf8");
}

function generateProjectGalleries() {
  // Website tinh khong the tu doc folder anh tren hosting.
  // Vi vay can Node.js script chay local de sinh file data truoc khi upload.
  const manifest = buildProjectGalleryManifest();
  writeProjectGalleryManifest(manifest);

  const projectCount = Object.keys(manifest).length;
  const imageCount = Object.values(manifest).reduce((total, images) => total + images.length, 0);

  console.log(`Synced ${projectCount} project galleries with ${imageCount} image(s).`);

  return {
    manifest,
    outputPath,
    projectCount,
    imageCount
  };
}

if (require.main === module) {
  try {
    generateProjectGalleries();
  } catch (error) {
    console.error("Generate project galleries failed.");
    console.error(error);
    process.exitCode = 1;
  }
}

module.exports = {
  buildProjectGalleryManifest,
  createAltText,
  generateProjectGalleries,
  imageExtensions,
  isImageFile,
  normalizeLabel,
  outputPath,
  projectsRoot
};

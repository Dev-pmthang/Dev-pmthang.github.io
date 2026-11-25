const fs = require("node:fs");
const path = require("node:path");
const {
  generateProjectGalleries,
  isImageFile,
  projectsRoot
} = require("./generate-project-galleries.js");

function removeVietnameseMarks(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");
}

function normalizeFileName(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, path.extname(fileName));

  const normalizedBaseName = removeVietnameseMarks(baseName)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";

  return `${normalizedBaseName}${extension}`;
}

function getUniqueFilePath(targetFolder, fileName) {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);

  let index = 0;
  let candidateName = fileName;
  let candidatePath = path.join(targetFolder, candidateName);

  while (fs.existsSync(candidatePath)) {
    index += 1;
    candidateName = `${baseName}-${index}${extension}`;
    candidatePath = path.join(targetFolder, candidateName);
  }

  return {
    candidateName,
    candidatePath
  };
}

function parseArgs(argv) {
  let projectName = "";
  const files = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--project") {
      projectName = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }

    if (arg === "--files") {
      for (let fileIndex = index + 1; fileIndex < argv.length; fileIndex += 1) {
        const value = argv[fileIndex];

        if (value.startsWith("--")) {
          index = fileIndex - 1;
          break;
        }

        files.push(value);
        index = fileIndex;
      }
    }
  }

  return {
    projectName,
    files
  };
}

function addProjectImages(projectName, filePaths) {
  if (!projectName) {
    throw new Error("Missing --project value.");
  }

  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    throw new Error("Missing --files value.");
  }

  const projectFolder = path.join(projectsRoot, projectName);
  fs.mkdirSync(projectFolder, { recursive: true });

  const copiedFiles = [];

  for (const inputPath of filePaths) {
    const absoluteSourcePath = path.resolve(inputPath);

    if (!fs.existsSync(absoluteSourcePath)) {
      throw new Error(`File not found: ${absoluteSourcePath}`);
    }

    if (!isImageFile(absoluteSourcePath)) {
      throw new Error(`Unsupported image file: ${absoluteSourcePath}`);
    }

    const normalizedFileName = normalizeFileName(path.basename(absoluteSourcePath));
    const { candidateName, candidatePath } = getUniqueFilePath(projectFolder, normalizedFileName);

    fs.copyFileSync(absoluteSourcePath, candidatePath);

    copiedFiles.push({
      sourcePath: absoluteSourcePath,
      fileName: candidateName,
      targetPath: candidatePath
    });
  }

  const galleryResult = generateProjectGalleries();

  return {
    projectName,
    projectFolder,
    copiedFiles,
    galleryResult
  };
}

function main() {
  try {
    const { projectName, files } = parseArgs(process.argv.slice(2));
    const result = addProjectImages(projectName, files);

    console.log(`Project: ${result.projectName}`);
    console.log(`Folder: ${result.projectFolder}`);

    for (const file of result.copiedFiles) {
      console.log(`Copied: ${file.sourcePath}`);
      console.log(`Saved as: ${file.targetPath}`);
    }

    console.log(`Manifest updated: ${result.galleryResult.outputPath}`);
    console.log(`Manifest status: success`);
  } catch (error) {
    console.error("Add project image failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  addProjectImages,
  normalizeFileName,
  parseArgs,
  removeVietnameseMarks
};

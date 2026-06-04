import http from "node:http";
import net from "node:net";
import path from "node:path";
import os from "node:os";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const thesisImages = [
  "Master.jpg",
  "Node.jpg",
  "Bo_tri.jpg",
  "Full_Board.jpg",
  "Board_Altium.JPG"
];
const forkliftImages = [
  "BMS_RELAY.png"
];
const valveImages = [
  "HP_Valves_Slave.png",
  "HP_Valves_Slave_BOT.png"
];

const viewportCases = [
  { name: "desktop", width: 1366, height: 1100, mobile: false, expectedFlex: "row", expectedColumns: 2 },
  { name: "tablet", width: 820, height: 1180, mobile: false, expectedFlex: "column", expectedColumns: 2 },
  { name: "mobile", width: 390, height: 980, mobile: true, expectedFlex: "column", expectedColumns: 1 }
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getMimeType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".ico":
      return "image/x-icon";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
    server.on("error", reject);
  });
}

async function startStaticServer(rootPath) {
  const port = await getFreePort();

  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host}`);
      let relativePath = decodeURIComponent(requestUrl.pathname);

      if (relativePath === "/") {
        relativePath = "/index.html";
      }

      const normalizedPath = path.normalize(relativePath.replace(/^\/+/, ""));
      const absolutePath = path.resolve(rootPath, normalizedPath);

      if (!absolutePath.startsWith(rootPath)) {
        response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Forbidden");
        return;
      }

      const stats = await fs.stat(absolutePath);

      if (!stats.isFile()) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not Found");
        return;
      }

      const fileBuffer = await fs.readFile(absolutePath);
      response.writeHead(200, {
        "Content-Type": getMimeType(absolutePath),
        "Content-Length": fileBuffer.length
      });
      response.end(fileBuffer);
    } catch (error) {
      const status = error?.code === "ENOENT" ? 404 : 500;
      response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(status === 404 ? "Not Found" : "Internal Server Error");
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(port, "127.0.0.1", resolve);
    server.on("error", reject);
  });

  return { server, port };
}

function findExecutableInPath(command) {
  const whereCommand = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(whereCommand, [command], { encoding: "utf8" });

  if (result.status === 0) {
    const [firstMatch] = result.stdout.split(/\r?\n/).filter(Boolean);
    if (firstMatch && existsSync(firstMatch)) {
      return firstMatch;
    }
  }

  return null;
}

function getBrowserExecutable() {
  const explicitCandidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ];

  for (const candidate of explicitCandidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const pathCandidates = ["chrome.exe", "msedge.exe", "chrome", "msedge"];
  for (const candidate of pathCandidates) {
    const resolved = findExecutableInPath(candidate);
    if (resolved) {
      return resolved;
    }
  }

  throw new Error("No compatible Chromium browser executable was found for gallery verification.");
}

async function waitForDebugger(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  const endpoint = `http://127.0.0.1:${port}/json/version`;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        return await response.json();
      }
    } catch {
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Timed out waiting for Chrome DevTools on port ${port}.`);
}

async function createTarget(port, url) {
  const endpoints = [
    { url: `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, method: "PUT" },
    { url: `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, method: "GET" }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, { method: endpoint.method });
      if (response.ok) {
        return await response.json();
      }
    } catch {
    }
  }

  const listResponse = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await listResponse.json();
  const matchingTarget = targets.find((target) => target.url === url) ?? targets[0];

  if (!matchingTarget?.webSocketDebuggerUrl) {
    throw new Error("Could not create a debuggable page target.");
  }

  return matchingTarget;
}

async function connectCdp(webSocketUrl) {
  const ws = new WebSocket(webSocketUrl);
  const pending = new Map();
  const eventWaiters = new Map();
  let nextId = 0;

  const toText = async (payload) => {
    if (typeof payload === "string") {
      return payload;
    }
    if (payload instanceof ArrayBuffer) {
      return Buffer.from(payload).toString("utf8");
    }
    if (Buffer.isBuffer(payload)) {
      return payload.toString("utf8");
    }
    if (typeof payload?.arrayBuffer === "function") {
      return Buffer.from(await payload.arrayBuffer()).toString("utf8");
    }
    return String(payload);
  };

  const api = {
    async send(method, params = {}) {
      const id = ++nextId;
      ws.send(JSON.stringify({ id, method, params }));

      return await new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject, method });
      });
    },
    waitForEvent(method, predicate = () => true, timeoutMs = 10000) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const waiters = eventWaiters.get(method) ?? [];
          eventWaiters.set(
            method,
            waiters.filter((entry) => entry.resolve !== resolve)
          );
          reject(new Error(`Timed out waiting for CDP event ${method}.`));
        }, timeoutMs);

        const entries = eventWaiters.get(method) ?? [];
        entries.push({
          resolve: (params) => {
            clearTimeout(timeout);
            resolve(params);
          },
          reject,
          predicate
        });
        eventWaiters.set(method, entries);
      });
    },
    async close() {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  };

  ws.addEventListener("message", async (event) => {
    const message = JSON.parse(await toText(event.data));

    if (typeof message.id === "number") {
      const handler = pending.get(message.id);
      if (!handler) {
        return;
      }

      pending.delete(message.id);

      if (message.error) {
        handler.reject(new Error(`${handler.method} failed: ${message.error.message}`));
      } else {
        handler.resolve(message.result);
      }

      return;
    }

    if (!message.method) {
      return;
    }

    const waiters = eventWaiters.get(message.method);
    if (!waiters?.length) {
      return;
    }

    const remaining = [];

    for (const waiter of waiters) {
      try {
        if (waiter.predicate(message.params ?? {})) {
          waiter.resolve(message.params ?? {});
        } else {
          remaining.push(waiter);
        }
      } catch (error) {
        waiter.reject(error);
      }
    }

    eventWaiters.set(message.method, remaining);
  });

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", (event) => {
      reject(event.error ?? new Error("Failed to connect to Chrome DevTools."));
    }, { once: true });
  });

  return api;
}

async function evaluateJson(cdp, expression) {
  const response = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  if (response.exceptionDetails) {
    const description =
      response.exceptionDetails.exception?.description ??
      response.exceptionDetails.text ??
      "Unknown runtime error.";
    throw new Error(description);
  }

  return response.result.value;
}

async function waitForExpression(cdp, expression, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const value = await evaluateJson(cdp, expression);
    if (value) {
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error(`Timed out waiting for browser condition: ${expression}`);
}

async function captureThesisScreenshot(cdp, screenshotPath) {
  await evaluateJson(
    cdp,
    `(() => {
      const thesisRow = document.querySelector(".project-media-gallery--thesis")?.closest(".project-row");
      thesisRow?.scrollIntoView({ block: "center", behavior: "instant" });
      return true;
    })()`
  );

  await new Promise((resolve) => setTimeout(resolve, 220));

  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true
  });

  await fs.writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
}

async function verifyViewport(cdp, baseUrl, viewport, screenshotDir) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile
  });

  await cdp.send("Page.navigate", { url: `${baseUrl}/index.html#projects` });
  await waitForExpression(cdp, 'document.readyState === "complete"');

  await waitForExpression(
    cdp,
    `(() => {
      const gallery = document.querySelector(".thesis-gallery");
      const items = document.querySelectorAll(".thesis-gallery-item");
      const getProjectImages = (projectKey) =>
        Array.from(document.querySelectorAll(\`[data-project-gallery="\${projectKey}"] .auto-project-gallery-thumb\`));
      const autoGalleryReady = (projectImages, expectedImages) =>
        projectImages.length >= expectedImages.length
        && expectedImages.every((name) =>
          projectImages.some((image) => (image.getAttribute("src") || "").includes(name))
        )
        && projectImages.every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
      const forkliftProjectImages = getProjectImages("Forklift-Battery-Protection-Controller");
      const valveProjectImages = getProjectImages("Smart-Industrial-Valve-Controller");
      const thumbsReady = Array.from(document.querySelectorAll(".thesis-gallery-thumb"))
        .every((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
      return Boolean(gallery)
        && items.length === 5
        && thumbsReady
        && autoGalleryReady(forkliftProjectImages, ${JSON.stringify(forkliftImages)})
        && autoGalleryReady(valveProjectImages, ${JSON.stringify(valveImages)});
    })()`
  );

  const initialState = await evaluateJson(
    cdp,
    `(() => {
      const getAutoProjectState = (projectKey) => {
        const galleryRoot = document.querySelector(\`[data-project-gallery="\${projectKey}"]\`);
        const row = galleryRoot?.closest(".project-row");
        const gallery = galleryRoot?.querySelector(".auto-project-gallery");
        const projectImages = Array.from(galleryRoot?.querySelectorAll(".auto-project-gallery-thumb") ?? []);

        return {
          rowExists: Boolean(row),
          galleryExists: Boolean(galleryRoot),
          imageCount: projectImages.length,
          flexDirection: row ? getComputedStyle(row).flexDirection : null,
          rowFitsViewport: row ? row.getBoundingClientRect().right <= window.innerWidth + 2 : false,
          rowNoOverflow: row ? row.scrollWidth <= row.clientWidth + 2 : false,
          galleryNoOverflow: galleryRoot ? galleryRoot.scrollWidth <= galleryRoot.clientWidth + 2 : false,
          gallerySingleClass: gallery ? gallery.classList.contains("auto-project-gallery--single") : false,
          images: projectImages.map((image) => ({
            src: image.getAttribute("src") || "",
            width: image.clientWidth,
            height: image.clientHeight,
            objectFit: getComputedStyle(image).objectFit,
            transition: getComputedStyle(image).transitionProperty,
            overflow: getComputedStyle(image.closest(".auto-project-gallery-item")).overflow
          }))
        };
      };

      const thesisRow = document.querySelector(".project-media-gallery--thesis")?.closest(".project-row");
      const gallery = document.querySelector(".thesis-gallery");
      const lightbox = document.querySelector(".thesis-lightbox");
      const galleryItems = Array.from(document.querySelectorAll(".thesis-gallery-item"));

      return {
        thesisRowExists: Boolean(thesisRow),
        galleryExists: Boolean(gallery),
        lightboxExists: Boolean(lightbox),
        autoProjects: {
          forklift: getAutoProjectState("Forklift-Battery-Protection-Controller"),
          valve: getAutoProjectState("Smart-Industrial-Valve-Controller")
        },
        itemCount: galleryItems.length,
        flexDirection: thesisRow ? getComputedStyle(thesisRow).flexDirection : null,
        columnCount: gallery
          ? getComputedStyle(gallery).gridTemplateColumns.split(" ").filter(Boolean).length
          : 0,
        thesisRowFitsViewport: thesisRow
          ? thesisRow.getBoundingClientRect().right <= window.innerWidth + 2
          : false,
        thesisRowNoOverflow: thesisRow
          ? thesisRow.scrollWidth <= thesisRow.clientWidth + 2
          : false,
        galleryNoOverflow: gallery
          ? gallery.scrollWidth <= gallery.clientWidth + 2
          : false,
        thumbs: galleryItems.map((item) => {
          const image = item.querySelector("img");
          return {
            width: image?.clientWidth ?? 0,
            height: image?.clientHeight ?? 0,
            objectFit: image ? getComputedStyle(image).objectFit : "",
            overflow: getComputedStyle(item).overflow,
            transition: image ? getComputedStyle(image).transitionProperty : "",
            borderRadius: getComputedStyle(item).borderRadius
          };
        }),
        lightboxOpen: lightbox ? lightbox.classList.contains("is-open") : false
      };
    })()`
  );

  assert(initialState.thesisRowExists, `${viewport.name}: thesis project row exists.`);
  assert(initialState.galleryExists, `${viewport.name}: thesis gallery exists.`);
  assert(initialState.lightboxExists, `${viewport.name}: thesis lightbox exists.`);
  assert(initialState.itemCount === thesisImages.length, `${viewport.name}: thesis gallery renders ${thesisImages.length} images.`);
  assert(initialState.flexDirection === viewport.expectedFlex, `${viewport.name}: .project-row keeps expected flex direction ${viewport.expectedFlex}.`);
  assert(initialState.columnCount === viewport.expectedColumns, `${viewport.name}: thesis gallery uses ${viewport.expectedColumns} column(s).`);
  assert(initialState.thesisRowFitsViewport, `${viewport.name}: thesis project row fits inside the viewport.`);
  assert(initialState.thesisRowNoOverflow, `${viewport.name}: thesis project row has no internal horizontal overflow.`);
  assert(initialState.galleryNoOverflow, `${viewport.name}: thesis gallery has no internal horizontal overflow.`);
  assert(!initialState.lightboxOpen, `${viewport.name}: lightbox starts closed.`);

  [
    {
      key: "forklift",
      label: "forklift controller",
      expectedImages: forkliftImages
    },
    {
      key: "valve",
      label: "valve controller",
      expectedImages: valveImages
    }
  ].forEach((project) => {
    const state = initialState.autoProjects[project.key];

    assert(state.rowExists, `${viewport.name}: ${project.label} project row exists.`);
    assert(state.galleryExists, `${viewport.name}: ${project.label} media block exists.`);
    assert(state.imageCount >= project.expectedImages.length, `${viewport.name}: ${project.label} gallery renders at least ${project.expectedImages.length} image(s).`);
    assert(state.flexDirection === viewport.expectedFlex, `${viewport.name}: ${project.label} project row keeps expected flex direction ${viewport.expectedFlex}.`);
    assert(state.rowFitsViewport, `${viewport.name}: ${project.label} project row fits inside the viewport.`);
    assert(state.rowNoOverflow, `${viewport.name}: ${project.label} project row has no internal horizontal overflow.`);
    assert(state.galleryNoOverflow, `${viewport.name}: ${project.label} media block has no internal horizontal overflow.`);
    assert(state.gallerySingleClass === (state.imageCount === 1), `${viewport.name}: ${project.label} single-gallery class matches the image count.`);

    project.expectedImages.forEach((expectedImage, index) => {
      const matchedImage = state.images.find((image) => image.src.includes(expectedImage));

      assert(Boolean(matchedImage), `${viewport.name}: ${project.label} gallery includes ${expectedImage}.`);
      assert(matchedImage.width > 0 && matchedImage.height > 0, `${viewport.name}: ${project.label} image ${index + 1} renders with visible dimensions.`);
      assert(matchedImage.objectFit === "contain", `${viewport.name}: ${project.label} image ${index + 1} uses object-fit contain.`);
      assert(matchedImage.transition.includes("transform"), `${viewport.name}: ${project.label} image ${index + 1} keeps smooth transform transition.`);
      assert(matchedImage.overflow === "hidden", `${viewport.name}: ${project.label} image ${index + 1} stays clipped inside its card.`);
    });
  });

  initialState.thumbs.forEach((thumb, index) => {
    assert(thumb.width > 0 && thumb.height > 0, `${viewport.name}: thesis image ${index + 1} renders with visible dimensions.`);
    assert(thumb.objectFit === "cover", `${viewport.name}: thesis image ${index + 1} preserves crop with object-fit cover.`);
    assert(thumb.overflow === "hidden", `${viewport.name}: thesis image ${index + 1} stays clipped inside its card.`);
    assert(thumb.transition.includes("transform"), `${viewport.name}: thesis image ${index + 1} keeps smooth transform transition.`);
  });

  const closeMethods = ["button", "overlay", "escape", "button", "button"];

  for (let index = 0; index < thesisImages.length; index += 1) {
    const openedState = await evaluateJson(
      cdp,
      `((targetIndex) => {
        const item = document.querySelectorAll(".thesis-gallery-item")[targetIndex];
        item.click();

        const lightbox = document.querySelector(".thesis-lightbox");
        const image = document.querySelector(".thesis-lightbox-img");
        return {
          open: lightbox.classList.contains("is-open"),
          bodyLocked: document.body.classList.contains("thesis-lightbox-open"),
          src: image.getAttribute("src") || ""
        };
      })(${index})`
    );

    assert(openedState.open, `${viewport.name}: lightbox opens for thesis image ${index + 1}.`);
    assert(openedState.bodyLocked, `${viewport.name}: body scroll locks while thesis image ${index + 1} is open.`);
    assert(openedState.src.includes(thesisImages[index]), `${viewport.name}: lightbox shows ${thesisImages[index]}.`);

    const closeMethod = closeMethods[index];

    if (closeMethod === "button") {
      await evaluateJson(
        cdp,
        `(() => {
          document.querySelector(".thesis-lightbox-close").click();
          return true;
        })()`
      );
    } else if (closeMethod === "overlay") {
      await evaluateJson(
        cdp,
        `(() => {
          const overlay = document.querySelector(".thesis-lightbox");
          overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          return true;
        })()`
      );
    } else if (closeMethod === "escape") {
      await evaluateJson(
        cdp,
        `(() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return true;
        })()`
      );
    }

    const closedState = await waitForExpression(
      cdp,
      `(() => {
        const lightbox = document.querySelector(".thesis-lightbox");
        return lightbox && !lightbox.classList.contains("is-open")
          ? {
              closed: true,
              bodyLocked: document.body.classList.contains("thesis-lightbox-open")
            }
          : null;
      })()`
    );

    assert(closedState.closed, `${viewport.name}: lightbox closes after ${closeMethod} interaction for image ${index + 1}.`);
    assert(!closedState.bodyLocked, `${viewport.name}: body scroll unlocks after closing image ${index + 1}.`);
  }

  const screenshotPath = path.join(screenshotDir, `thesis-gallery-${viewport.name}.png`);
  await captureThesisScreenshot(cdp, screenshotPath);

  return screenshotPath;
}

async function main() {
  const screenshotDir = await fs.mkdtemp(path.join(os.tmpdir(), "devmt-thesis-gallery-"));
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "devmt-chrome-profile-"));
  const browserExecutable = getBrowserExecutable();
  const cdpPort = await getFreePort();
  let browserProcess;
  let staticServer;
  let cdp;
  let browserLogs = "";

  try {
    const serverState = await startStaticServer(repoRoot);
    staticServer = serverState.server;
    const baseUrl = `http://127.0.0.1:${serverState.port}`;

    browserProcess = spawn(
      browserExecutable,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        `--remote-debugging-port=${cdpPort}`,
        `--user-data-dir=${userDataDir}`,
        "about:blank"
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    browserProcess.stderr.on("data", (chunk) => {
      browserLogs += chunk.toString();
    });

    browserProcess.stdout.on("data", (chunk) => {
      browserLogs += chunk.toString();
    });

    await waitForDebugger(cdpPort);
    const target = await createTarget(cdpPort, "about:blank");
    cdp = await connectCdp(target.webSocketDebuggerUrl);

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    const screenshots = [];

    for (const viewport of viewportCases) {
      const screenshotPath = await verifyViewport(cdp, baseUrl, viewport, screenshotDir);
      screenshots.push({ viewport: viewport.name, path: screenshotPath });
    }

    console.log("PASS: Project showcase layout and thesis lightbox checks passed.");
    for (const screenshot of screenshots) {
      console.log(`SCREENSHOT ${screenshot.viewport}: ${screenshot.path}`);
    }
  } finally {
    if (cdp) {
      await cdp.close().catch(() => {});
    }

    if (browserProcess && !browserProcess.killed) {
      browserProcess.kill();
    }

    if (staticServer) {
      await new Promise((resolve) => staticServer.close(resolve));
    }

    await fs.rm(userDataDir, { recursive: true, force: true }).catch(() => {});

    if (browserLogs.trim()) {
      const filteredLogs = browserLogs
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .slice(-10)
        .join("\n");

      if (filteredLogs) {
        console.error("BROWSER LOGS:");
        console.error(filteredLogs);
      }
    }
  }
}

await main();

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

const viewportCases = [
  { name: "desktop", width: 1366, height: 1100, mobile: false, expectedStacked: false, expectedFormColumns: 2 },
  { name: "tablet", width: 820, height: 1180, mobile: false, expectedStacked: true, expectedFormColumns: 2 },
  { name: "mobile", width: 390, height: 980, mobile: true, expectedStacked: true, expectedFormColumns: 1 }
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
    case ".mjs":
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

  throw new Error("No compatible Chromium browser executable was found for contact verification.");
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
    async close() {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  };

  ws.addEventListener("message", async (event) => {
    const message = JSON.parse(await toText(event.data));

    if (typeof message.id !== "number") {
      return;
    }

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

async function captureContactScreenshot(cdp, screenshotPath) {
  await evaluateJson(
    cdp,
    `(() => {
      const contactSection = document.querySelector("#contact");
      contactSection?.scrollIntoView({ block: "center", behavior: "instant" });
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

  await cdp.send("Page.navigate", { url: `${baseUrl}/index.html#contact` });
  await waitForExpression(cdp, 'document.readyState === "complete"');
  await waitForExpression(
    cdp,
    `(() => {
      const qrImage = document.querySelector(".contact-qr-image");
      return Boolean(document.querySelector(".contact-layout"))
        && Boolean(document.querySelector(".contact-form-shell"))
        && Boolean(document.querySelector(".contact-card--zalo"))
        && Boolean(document.getElementById("contact-form"))
        && qrImage
        && qrImage.complete
        && qrImage.naturalWidth > 0
        && qrImage.naturalHeight > 0;
    })()`
  );

  const state = await evaluateJson(
    cdp,
    `(() => {
      const section = document.querySelector("#contact");
      const layout = document.querySelector(".contact-layout");
      const sidebar = document.querySelector(".contact-sidebar");
      const formShell = document.querySelector(".contact-form-shell");
      const qrCard = document.querySelector(".contact-card--zalo");
      const qrShell = document.querySelector(".contact-qr-shell");
      const qrImage = document.querySelector(".contact-qr-image");
      const form = document.getElementById("contact-form");
      const inputGroup = form?.querySelector(".input-group");
      const submitButton = form?.querySelector(".btn");

      const sidebarRect = sidebar?.getBoundingClientRect();
      const formRect = formShell?.getBoundingClientRect();
      const qrShellRect = qrShell?.getBoundingClientRect();
      const qrImageRect = qrImage?.getBoundingClientRect();

      const sameTopRow = sidebarRect && formRect ? Math.abs(sidebarRect.top - formRect.top) <= 12 : false;
      const alignedColumn = sidebarRect && formRect ? Math.abs(sidebarRect.left - formRect.left) <= 12 : false;

      return {
        sectionExists: Boolean(section),
        layoutExists: Boolean(layout),
        sidebarExists: Boolean(sidebar),
        qrCardExists: Boolean(qrCard),
        formShellExists: Boolean(formShell),
        formExists: Boolean(form),
        qrSrc: qrImage?.getAttribute("src") || "",
        qrLoaded: Boolean(qrImage?.complete && qrImage?.naturalWidth > 0 && qrImage?.naturalHeight > 0),
        qrNaturalWidth: qrImage?.naturalWidth || 0,
        qrNaturalHeight: qrImage?.naturalHeight || 0,
        qrWidth: qrImage?.clientWidth || 0,
        qrHeight: qrImage?.clientHeight || 0,
        qrObjectFit: qrImage ? getComputedStyle(qrImage).objectFit : "",
        qrTransition: qrImage ? getComputedStyle(qrImage).transitionProperty : "",
        qrShellOverflow: qrShell ? getComputedStyle(qrShell).overflow : "",
        cardTransition: qrCard ? getComputedStyle(qrCard).transitionProperty : "",
        gridColumns: layout
          ? getComputedStyle(layout).gridTemplateColumns.split(" ").filter(Boolean).length
          : 0,
        formColumns: inputGroup
          ? getComputedStyle(inputGroup).gridTemplateColumns.split(" ").filter(Boolean).length
          : 0,
        layoutNoOverflow: layout ? layout.scrollWidth <= layout.clientWidth + 2 : false,
        sectionNoOverflow: section ? section.scrollWidth <= section.clientWidth + 2 : false,
        sidebarLeft: sidebarRect?.left || 0,
        sidebarTop: sidebarRect?.top || 0,
        sidebarBottom: sidebarRect?.bottom || 0,
        formLeft: formRect?.left || 0,
        formTop: formRect?.top || 0,
        formBottom: formRect?.bottom || 0,
        twoColumns: Boolean(sidebarRect && formRect && formRect.left > sidebarRect.left + 40 && sameTopRow),
        stacked: Boolean(sidebarRect && formRect && alignedColumn && formRect.top >= sidebarRect.bottom - 4),
        qrInsideShell: Boolean(
          qrShellRect
          && qrImageRect
          && qrImageRect.left >= qrShellRect.left - 1
          && qrImageRect.right <= qrShellRect.right + 1
        ),
        submitVisible: Boolean(submitButton && submitButton.getBoundingClientRect().width > 0)
      };
    })()`
  );

  assert(state.sectionExists, `${viewport.name}: contact section exists.`);
  assert(state.layoutExists, `${viewport.name}: contact layout exists.`);
  assert(state.sidebarExists, `${viewport.name}: contact sidebar exists.`);
  assert(state.qrCardExists, `${viewport.name}: Zalo card exists.`);
  assert(state.formShellExists, `${viewport.name}: contact form shell exists.`);
  assert(state.formExists, `${viewport.name}: contact form exists.`);
  assert(state.qrLoaded, `${viewport.name}: Zalo QR image loads successfully.`);
  assert(state.qrSrc.includes("assets/img/Contact/Zalo.jpg"), `${viewport.name}: contact section uses the Zalo QR asset.`);
  assert(state.qrNaturalWidth > 0 && state.qrNaturalHeight > 0, `${viewport.name}: Zalo QR image has intrinsic dimensions.`);
  assert(state.qrWidth > 0 && state.qrHeight > 0, `${viewport.name}: Zalo QR image renders visibly.`);
  assert(state.qrObjectFit === "contain", `${viewport.name}: Zalo QR image keeps object-fit contain.`);
  assert(state.qrTransition.includes("transform"), `${viewport.name}: Zalo QR image keeps smooth transform transition.`);
  assert(state.cardTransition.includes("transform"), `${viewport.name}: contact card keeps transform transition.`);
  assert(state.qrShellOverflow === "hidden", `${viewport.name}: Zalo QR shell clips hover scaling.`);
  assert(state.qrInsideShell, `${viewport.name}: Zalo QR image stays inside its shell.`);
  assert(state.layoutNoOverflow, `${viewport.name}: contact layout has no internal horizontal overflow.`);
  assert(state.sectionNoOverflow, `${viewport.name}: contact section has no internal horizontal overflow.`);
  assert(state.submitVisible, `${viewport.name}: submit button remains visible.`);
  assert(state.formColumns === viewport.expectedFormColumns, `${viewport.name}: form input group uses ${viewport.expectedFormColumns} column(s).`);

  if (viewport.expectedStacked) {
    assert(state.gridColumns === 1, `${viewport.name}: contact layout collapses to 1 column.`);
    assert(state.stacked, `${viewport.name}: contact sidebar stacks above the form.`);
  } else {
    assert(state.gridColumns === 2, `${viewport.name}: contact layout keeps 2 columns.`);
    assert(state.twoColumns, `${viewport.name}: contact sidebar stays beside the form.`);
  }

  const screenshotPath = path.join(screenshotDir, `contact-layout-${viewport.name}.png`);
  await captureContactScreenshot(cdp, screenshotPath);
  return screenshotPath;
}

async function main() {
  const screenshotDir = await fs.mkdtemp(path.join(os.tmpdir(), "devmt-contact-layout-"));
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "devmt-contact-chrome-profile-"));
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

    console.log("PASS: Contact layout responsive checks passed.");
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

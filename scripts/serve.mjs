import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { gzipSync } from "node:zlib";
const root = resolve("dist");
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let file = resolve(root, "." + pathname);
    if (!file.startsWith(root)) throw new Error("Invalid path");
    try {
      if (!(await stat(file)).isFile()) file = resolve(root, "index.html");
    } catch {
      file = resolve(root, "index.html");
    }
    res.setHeader(
      "Content-Type",
      mime[extname(file)] || "application/octet-stream",
    );
    if (file.endsWith("mockServiceWorker.js")) {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Service-Worker-Allowed", "/");
    }
    const content = await readFile(file);
    if (
      /\.(js|css|html|json|svg)$/.test(file) &&
      req.headers["accept-encoding"]?.includes("gzip")
    ) {
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      res.end(gzipSync(content));
    } else res.end(content);
  } catch {
    res.statusCode = 500;
    res.end("Server error");
  }
}).listen(port, "0.0.0.0", () =>
  console.log(`Kurio ready at http://localhost:${port}`),
);

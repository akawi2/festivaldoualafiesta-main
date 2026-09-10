// Minimal static file server for the built SPA (dist/), used only when
// deploying via a Node-based "web app from GitHub" host (shared hosting
// panel) that expects a running process listening on process.env.PORT.
// Not used for the Docker/Dokploy deployment path (that serves dist/ via
// nginx, see Dockerfile/nginx.conf) or for local dev (use `npm run dev`
// or `npm run preview`).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "dist");
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

const IMMUTABLE_ASSET_RE = /\.(?:css|js|mjs|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$/i;

function securityHeaders(res) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

async function serveFile(res, filePath) {
  const data = await readFile(filePath);
  const contentType = MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
  securityHeaders(res);
  res.setHeader("Content-Type", contentType);
  if (IMMUTABLE_ASSET_RE.test(filePath)) {
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable"); // 30 days
  }
  res.writeHead(200);
  res.end(data);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    // Prevent path traversal outside dist/.
    const safePath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
    const requested = join(DIST_DIR, safePath);

    if (!requested.startsWith(DIST_DIR)) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    const info = await stat(requested).catch(() => null);
    if (info?.isFile()) {
      await serveFile(res, requested);
      return;
    }

    // SPA fallback: any other route (React Router) resolves to index.html.
    await serveFile(res, join(DIST_DIR, "index.html"));
  } catch (err) {
    res.writeHead(500);
    res.end("Internal server error");
    console.error(err);
  }
});

const distIndex = join(DIST_DIR, "index.html");
const distReady = await stat(distIndex).catch(() => null);
if (!distReady) {
  console.error(
    `dist/index.html not found (looked in ${DIST_DIR}). The app hasn't been built. ` +
      `Run "npm run build" (or check that the "postinstall" script ran during deploy) before starting this server.`,
  );
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`Douala Fiesta static server listening on port ${PORT}`);
});

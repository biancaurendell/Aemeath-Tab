import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(".");
const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const requestedPort = portArg ? Number(portArg.slice("--port=".length)) : 5173;
const shouldOpen = process.argv.includes("--open");

const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".cur", "image/x-icon"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"]
]);

function localPathFromUrl(url) {
  const { pathname } = new URL(url, "http://localhost");
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const fullPath = normalize(join(root, requested));
  if (fullPath !== root && !fullPath.startsWith(`${root}${sep}`)) return null;
  return fullPath;
}

const server = createServer(async (request, response) => {
  const filePath = localPathFromUrl(request.url || "/");
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

function startServer(port) {
  server.listen(port, "127.0.0.1", () => {
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}/`;
    console.log(`Aemeath's Tab is running at ${url}`);
    console.log("Press Ctrl+C to stop.");

    if (shouldOpen && process.platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    }
  });
}

startServer(requestedPort);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && requestedPort !== 0) {
    startServer(0);
    return;
  }
  throw error;
});

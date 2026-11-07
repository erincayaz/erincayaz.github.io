// Tiny local preview server (no dependencies). Run: npm run serve
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8" };

createServer((req, res) => {
  let path = join("dist", decodeURIComponent(req.url.split("?")[0]));
  if (!path.startsWith("dist")) path = "dist";
  if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
  if (!existsSync(path)) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
  res.end(readFileSync(path));
}).listen(3000, () => console.log("http://localhost:3000"));

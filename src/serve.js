// Tiny local preview server with live reload (no dependencies). Run: npm run serve
// Watches posts/ and src/, rebuilds on change, and tells open tabs to reload.
// The reload script is injected at serve time only, so dist/ stays clean for deploy.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, watch } from "node:fs";
import { execFile } from "node:child_process";
import { join, extname } from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8" };
const reloadScript = `<script>new EventSource("/__reload").onmessage = () => location.reload();</script>`;

const PORT = process.env.PORT || 3000;
const clients = new Set();

function build(done) {
  execFile("node", ["src/build.js"], (err, stdout, stderr) => {
    if (err) console.error(stderr || err.message);
    done?.(!err);
  });
}

let timer;
const onChange = () => {
  clearTimeout(timer); // editors fire several events per save
  timer = setTimeout(() => build((ok) => {
    if (ok) for (const res of clients) res.write("data: reload\n\n");
  }), 100);
};
for (const dir of ["posts", "src"]) watch(dir, { recursive: true }, onChange);

build(() => {
  createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/__reload") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }
    let path = join("dist", url);
    if (!path.startsWith("dist")) path = "dist";
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) {
      res.writeHead(404).end("Not found");
      return;
    }
    let body = readFileSync(path);
    if (extname(path) === ".html") body = body.toString().replace("</body>", `${reloadScript}</body>`);
    res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
    res.end(body);
  }).listen(PORT, () => console.log(`http://localhost:${PORT} (live reload on)`));
});

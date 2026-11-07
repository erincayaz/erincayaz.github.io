import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, copyFileSync } from "node:fs";
import { marked } from "marked";

// ---- Site settings: edit these ----
const site = {
  title: "Erinç Ayaz",
  bio: "Short bio goes here. Write a sentence or two about yourself.",
  github: "https://github.com/erincayaz",
};

const POSTS_DIR = "posts";
const OUT_DIR = "dist";

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Parses a leading "---\nkey: value\n---" block. Returns { meta, body }.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: match[2] };
}

const formatDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

const template = readFileSync("src/template.html", "utf8");
// Bio + GitHub link, shown on the home page only
const intro = `    <p>${escapeHtml(site.bio)} <a href="${escapeHtml(site.github)}">GitHub</a></p>`;

const render = ({ title, content, root, showIntro = false }) =>
  template
    .replaceAll("{{root}}", root)
    .replaceAll("{{pageTitle}}", escapeHtml(title))
    .replaceAll("{{siteTitle}}", escapeHtml(site.title))
    .replace("{{intro}}", () => (showIntro ? intro : ""))
    .replace("{{content}}", () => content);

function write(path, html) {
  mkdirSync(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  writeFileSync(path, html);
}

// ---- Build ----
rmSync(OUT_DIR, { recursive: true, force: true });
copyFileSync("src/style.css", (mkdirSync(OUT_DIR, { recursive: true }), `${OUT_DIR}/style.css`));

const posts = [];
for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const { meta, body } = parseFrontmatter(readFileSync(`${POSTS_DIR}/${file}`, "utf8"));
  const base = file.replace(/\.md$/, "");
  // Filename like 2026-11-07-my-title.md -> slug "my-title", date from filename if not in frontmatter
  const m = base.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const date = meta.date || (m && m[1]);
  const slug = meta.slug || (m ? m[2] : base);
  const title = meta.title || slug;
  if (meta.draft === "true") continue;
  if (!date) throw new Error(`${file}: needs a date (in frontmatter or as YYYY-MM-DD- filename prefix)`);
  posts.push({ title, date, slug, html: marked.parse(body) });
}
posts.sort((a, b) => b.date.localeCompare(a.date));

for (const p of posts) {
  const content = `<article>
<h1>${escapeHtml(p.title)}</h1>
<time datetime="${p.date}">${formatDate(p.date)}</time>
${p.html}
</article>`;
  write(`${OUT_DIR}/posts/${p.slug}/index.html`, render({ title: `${p.title} · ${site.title}`, content, root: "../../" }));
}

const list = posts
  .map((p) => `<li><a href="posts/${p.slug}/">${escapeHtml(p.title)}</a><time datetime="${p.date}">${formatDate(p.date)}</time></li>`)
  .join("\n");
write(`${OUT_DIR}/index.html`, render({ title: site.title, content: `<ul class="posts">\n${list}\n</ul>`, root: "", showIntro: true }));

console.log(`Built ${posts.length} post(s) into ${OUT_DIR}/`);

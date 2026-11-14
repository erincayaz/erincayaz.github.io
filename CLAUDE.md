# erincayaz.github.io

Erinç Ayaz's personal blog, deployed to GitHub Pages. Currently it is only a list of written posts plus a short bio on the homepage. It will grow when the owner feels like it, not before.

## Guiding principle: keep it simple

- **Add technology only when there is a concrete need.** No frameworks, bundlers, CSS preprocessors, client-side JS, or new dependencies "just in case". The only runtime dependency is `marked`. Before adding any package, ask whether ~20 lines of plain Node would do.
- **Add sections/features only when the owner asks.** Don't invent tags, search, RSS, pagination, comments, analytics, etc. If something would be a natural next step, mention it in a sentence. Don't build it.
- **Extend in place.** Grow the existing files rather than introducing new layers, abstractions or directory structures. A small, readable script beats a flexible one.
- **Smallest change that works.** Don't refactor or restyle things that weren't asked about. Prefer deleting code to adding it.
- When a request is ambiguous about scope, pick the simplest reading and say what you chose.

## How it works

A static site generator in one file: `src/build.js` reads `posts/*.md`, renders them with `marked` into `src/template.html`, and writes plain HTML to `dist/` (git-ignored).

```
posts/            Markdown posts, one file each (the content)
src/build.js      Whole build: frontmatter parsing, rendering, writing dist/
src/template.html Single page shell with {{placeholders}}
src/style.css     All styling (copied verbatim to dist/style.css)
src/serve.js      Dependency-free local preview server on :3000 with live reload (SSE; script injected at serve time only)
.github/workflows/deploy.yml   Builds and deploys to Pages on every push to main
```

### Commands

```bash
npm run build   # build into dist/
npm run serve   # build + preview at http://localhost:3000, rebuilds and reloads the browser on changes to posts/ or src/
```

There are no tests, linter or formatter. Verify changes by running `npm run build` and looking at the result with `npm run serve`.

## Conventions

- **Posts** live in `posts/` as `YYYY-MM-DD-slug.md`. The date and slug come from the filename. Frontmatter (`title`, `date`, `slug`, `draft: true`) is optional and overrides them. Frontmatter is a minimal hand-rolled `key: value` parser, not YAML, so no lists or nesting. A post with no date at all fails the build on purpose. `draft: true` skips a post.
- **Output URLs** are `/posts/<slug>/` (written as `dist/posts/<slug>/index.html`). Don't change URL shapes lightly, since published links shouldn't break.
- **Site settings** (title, bio, GitHub link) are the `site` object at the top of `src/build.js`. This is the config, so edit it there.
- **Bio/intro shows on the homepage only**, not on post pages.
- **Template** uses `{{root}}` for relative paths (`""` on home, `"../../"` on posts). Keep links relative so the site works regardless of base path. All interpolated text goes through `escapeHtml`.
- **Styling** is plain CSS with custom properties in `:root` and a `prefers-color-scheme: dark` override. Reuse the existing variables for new colors, keep the dark-mode variants in sync, and keep the narrow single-column, serif, readable look. No external fonts or CDNs.
- **Code style**: ES modules, Node built-ins first, double quotes, semicolons, 2-space indent, short comments explaining *why*. Node 22 (matches CI).
- **Static assets**: the build currently copies only `style.css`. If images or other files are needed, add the smallest possible copy step to `build.js` at that point (e.g. an `assets/` folder), not before.

## Working with the owner

- Writing is the point of the site. Don't edit, rewrite or "improve" the text of posts or the bio unless asked. When creating a new post, follow the filename convention and leave the content to the owner.
- The deploy runs on every push to `main`. Don't commit or push unless asked.
- The owner's name is spelled Erinç (ç) in the site title; they sometimes write "Erinc" informally in prose, so leave prose as written.

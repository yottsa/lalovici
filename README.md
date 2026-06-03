# Lalovići

A single-page Vue 3 + TypeScript countdown timer (days / hours / minutes / seconds), packaged as a small PWA and deployable to GitHub Pages. The countdown target date and the post-countdown message are configurable via build-time environment variables.

## Prerequisites

- Node.js 20+
- npm

## Local development

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. Vue is bundled from `node_modules` — no CDN.

With no `.env` set, the app falls back to:

- `END_DATE = 2026-03-31T12:00:00+02:00`
- `END_MESSAGE = Dobrodošao!`

To override locally, create a `.env.local` file (gitignored):

```
VITE_END_DATE=2027-06-15T18:00:00+02:00
VITE_END_MESSAGE=Welcome!
```

See `.env.example` for the template.

## Type checking

```bash
npm run typecheck  # runs vue-tsc --noEmit
```

`npm run build` runs the same typecheck before bundling, so type errors fail the build.

## Production build

```bash
npm run build      # vue-tsc --noEmit && vite build → outputs to dist/
npm run preview    # serves dist/ locally for sanity checking
```

To build with explicit values:

```bash
VITE_END_DATE="2027-06-15T18:00:00+02:00" \
VITE_END_MESSAGE="Welcome!" \
npm run build
```

The build emits `dist/` with hashed asset filenames, the PWA manifest, the service worker, and icons. All paths are relative (`./`), so the output works whether deployed at `user.github.io/` or `user.github.io/<repo>/`.

## Deployment to GitHub Pages

Deployment is fully automated by GitHub Actions (`.github/workflows/deploy.yml`). **Every push to `main` builds the site on a GitHub runner and publishes it to Pages** — there is no local build step and no `gh-pages` branch.

The countdown values come from **GitHub Actions repository variables**, _not_ from your local `.env`. Your local `.env` only affects `npm run dev` / a local `npm run build`; it is gitignored and never reaches the runner.

### One-time repo setup

Do this once, in the GitHub web UI:

1. **Set Pages source to Actions**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.

   > ⚠️ It must be **GitHub Actions**, not "Deploy from a branch". If a `gh-pages` branch still exists from the old flow, delete it (`git push origin --delete gh-pages`) so it can't be served by mistake.

2. **Set the countdown variables**: Settings → Secrets and variables → **Actions** → **Variables** tab → **New repository variable**, twice:

   | Name | Example value |
   |------|---------------|
   | `VITE_END_DATE` | `2026-07-21T01:00:00+02:00` |
   | `VITE_END_MESSAGE` | `Dobrodošao!` |

   > If `VITE_END_DATE` is unset/empty, the build falls back to the hardcoded default in `src/main.ts` (`2026-03-31T12:00:00+02:00`).

### Deploying new changes

Just push to `main`:

```bash
git add -A
git commit -m "your message"
git push origin main
```

The **Deploy to GitHub Pages** workflow runs automatically (watch it under the repo's **Actions** tab). After it finishes (~1–2 min), visit `https://<your-user>.github.io/<repo>/`.

You can also trigger a deploy without a code change: Actions tab → **Deploy to GitHub Pages** → **Run workflow** (this uses `workflow_dispatch`).

### Updating the countdown date/message later

No code change or push needed:

1. Settings → Secrets and variables → Actions → Variables → edit `VITE_END_DATE` (and/or `VITE_END_MESSAGE`).
2. Actions tab → **Deploy to GitHub Pages** → **Run workflow** to rebuild with the new value.

> The deployed JS filename is content-hashed (e.g. `index-XXXXXXXX.js`). If you change the date and the filename _doesn't_ change, the new value didn't make it into the build — check that the `VITE_END_DATE` **variable** (not your `.env`) was updated.

## Project layout

```
.
├── index.html               # entry HTML (Vite-served)
├── src/
│   ├── main.ts              # Vue app + countdown logic + SW registration
│   └── vite-env.d.ts        # types for import.meta.env.VITE_*
├── public/                  # copied as-is into dist/ (not type-checked)
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── .env.example             # documents VITE_END_DATE / VITE_END_MESSAGE
```

## PWA / service worker

The service worker (`public/service-worker.js`, cache name `lalovici-cache-v3`) precaches the app shell (HTML, manifest, icons) on install and serves all GET requests network-first with cache fallback. The hashed JS bundle is cached lazily on first fetch, so offline support kicks in after one online visit. The page registers the worker on `load` and auto-reloads when a new version activates.

The SW stays plain JavaScript because files under `public/` are copied verbatim by Vite — they are not transformed or type-checked.

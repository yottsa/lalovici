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

The site is built locally on your machine and published to a `gh-pages` branch using the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package. No GitHub Actions, no server-side build.

### One-time repo setup

1. Push this repo to GitHub (you already have an `origin` remote on `main`).
2. **Enable Pages**: GitHub → Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **`gh-pages`** / **`(root)`**. (The branch is created automatically by your first deploy — you may need to come back here after that to select it.)

### Deploying

1. Create a `.env` (or `.env.local`) with the values you want baked into this build:

   ```
   VITE_END_DATE=2026-07-21T01:00:00+02:00
   VITE_END_MESSAGE=Dobrodošao!
   ```

2. Run:

   ```bash
   npm run deploy
   ```

   This runs `npm run build` (typecheck + Vite build → `dist/`), then `gh-pages -d dist`, which commits the contents of `dist/` to the `gh-pages` branch on `origin` and force-pushes it.

3. Wait ~1 minute, then visit `https://<your-user>.github.io/<repo>/`.

### Updating the countdown later

Edit `.env`, run `npm run deploy` again. No code change required.

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

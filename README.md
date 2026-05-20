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

Deployment is automated via `.github/workflows/deploy.yml`: every push to `main` (and manual `workflow_dispatch` runs) builds and publishes `dist/` to GitHub Pages.

One-time repo setup:

1. **Enable Pages**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. **Set build variables**: Settings → Secrets and variables → Actions → **Variables** tab. Add:
   - `END_DATE` — ISO 8601 string, e.g. `2026-03-31T12:00:00+02:00`
   - `END_MESSAGE` — string, e.g. `Dobrodošao!`

   These are repository Variables (not Secrets) — they're not sensitive, and the workflow reads them as `${{ vars.END_DATE }}` / `${{ vars.END_MESSAGE }}`.

3. Push to `main`, or trigger the workflow manually from the Actions tab. The published URL is shown in the deploy job summary.

To change the countdown date or message later, update the repo Variables and re-run the workflow — no code change required.

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
├── .env.example             # documents VITE_END_DATE / VITE_END_MESSAGE
└── .github/workflows/deploy.yml
```

## PWA / service worker

The service worker (`public/service-worker.js`, cache name `lalovici-cache-v3`) precaches the app shell (HTML, manifest, icons) on install and serves all GET requests network-first with cache fallback. The hashed JS bundle is cached lazily on first fetch, so offline support kicks in after one online visit. The page registers the worker on `load` and auto-reloads when a new version activates.

The SW stays plain JavaScript because files under `public/` are copied verbatim by Vite — they are not transformed or type-checked.

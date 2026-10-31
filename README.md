# Lalovići

A single-page Vue 3 + TypeScript countdown timer (days / hours / minutes / seconds), packaged as a small PWA and deployable to GitHub Pages. The countdown target date and the post-countdown message are configurable via build-time environment variables. Pressing and holding any countdown card for 3 seconds opens a dialog showing the target date (formatted in Serbian, in the viewer's local time zone).

## Prerequisites

- Node.js 22+
- npm

## Local development

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. Vue is bundled from `node_modules` — no CDN. Templates are precompiled, so only the Vue runtime ships.

With no `.env` set, the app falls back to:

- `END_DATE = 2027-03-31T12:00:00+02:00`
- `END_MESSAGE = Dobrodošao!`

To override locally, create a `.env.local` file (gitignored):

```
VITE_END_DATE=2027-06-15T18:00:00+02:00
VITE_END_MESSAGE=Welcome!
```

See `.env.example` for the template.

## Type checking and tests

```bash
npm run typecheck  # vue-tsc on src/ and on vite.config.ts
npm test           # Vitest unit tests (countdown maths, Serbian plural labels)
```

`npm run build` runs the same typecheck before bundling, so type errors fail the build. CI runs the tests before every deploy.

A malformed `VITE_END_DATE` (anything `Date.parse` can't read) also fails the build, so a typo in the GitHub variable never ships a broken countdown.

## Production build

```bash
npm run build      # typecheck && vite build → outputs to dist/
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

The countdown values come from **GitHub Actions environment variables** stored in a named environment called **`production`**, _not_ from your local `.env`. Your local `.env` only affects `npm run dev` / a local `npm run build`; it is gitignored and never reaches the runner.

> The environment name matters: the `build` job in `.github/workflows/deploy.yml` declares `environment: production`, and `${{ vars.VITE_END_DATE }}` only resolves to that environment's variables because of that line. If you name the environment something else, change that line to match.

### One-time repo setup

Do this once, in the GitHub web UI:

1. **Set Pages source to Actions**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.

   > ⚠️ It must be **GitHub Actions**, not "Deploy from a branch". If a `gh-pages` branch still exists from the old flow, delete it (`git push origin --delete gh-pages`) so it can't be served by mistake.

2. **Create the environment and add the variables**: Settings → **Environments** → **New environment** → name it **`production`**. Open it → **Environment variables** → **Add variable**, twice:

   | Name | Example value |
   |------|---------------|
   | `VITE_END_DATE` | `2026-07-21T01:00:00+02:00` |
   | `VITE_END_MESSAGE` | `Dobrodošao!` |

   > (You can also reach this via Settings → Secrets and variables → Actions → Variables → **Manage environment variables**.)
   >
   > If `VITE_END_DATE` is unset/empty, the build falls back to the hardcoded default in `src/main.ts` (`2027-03-31T12:00:00+02:00`).

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

1. Settings → Environments → **`production`** → edit `VITE_END_DATE` (and/or `VITE_END_MESSAGE`).
2. Actions tab → **Deploy to GitHub Pages** → **Run workflow** to rebuild with the new value.

> The deployed JS filename is content-hashed (e.g. `index-XXXXXXXX.js`). If you change the date and the filename _doesn't_ change, the new value didn't make it into the build — check that the `VITE_END_DATE` **variable** (not your `.env`) was updated.

## Project layout

```
.
├── index.html               # entry HTML (Vite-served) + global styles
├── src/
│   ├── main.ts              # reads env config, mounts App, registers the SW
│   ├── App.vue              # countdown component (template + timer)
│   ├── countdown.ts         # pure helpers: time split, Serbian plurals, padding
│   ├── countdown.test.ts    # Vitest tests for countdown.ts
│   └── vite-env.d.ts        # types for import.meta.env.VITE_* and the PWA virtual module
├── public/                  # copied as-is into dist/ (not type-checked)
│   └── icons/
├── vite.config.ts           # Vite + Vue plugin + vite-plugin-pwa, VITE_END_DATE check
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── .env.example             # documents VITE_END_DATE / VITE_END_MESSAGE
```

## PWA / offline support

The app is an installable PWA built with [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (Workbox, `generateSW` mode). The manifest and service worker are generated at build time from `vite.config.ts` (`dist/manifest.webmanifest`, `dist/sw.js`).

- **Fully offline after the first visit**: on install, the service worker precaches the entire build (HTML, hashed JS bundle, icons, manifest). Once installed (or opened once online), the app opens and runs without any network connection.
- **Updates**: when a new version is deployed and the app is opened online, the new worker installs, activates immediately (`registerType: 'autoUpdate'`), and the page reloads with the new build. Old caches are cleaned up automatically.
- Registration happens in `src/main.ts` via `registerSW` from `virtual:pwa-register`.

`package.json` `overrides` bump `glob` (in `workbox-build`) and `ejs` (only used by `workbox-build`'s off-main-thread plugin) to patched versions to clear `npm audit` advisories in the build tooling; remove them once vite-plugin-pwa ships updated dependencies. One low-severity advisory (`deepmerge`) remains because no patched version exists; it only runs at build time on this project's own config.

To test offline locally: `npm run build && npm run preview`, open the page once, then in DevTools → Network select **Offline** and reload.

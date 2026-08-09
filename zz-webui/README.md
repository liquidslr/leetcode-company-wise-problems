# zz-webui

Static site (Vite + TypeScript + Tailwind CSS) for browsing the LeetCode company-wise questions in the [repo root](..).
Named `zz-webui` (not `webui`) so it sorts after every company folder in file listings.

## Develop

```sh
npm install
npm run dev
```

`npm run dev` and `npm run build` both start by running `npm run build-data`, which parses the CSVs in each company folder at the repo root into JSON files in `public/data/` (gitignored, regenerated every time).

## Build

```sh
npm run build
```

Output goes to `dist/`.

## Deploy

Every push to `main` triggers [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml), which rebuilds the data + app and publishes `dist/` to GitHub Pages. So updating any company CSV and pushing automatically refreshes the live site.

Requires the repo's Settings → Pages → Source to be set to "GitHub Actions" (one-time, manual).

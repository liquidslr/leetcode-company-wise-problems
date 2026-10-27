# Web UI

A small Vite app for browsing the company-wise question lists in this repo.

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in web/dist (CSVs copied to dist/data)
```

No generated files are committed: `plugins/companies-data.js` scans the company
folders at dev/build time, exposes the index as `virtual:companies`, serves the
CSVs under `/data/` in dev, and copies them into the bundle on build.

```
web/
├── index.html
├── vite.config.js
├── plugins/companies-data.js   # repo → company index + CSV serving/copying
└── src/
    ├── main.js                 # bootstraps app, hash routing (#/<company>/<period>)
    ├── style.css
    ├── lib/                    # csv parser, data loading, DOM helper
    └── components/             # sidebar, company view, question table, tags
```

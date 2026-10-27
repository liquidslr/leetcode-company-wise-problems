import fs from "node:fs";
import path from "node:path";

/**
 * Exposes the repo's company folders to the app without a checked-in index.
 *
 *  - `virtual:companies` : the company list + question counts per period,
 *                          computed from the CSVs at dev/build time.
 *  - `/data/<company>/<file>.csv` : served from the repo in dev, and copied
 *                          into the bundle on build.
 */

export const PERIODS = [
  { file: "1. Thirty Days.csv", label: "30 Days" },
  { file: "2. Three Months.csv", label: "3 Months" },
  { file: "3. Six Months.csv", label: "6 Months" },
  { file: "4. More Than Six Months.csv", label: "6+ Months" },
  { file: "5. All.csv", label: "All Time" },
];

const VIRTUAL_ID = "virtual:companies";
const RESOLVED_ID = "\0" + VIRTUAL_ID;
const IGNORED_DIRS = new Set(["web", "node_modules"]);

function countRows(file) {
  if (!fs.existsSync(file)) return 0;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  return Math.max(lines.length - 1, 0);
}

function scanCompanies(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !IGNORED_DIRS.has(d.name))
    .map((d) => {
      const dir = path.join(root, d.name);
      const counts = PERIODS.map((p) => countRows(path.join(dir, p.file)));
      return { name: d.name, counts };
    })
    .filter((c) => PERIODS.some((p) => fs.existsSync(path.join(root, c.name, p.file))))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export default function companiesData({ root }) {
  return {
    name: "companies-data",

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      const data = { periods: PERIODS, companies: scanCompanies(root) };
      return `export default ${JSON.stringify(data)};`;
    },

    configureServer(server) {
      server.middlewares.use("/data", (req, res, next) => {
        const rel = decodeURIComponent((req.url || "").split("?")[0]);
        const file = path.resolve(root, "." + rel);
        if (!file.startsWith(root) || !file.endsWith(".csv") || !fs.existsSync(file)) {
          return next();
        }
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        fs.createReadStream(file).pipe(res);
      });
    },

    generateBundle() {
      for (const { name } of scanCompanies(root)) {
        for (const { file } of PERIODS) {
          const src = path.join(root, name, file);
          if (!fs.existsSync(src)) continue;
          this.emitFile({
            type: "asset",
            fileName: `data/${name}/${file}`,
            source: fs.readFileSync(src),
          });
        }
      }
    },
  };
}

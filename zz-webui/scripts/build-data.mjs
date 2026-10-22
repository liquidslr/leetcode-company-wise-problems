#!/usr/bin/env node
// Parses the company CSV folders at the repo root and emits JSON consumed by the web UI.
import { readdirSync, statSync, readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const companiesDir = join(__dirname, "..", "..");
const outDir = join(__dirname, "..", "public", "data");

// Top-level entries that aren't company folders.
const NON_COMPANY_DIRS = new Set(["zz-webui", ".git", ".github"]);

const FREQUENCY_FILES = [
  ["thirtyDays", "1. Thirty Days.csv"],
  ["threeMonths", "2. Three Months.csv"],
  ["sixMonths", "3. Six Months.csv"],
  ["moreThanSixMonths", "4. More Than Six Months.csv"],
  ["all", "5. All.csv"],
];

// Minimal RFC 4180 style CSV parser (handles quoted fields with embedded commas).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function parseCsvRows(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  const idx = {
    difficulty: header.indexOf("Difficulty"),
    title: header.indexOf("Title"),
    frequency: header.indexOf("Frequency"),
    acceptanceRate: header.indexOf("Acceptance Rate"),
    link: header.indexOf("Link"),
    topics: header.indexOf("Topics"),
  };
  return body
    .filter((cols) => cols.length > 1 && cols[idx.title])
    .map((cols) => ({
      difficulty: cols[idx.difficulty] ?? "",
      title: cols[idx.title] ?? "",
      frequency: Number(cols[idx.frequency]) || 0,
      acceptanceRate: Number(cols[idx.acceptanceRate]) || 0,
      link: cols[idx.link] ?? "",
      topics: (cols[idx.topics] ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }));
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function build() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const companyNames = readdirSync(companiesDir).filter(
    (name) => !NON_COMPANY_DIRS.has(name) && !name.startsWith(".") && statSync(join(companiesDir, name)).isDirectory()
  );

  const slugs = new Map();
  const index = [];

  for (const name of companyNames) {
    const slug = slugify(name);
    const existing = slugs.get(slug);
    if (existing) {
      throw new Error(`Slug collision: "${existing}" and "${name}" both slugify to "${slug}"`);
    }
    slugs.set(slug, name);

    const companyDir = join(companiesDir, name);
    const frequencies = {};
    const counts = {};
    for (const [key, fileName] of FREQUENCY_FILES) {
      const filePath = join(companyDir, fileName);
      let rows = [];
      try {
        rows = parseCsvRows(readFileSync(filePath, "utf8"));
      } catch {
        rows = [];
      }
      frequencies[key] = rows;
      counts[key] = rows.length;
    }

    writeFileSync(join(outDir, `${slug}.json`), JSON.stringify({ company: name, frequencies }));
    index.push({ name, slug, counts });
  }

  index.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(join(outDir, "index.json"), JSON.stringify(index));

  console.log(`Built data for ${index.length} companies into ${outDir}`);
}

build();

import { parseCsv } from "./csv.js";

const cache = new Map();

/** Acceptance is stored either as a percent (54.2) or as percent/10000 (0.0058). */
function toPercent(raw) {
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return null;
  return n <= 1 ? n * 10000 : n;
}

function toQuestion(cols, header) {
  const get = (key) => cols[header.indexOf(key)] ?? "";
  return {
    title: get("Title"),
    link: get("Link"),
    difficulty: get("Difficulty").toUpperCase(),
    frequency: parseFloat(get("Frequency")) || 0,
    acceptance: toPercent(get("Acceptance Rate")),
    topics: get("Topics")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

export async function loadQuestions(company, periodFile) {
  const url = `${import.meta.env.BASE_URL}data/${encodeURIComponent(company)}/${encodeURIComponent(periodFile)}`;
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${url}`);
          return res.text();
        })
        .then((text) => {
          const [header = [], ...rows] = parseCsv(text);
          return rows.map((r) => toQuestion(r, header));
        })
        .catch((err) => {
          cache.delete(url);
          throw err;
        }),
    );
  }
  return cache.get(url);
}

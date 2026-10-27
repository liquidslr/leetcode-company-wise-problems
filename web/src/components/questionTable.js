import { h } from "../lib/dom.js";
import { DIFFICULTIES, difficultyTag, topicTag } from "./tags.js";

const COLUMNS = [
  { key: "index", label: "#", sortable: false },
  { key: "title", label: "Title" },
  { key: "difficulty", label: "Difficulty" },
  { key: "frequency", label: "Frequency" },
  { key: "acceptance", label: "Acceptance" },
  { key: "topics", label: "Topics", sortable: false },
];

const DIFFICULTY_ORDER = Object.fromEntries(DIFFICULTIES.map((d, i) => [d, i]));

function compare(key) {
  if (key === "difficulty") return (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
  if (key === "title") return (a, b) => a.title.localeCompare(b.title);
  return (a, b) => (a[key] ?? -1) - (b[key] ?? -1);
}

function applyFilters(questions, f) {
  const q = f.search.toLowerCase();
  return questions.filter(
    (x) =>
      (!q || x.title.toLowerCase().includes(q)) &&
      (!f.difficulty || x.difficulty === f.difficulty) &&
      (!f.topic || x.topics.includes(f.topic)),
  );
}

/** Filter bar + sortable table for a list of questions. */
export function renderQuestionTable(questions) {
  const state = { search: "", difficulty: "", topic: "", sort: "frequency", dir: -1 };
  const topics = [...new Set(questions.flatMap((q) => q.topics))].sort();

  const searchInput = h("input", {
    class: "input",
    type: "search",
    placeholder: "Search questions…",
    oninput: (e) => update({ search: e.target.value.trim() }),
  });

  const topicSelect = h(
    "select",
    { class: "input", onchange: (e) => update({ topic: e.target.value }) },
    h("option", { value: "" }, "All topics"),
    topics.map((t) => h("option", { value: t }, t)),
  );

  const diffButtons = ["", ...DIFFICULTIES].map((d) =>
    h(
      "button",
      { type: "button", class: "chip", "data-value": d, onclick: () => update({ difficulty: d }) },
      d ? d[0] + d.slice(1).toLowerCase() : "All",
    ),
  );

  const summary = h("p", { class: "muted summary" });
  const thead = h("thead");
  const tbody = h("tbody");

  function update(patch) {
    Object.assign(state, patch);
    topicSelect.value = state.topic;
    draw();
  }

  function setSort(key) {
    update(state.sort === key ? { dir: -state.dir } : { sort: key, dir: key === "title" || key === "difficulty" ? 1 : -1 });
  }

  function drawHead() {
    thead.replaceChildren(
      h(
        "tr",
        {},
        COLUMNS.map((c) => {
          const active = state.sort === c.key;
          const arrow = active ? (state.dir === 1 ? " ↑" : " ↓") : "";
          return h(
            "th",
            { class: `col-${c.key}${c.sortable === false ? "" : " sortable"}`, onclick: c.sortable === false ? null : () => setSort(c.key) },
            c.label + arrow,
          );
        }),
      ),
    );
  }

  function drawRow(q, i) {
    return h(
      "tr",
      {},
      h("td", { class: "col-index muted" }, i + 1),
      h("td", { class: "col-title" }, h("a", { href: q.link, target: "_blank", rel: "noopener" }, q.title)),
      h("td", { class: "col-difficulty" }, difficultyTag(q.difficulty)),
      h(
        "td",
        { class: "col-frequency" },
        h("div", { class: "freq" }, h("div", { class: "freq-bar", style: `width:${Math.min(q.frequency, 100)}%` }), h("span", {}, q.frequency.toFixed(1))),
      ),
      h("td", { class: "col-acceptance" }, q.acceptance == null ? "—" : `${q.acceptance.toFixed(1)}%`),
      h("td", { class: "col-topics" }, h("div", { class: "tags" }, q.topics.map((t) => topicTag(t, (topic) => update({ topic }))))),
    );
  }

  function draw() {
    for (const b of diffButtons) b.classList.toggle("active", b.dataset.value === state.difficulty);
    const cmp = compare(state.sort);
    const rows = applyFilters(questions, state).sort((a, b) => cmp(a, b) * state.dir);
    summary.textContent = `Showing ${rows.length} of ${questions.length} questions`;
    drawHead();
    tbody.replaceChildren(
      ...(rows.length ? rows.map(drawRow) : [h("tr", {}, h("td", { colspan: COLUMNS.length, class: "empty-row muted" }, "No questions match these filters."))]),
    );
  }

  draw();

  return h(
    "div",
    {},
    h("div", { class: "filters" }, searchInput, h("div", { class: "chips" }, diffButtons), topicSelect),
    summary,
    h("div", { class: "table-wrap" }, h("table", {}, thead, tbody)),
  );
}

import { h } from "../lib/dom.js";
import { loadQuestions } from "../lib/api.js";
import { renderQuestionTable } from "./questionTable.js";
import { comingSoon } from "./tags.js";

/** Company header, period tabs and the question table for the selected period. */
export function renderCompanyView({ company, periods, periodIndex, onPeriod }) {
  const tabs = h(
    "nav",
    { class: "tabs" },
    periods.map((p, i) =>
      h(
        "button",
        { type: "button", class: `tab${i === periodIndex ? " active" : ""}${company.counts[i] ? "" : " empty"}`, onclick: () => onPeriod(i) },
        p.label,
        h("span", { class: "count" }, company.counts[i] || "–"),
      ),
    ),
  );

  const body = h("div", { class: "panel" });
  const period = periods[periodIndex];

  if (!company.counts[periodIndex]) {
    body.append(comingSoon(`No ${period.label.toLowerCase()} questions for ${company.name} yet.`));
  } else {
    body.append(h("p", { class: "muted" }, "Loading…"));
    loadQuestions(company.name, period.file)
      .then((questions) => body.replaceChildren(questions.length ? renderQuestionTable(questions) : comingSoon()))
      .catch(() => body.replaceChildren(comingSoon("Couldn't load this list.")));
  }

  return h("section", {}, h("h2", { class: "company-title" }, company.name), tabs, body);
}

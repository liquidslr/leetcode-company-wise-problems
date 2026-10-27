import data from "virtual:companies";
import { renderSidebar } from "./components/sidebar.js";
import { renderCompanyView } from "./components/companyView.js";
import { comingSoon } from "./components/tags.js";
import { h } from "./lib/dom.js";
import "./style.css";

const { companies, periods } = data;
const byName = new Map(companies.map((c) => [c.name, c]));
const DEFAULT_PERIOD = periods.length - 1; // All Time

const view = document.getElementById("view");
document.getElementById("company-total").textContent = `${companies.length} companies`;

const setActive = renderSidebar({
  companies,
  listEl: document.getElementById("company-list"),
  searchEl: document.getElementById("company-search"),
});

/** Route format: #/<company>/<periodIndex> */
function parseHash() {
  const [, name = "", period = ""] = location.hash.split("/");
  const p = Number.parseInt(period, 10);
  return { name: decodeURIComponent(name), period: Number.isInteger(p) && periods[p] ? p : DEFAULT_PERIOD };
}

function navigate(name, period) {
  location.hash = `#/${encodeURIComponent(name)}/${period}`;
}

function render() {
  const { name, period } = parseHash();
  const company = byName.get(name);
  setActive(company?.name);

  if (!company) {
    view.replaceChildren(
      name
        ? comingSoon(`No data for “${name}” yet.`)
        : h("div", { class: "placeholder muted" }, "Pick a company from the list to see its questions."),
    );
    return;
  }
  view.replaceChildren(
    renderCompanyView({ company, periods, periodIndex: period, onPeriod: (i) => navigate(company.name, i) }),
  );
  document.title = `${company.name} · LeetCode Company Problems`;
}

window.addEventListener("hashchange", render);
render();

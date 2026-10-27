import { h } from "../lib/dom.js";

/** Renders the searchable company list. Returns a function to update the active item. */
export function renderSidebar({ companies, listEl, searchEl }) {
  const items = companies.map((c) => {
    const total = c.counts.at(-1);
    const el = h(
      "li",
      {},
      h(
        "a",
        { href: `#/${encodeURIComponent(c.name)}` },
        h("span", { class: "company-name" }, c.name),
        total ? h("span", { class: "count" }, total) : h("span", { class: "count soon" }, "soon"),
      ),
    );
    return { name: c.name, key: c.name.toLowerCase(), el };
  });
  listEl.replaceChildren(...items.map((i) => i.el));

  searchEl.addEventListener("input", () => {
    const q = searchEl.value.trim().toLowerCase();
    for (const i of items) i.el.hidden = q && !i.key.includes(q);
  });

  return function setActive(name) {
    for (const i of items) i.el.classList.toggle("active", i.name === name);
  };
}

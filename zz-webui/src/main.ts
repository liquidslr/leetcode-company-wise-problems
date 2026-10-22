import "./style.css";

type Row = {
  difficulty: string;
  title: string;
  frequency: number;
  acceptanceRate: number;
  link: string;
  topics: string[];
};

type FrequencyKey = "thirtyDays" | "threeMonths" | "sixMonths" | "moreThanSixMonths" | "all";

type CompanyData = {
  company: string;
  frequencies: Record<FrequencyKey, Row[]>;
};

type IndexEntry = {
  name: string;
  slug: string;
  counts: Record<FrequencyKey, number>;
};

const FREQUENCY_LABELS: Record<FrequencyKey, string> = {
  thirtyDays: "Last 30 Days",
  threeMonths: "Last 3 Months",
  sixMonths: "Last 6 Months",
  moreThanSixMonths: "More Than 6 Months",
  all: "All Time",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
};

const SOLVED_KEY = "leetcode-solved";

function loadSolved(): Set<string> {
  try {
    const raw = localStorage.getItem(SOLVED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSolved(solved: Set<string>) {
  localStorage.setItem(SOLVED_KEY, JSON.stringify([...solved]));
}

const solved = loadSolved();
const companyCache = new Map<string, CompanyData>();
const dataUrl = (path: string) => `${import.meta.env.BASE_URL}data/${path}`;

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="max-w-6xl mx-auto px-4 py-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">LeetCode Company-Wise Problems</h1>
      <p class="text-sm text-gray-500 mt-1">Pick a company and a time window to see its questions. Solved state is saved in this browser only.</p>
    </header>

    <div class="flex flex-wrap gap-3 mb-4 items-end">
      <label class="flex flex-col text-sm font-medium text-gray-700">
        Company
        <select id="company-select" class="mt-1 border border-gray-300 rounded-md px-3 py-2 min-w-55 bg-white">
          <option value="">Select a company&hellip;</option>
        </select>
      </label>
      <label class="flex flex-col text-sm font-medium text-gray-700">
        Frequency
        <select id="frequency-select" class="mt-1 border border-gray-300 rounded-md px-3 py-2 bg-white"></select>
      </label>
      <label class="flex flex-col text-sm font-medium text-gray-700">
        Difficulty
        <select id="difficulty-select" class="mt-1 border border-gray-300 rounded-md px-3 py-2 bg-white">
          <option value="ALL">All</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </label>
      <label class="flex flex-col text-sm font-medium text-gray-700 flex-1 min-w-50">
        Search
        <input id="search-input" type="text" placeholder="Title or topic&hellip;" class="mt-1 border border-gray-300 rounded-md px-3 py-2 bg-white" />
      </label>
    </div>

    <p id="status" class="text-sm text-gray-500 mb-2">Select a company to get started.</p>

    <div class="overflow-x-auto border border-gray-200 rounded-lg bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="text-left px-3 py-2 font-semibold text-gray-700 w-16">Solved</th>
            <th class="text-left px-3 py-2 font-semibold text-gray-700">Title</th>
            <th class="text-left px-3 py-2 font-semibold text-gray-700 w-24">Difficulty</th>
            <th class="text-left px-3 py-2 font-semibold text-gray-700 w-24">Frequency</th>
            <th class="text-left px-3 py-2 font-semibold text-gray-700 w-24">Acceptance</th>
            <th class="text-left px-3 py-2 font-semibold text-gray-700">Topics</th>
          </tr>
        </thead>
        <tbody id="table-body" class="divide-y divide-gray-100"></tbody>
      </table>
    </div>
  </div>
`;

const companySelect = document.querySelector<HTMLSelectElement>("#company-select")!;
const frequencySelect = document.querySelector<HTMLSelectElement>("#frequency-select")!;
const difficultySelect = document.querySelector<HTMLSelectElement>("#difficulty-select")!;
const searchInput = document.querySelector<HTMLInputElement>("#search-input")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const tableBody = document.querySelector<HTMLTableSectionElement>("#table-body")!;

for (const [key, label] of Object.entries(FREQUENCY_LABELS) as [FrequencyKey, string][]) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = label;
  if (key === "all") option.selected = true;
  frequencySelect.appendChild(option);
}

function render() {
  const slug = companySelect.value;
  if (!slug) {
    tableBody.innerHTML = "";
    statusEl.textContent = "Select a company to get started.";
    return;
  }

  const data = companyCache.get(slug);
  if (!data) return;

  const frequencyKey = frequencySelect.value as FrequencyKey;
  const difficulty = difficultySelect.value;
  const search = searchInput.value.trim().toLowerCase();

  const rows = data.frequencies[frequencyKey].filter((row) => {
    if (difficulty !== "ALL" && row.difficulty !== difficulty) return false;
    if (!search) return true;
    const haystack = `${row.title} ${row.topics.join(" ")}`.toLowerCase();
    return haystack.includes(search);
  });

  statusEl.textContent = `${rows.length} question${rows.length === 1 ? "" : "s"} in ${data.company} \u2013 ${FREQUENCY_LABELS[frequencyKey]}`;

  tableBody.innerHTML = rows
    .map((row) => {
      const isSolved = solved.has(row.link);
      const badgeClass = DIFFICULTY_BADGE[row.difficulty] ?? "bg-gray-100 text-gray-700";
      return `
        <tr class="${isSolved ? "opacity-60" : ""}">
          <td class="px-3 py-2 text-center">
            <input type="checkbox" data-link="${row.link}" class="solved-checkbox h-4 w-4" ${isSolved ? "checked" : ""} />
          </td>
          <td class="px-3 py-2">
            <a href="${row.link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline ${isSolved ? "line-through" : ""}">${row.title}</a>
          </td>
          <td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-xs font-medium ${badgeClass}">${row.difficulty}</span></td>
          <td class="px-3 py-2">${row.frequency.toFixed(1)}</td>
          <td class="px-3 py-2">${(row.acceptanceRate * 100).toFixed(1)}%</td>
          <td class="px-3 py-2 text-gray-500">${row.topics.join(", ")}</td>
        </tr>
      `;
    })
    .join("");
}

tableBody.addEventListener("change", (event) => {
  const target = event.target as HTMLElement;
  if (!target.classList.contains("solved-checkbox")) return;
  const checkbox = target as HTMLInputElement;
  const link = checkbox.dataset.link!;
  if (checkbox.checked) solved.add(link);
  else solved.delete(link);
  saveSolved(solved);
  render();
});

async function selectCompany(slug: string) {
  if (!slug) {
    render();
    return;
  }
  if (!companyCache.has(slug)) {
    statusEl.textContent = "Loading\u2026";
    const response = await fetch(dataUrl(`${slug}.json`));
    const data = (await response.json()) as CompanyData;
    companyCache.set(slug, data);
  }
  render();
}

companySelect.addEventListener("change", () => selectCompany(companySelect.value));
frequencySelect.addEventListener("change", render);
difficultySelect.addEventListener("change", render);

let searchDebounce: ReturnType<typeof setTimeout> | undefined;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(render, 150);
});

async function init() {
  const response = await fetch(dataUrl("index.json"));
  const companies = (await response.json()) as IndexEntry[];
  for (const company of companies) {
    const option = document.createElement("option");
    option.value = company.slug;
    option.textContent = `${company.name} (${company.counts.all})`;
    companySelect.appendChild(option);
  }
  statusEl.textContent = "Select a company to get started.";
}

init();

import { h } from "../lib/dom.js";

const DIFFICULTY_LABEL = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

export const DIFFICULTIES = Object.keys(DIFFICULTY_LABEL);

export function difficultyTag(level) {
  return h("span", { class: `tag tag-${level.toLowerCase()}` }, DIFFICULTY_LABEL[level] ?? level);
}

export function topicTag(topic, onClick) {
  return h("button", { class: "tag tag-topic", type: "button", title: `Filter by ${topic}`, onclick: () => onClick(topic) }, topic);
}

export function comingSoon(message = "Data for this list isn't available yet.") {
  return h(
    "div",
    { class: "coming-soon" },
    h("span", { class: "tag tag-soon" }, "Coming soon"),
    h("p", { class: "muted" }, message),
  );
}

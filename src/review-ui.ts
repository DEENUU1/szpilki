import { intervalLabel, ratingPreviews } from "./repetition";
import type { ScheduledCard, StudyRating } from "./repetition";
export function ratingButtons(
  card: ScheduledCard | undefined,
  language: "pl" | "en",
  now = Date.now(),
): string {
  const labels: Record<StudyRating, string> =
    language === "pl"
      ? { 1: "Jeszcze raz", 2: "Trudne", 3: "Dobrze", 4: "Łatwe" }
      : { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };
  return ratingPreviews(card, now)
    .map(
      ({ rating, due }) =>
        `<button type="button" data-review-rating="${rating}" class="rating-button"><strong>${rating} · ${labels[rating]}</strong><small>${intervalLabel(due, now, language)}</small></button>`,
    )
    .join("");
}

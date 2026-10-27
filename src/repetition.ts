import { createEmptyCard, fsrs } from "ts-fsrs";
import type { Card } from "ts-fsrs";
import { z } from "zod";

export const ratingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
export type StudyRating = z.infer<typeof ratingSchema>;
export const scheduledCardSchema = z.object({
  due: z.number().int().nonnegative(),
  stability: z.number().nonnegative(),
  difficulty: z.number().min(0).max(10),
  elapsed_days: z.number().nonnegative(),
  scheduled_days: z.number().nonnegative(),
  learning_steps: z.number().int().nonnegative(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  state: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  last_review: z.number().int().nonnegative().optional(),
});
export type ScheduledCard = z.infer<typeof scheduledCardSchema>;
const scheduler = fsrs({
  enable_fuzz: false,
  learning_steps: ["10m", "1h"],
  relearning_steps: ["10m"],
});
function restore(card: ScheduledCard | undefined, now: number): Card {
  if (!card) return createEmptyCard(new Date(now));
  const { last_review, ...values } = card;
  return {
    ...values,
    due: new Date(card.due),
    ...(last_review === undefined
      ? {}
      : { last_review: new Date(last_review) }),
  };
}
export function scheduleReview(
  card: ScheduledCard | undefined,
  rating: StudyRating,
  now: number,
): ScheduledCard {
  const next = scheduler.next(restore(card, now), new Date(now), rating).card;
  return scheduledCardSchema.parse({
    ...next,
    due: next.due.getTime(),
    ...(next.last_review ? { last_review: next.last_review.getTime() } : {}),
  });
}
export function ratingPreviews(
  card: ScheduledCard | undefined,
  now: number,
): { rating: StudyRating; due: number }[] {
  return ([1, 2, 3, 4] satisfies StudyRating[]).map((rating) => ({
    rating,
    due: scheduleReview(card, rating, now).due,
  }));
}
export function intervalLabel(
  due: number,
  now: number,
  language: "pl" | "en",
): string {
  const minutes = Math.max(1, Math.round((due - now) / 60000));
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440)
    return `${Math.round((minutes / 60) * 10) / 10} ${language === "pl" ? "godz." : "h"}`;
  return `${Math.round((minutes / 1440) * 10) / 10} ${language === "pl" ? "dni" : "d"}`;
}
export function reviewQueue<T extends { id: string }>(
  pool: readonly T[],
  schedules: Readonly<Record<string, ScheduledCard>>,
  now: number,
  early = false,
): { items: T[]; due: number; fresh: number; nextDue: number | null } {
  const due = pool.filter((item) => {
    const c = schedules[item.id];
    return c !== undefined && c.due <= now;
  });
  const fresh = pool.filter((item) => schedules[item.id] === undefined);
  const upcoming = pool.flatMap((item) => {
    const c = schedules[item.id];
    return c && c.due > now ? [c.due] : [];
  });
  return {
    items: early ? [...pool] : due.length ? due : fresh,
    due: due.length,
    fresh: fresh.length,
    nextDue: upcoming.length ? Math.min(...upcoming) : null,
  };
}

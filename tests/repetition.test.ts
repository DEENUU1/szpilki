import { describe, expect, it, vi } from "vitest";
import { reviewQueue, scheduleReview } from "../src/repetition";
import {
  emptyStudy,
  recordRatedReview,
  readStudy,
  mergeStudy,
  parseStudy,
} from "../src/storage";
import { saveQuestionDraft } from "../src/question-draft";

describe("question draft ownership", () => {
  it("does not overwrite a new card's blank draft with the previous input", () => {
    const session = { questionId: "next", draft: "", reasoning: "" };
    expect(
      saveQuestionDraft(
        session,
        "previous",
        "nerw pośrodkowy",
        "old explanation",
      ),
    ).toBe(false);
    expect(session.draft).toBe("");
    expect(
      saveQuestionDraft(session, "next", "new answer", "new reasoning"),
    ).toBe(true);
    expect(session.reasoning).toBe("new reasoning");
  });
});
describe("FSRS review scheduling", () => {
  const now = 1700000000000;
  it("makes a failed new card due in ten minutes and holds it back until then", () => {
    const card = scheduleReview(undefined, 1, now);
    expect(card.due).toBe(now + 600000);
    expect(reviewQueue([{ id: "a" }], { a: card }, now).items).toEqual([]);
    expect(reviewQueue([{ id: "a" }], { a: card }, card.due).items).toEqual([
      { id: "a" },
    ]);
  });
  it("prioritises due cards over new ones and never changes a schedule merely by selecting", () => {
    const card = scheduleReview(undefined, 3, now);
    const schedules = { a: card };
    const pool = [{ id: "new" }, { id: "a" }];
    expect(reviewQueue(pool, schedules, now).items).toEqual([{ id: "new" }]);
    expect(reviewQueue(pool, schedules, card.due).items).toEqual([{ id: "a" }]);
    expect(reviewQueue(pool, schedules, now, true).items).toEqual(pool);
    expect(card.reps).toBe(1);
  });
  it("updates memory state across ratings rather than using fixed repeating intervals", () => {
    const first = scheduleReview(undefined, 3, now);
    const next = scheduleReview(first, 3, first.due);
    expect(next.reps).toBe(2);
    expect(next.last_review).toBe(first.due);
    expect(next.stability).toBeGreaterThan(0);
  });
});

it("persists numeric due dates, ratings and reasoning through save and import", () => {
  const study = emptyStudy();
  recordRatedReview(
    study,
    "photo:book:nerve",
    3,
    "session",
    "It follows the artery",
    1700000000000,
  );
  const reloaded = readStudy();
  expect(reloaded.schedules["photo:book:nerve"]?.due).toBeGreaterThan(
    1700000000000,
  );
  expect(reloaded.reviews[0]).toMatchObject({
    rating: 3,
    correct: true,
    reasoning: "It follows the artery",
  });
  const incoming = parseStudy(JSON.parse(JSON.stringify(reloaded)));
  recordRatedReview(
    incoming,
    "photo:book:nerve",
    1,
    "session",
    "",
    1700003600000,
  );
  const merged = mergeStudy(reloaded, incoming);
  expect(merged.schedules["photo:book:nerve"]?.reps).toBe(2);
  expect(merged.reviews).toHaveLength(2);
  expect(() =>
    parseStudy({ ...study, schedules: { wrong: { due: "tomorrow" } } }),
  ).toThrow();
  expect(parseStudy({ ...study, version: 2 }).version).toBe(3);
});

it("does not leave a half-saved rating or schedule when localStorage refuses a write", () => {
  const study = emptyStudy();
  const setter = vi
    .spyOn(localStorage, "setItem")
    .mockImplementationOnce(() => {
      throw new Error("quota");
    });
  expect(() =>
    recordRatedReview(study, "a", 3, "session", "", 1700000000000),
  ).toThrow("quota");
  expect(study.reviews).toEqual([]);
  expect(study.schedules).toEqual({});
  setter.mockRestore();
});

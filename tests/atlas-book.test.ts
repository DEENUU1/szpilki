import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bookPool,
  bookQuestions,
  bookReviewName,
  bookSchema,
  loadBook,
} from "../src/atlas-book";
import {
  emptyStudy,
  mergeStudy,
  parseStudy,
  startSession,
} from "../src/storage";

import { readFileSync } from "node:fs";
const mcminnBook = bookSchema.parse(
  JSON.parse(
    readFileSync(
      new URL("../src/data/mcminn-book.json", import.meta.url),
      "utf8",
    ),
  ),
);
const questions = bookQuestions(mcminnBook);
describe("whole-book source questions", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("reports a missing or malformed metadata asset instead of using an empty successful deck", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );
    await expect(loadBook()).rejects.toThrow("503");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ pages: [] })),
    );
    await expect(loadBook()).rejects.toThrow();
  });
  it("keeps excluded source questions through export and merge without duplicating them", () => {
    const local = emptyStudy();
    local.excludedBookQuestions.push("mcminn-book-200-0-13");
    const imported = parseStudy(JSON.parse(JSON.stringify(local)));
    imported.excludedBookQuestions.push("mcminn-book-150-0-2");
    expect(mergeStudy(local, imported).excludedBookQuestions).toEqual([
      "mcminn-book-200-0-13",
      "mcminn-book-150-0-2",
    ]);
    const question = questions[0];
    if (!question) throw new Error("Missing source question");
    expect(
      bookReviewName(`photo:${question.atlasId}:${question.id}`, "en"),
    ).toContain(`page ${question.page}`);
    expect(bookReviewName("another-atlas", "pl")).toBeNull();
  });
  it("indexes every PDF page without publishing the scan or OCR transcription", () => {
    expect(mcminnBook.pages.map((p) => p.page)).toEqual(
      Array.from({ length: 362 }, (_, i) => i + 1),
    );
    expect(questions.length).toBeGreaterThan(6000);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const page of mcminnBook.pages) {
      expect(Object.keys(page).sort()).toEqual(["labels", "masks", "page"]);
      for (const label of page.labels) {
        expect(Object.keys(label).sort()).toEqual([
          "answer",
          "category",
          "id",
          "legend",
          "number",
        ]);
        expect(label.answer.x).toBeGreaterThanOrEqual(label.legend.x - 0.0001);
        expect(label.answer.y).toBeGreaterThanOrEqual(label.legend.y - 0.0001);
        expect(label.answer.x + label.answer.w).toBeLessThanOrEqual(
          label.legend.x + label.legend.w + 0.0001,
        );
        expect(label.answer.y + label.answer.h).toBeLessThanOrEqual(
          label.legend.y + label.legend.h + 0.0001,
        );
      }
    }
  });
  it("selects only the requested PDF range, including material beyond the starter deck", () => {
    for (const [first, last] of [
      [16, 95],
      [120, 173],
      [180, 285],
      [290, 355],
    ]) {
      if (first === undefined || last === undefined)
        throw new Error("Invalid fixture");
      const pool = bookPool(mcminnBook, first, last);
      expect(pool.length).toBeGreaterThan(500);
      expect(pool.every((q) => q.page >= first && q.page <= last)).toBe(true);
    }
    expect(bookPool(mcminnBook, 1, 4)).toEqual([]);
    expect(bookPool(mcminnBook, 121, 121).every((q) => q.page === 121)).toBe(
      true,
    );
  });
  it("rejects source boxes outside the page and the wrong scan identity", () => {
    const invalid: unknown = { ...mcminnBook, atlasId: "another-edition" };
    expect(() => bookSchema.parse(invalid)).toThrow();
    const page = mcminnBook.pages[0];
    expect(() =>
      bookSchema.parse({
        ...mcminnBook,
        pages: [
          { ...page, masks: [{ x: 0.9, y: 0, w: 0.2, h: 0.1 }] },
          ...mcminnBook.pages.slice(1),
        ],
      }),
    ).toThrow();
  });
  it("restores the exact book question, typed answer, range and manual grade state", () => {
    const study = emptyStudy();
    const session = startSession(study, study.preferences, 1, "book-session");
    const question = bookPool(mcminnBook, 200, 200)[0];
    if (!question) throw new Error("Missing mediastinum question");
    Object.assign(session, {
      source: "photo",
      atlasId: mcminnBook.atlasId,
      questionId: question.id,
      draft: "nervus phrenicus",
      revealed: true,
      graded: false,
      photoFilters: {
        mode: "book",
        earlyReview: false,
        bookCategory: "all",
        firstPage: 180,
        lastPage: 220,
        region: "all",
        system: "all",
        exercise: 0,
        onlyMistakes: true,
      },
    });
    const restored = parseStudy(JSON.parse(JSON.stringify(study)));
    expect(restored.sessions[0]).toEqual(session);
    expect(restored.reviews).toEqual([]);
  });
  it("migrates previously saved photo filters to prepared-pin mode", () => {
    const study = emptyStudy();
    const session = startSession(
      study,
      study.preferences,
      1,
      "old-photo-session",
    );
    const old: unknown = {
      ...study,
      sessions: [
        {
          ...session,
          source: "photo",
          photoFilters: {
            region: "upper",
            system: "nervous",
            exercise: 7,
            onlyMistakes: false,
          },
        },
      ],
    };
    expect(parseStudy(old).sessions[0]?.photoFilters).toMatchObject({
      mode: "pins",
      firstPage: 1,
      lastPage: 362,
    });
  });
});

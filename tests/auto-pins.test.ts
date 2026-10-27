import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  autoIndexSchema,
  autoNotes,
  autoPool,
  autoPracticeCrop,
  autoQuestions,
  autoReviewName,
  loadAutoPins,
} from "../src/auto-pins";
import { mcminnId } from "../src/photo-data";
import {
  emptyStudy,
  parseStudy,
  startSession,
  recordRatedReview,
  mergeStudy,
} from "../src/storage";
const raw: unknown = JSON.parse(
  readFileSync(
    new URL("../src/data/mcminn-auto.json", import.meta.url),
    "utf8",
  ),
);
const index = autoIndexSchema.parse(raw);
const questions = autoQuestions(index);
const one = questions.find(
  (q) => q.captions.length === 1 && !q.conflictNumbers.length,
);
if (!one) throw new Error("Missing automatic question fixture");
describe("automatic photo proposals in the public app", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("publishes all 9928 candidates as geometry and references, without pixels, OCR text or fabricated anatomy", () => {
    expect(questions).toHaveLength(9928);
    expect(new Set(questions.map((q) => q.id)).size).toBe(9928);
    expect(questions.filter((q) => q.captions.length === 1)).toHaveLength(6045);
    expect(questions.filter((q) => q.captions.length > 1)).toHaveLength(2051);
    expect(questions.filter((q) => !q.captions.length)).toHaveLength(1832);
    expect(() =>
      autoIndexSchema.parse({
        ...index,
        candidates: [{ ...index.candidates[0], raw: "source prose" }],
      }),
    ).toThrow();
    expect(
      questions.every((q) => q.kind === "auto" && q.atlasId === mcminnId),
    ).toBe(true);
  });
  it("keeps ambiguous, missing, grayscale and conflicting detections accessible instead of silently choosing a caption", () => {
    const all = autoPool(questions, 1, 362, "all", "all", []);
    expect(all).toHaveLength(9928);
    expect(autoPool(all, 1, 362, "all", "ambiguous-caption", [])).toHaveLength(
      2051,
    );
    expect(autoPool(all, 1, 362, "all", "missing-caption", [])).toHaveLength(
      1832,
    );
    expect(autoPool(all, 1, 362, "all", "conflicting-number", [])).toHaveLength(
      441,
    );
    expect(all.filter((q) => q.imageHint === "unresolved-image")).toHaveLength(
      2587,
    );
  });
  it("combines page, category, quality and local exclusion filters", () => {
    const pool = autoPool(questions, 142, 159, "nervous", "one-caption", []);
    expect(pool.length).toBeGreaterThan(20);
    expect(
      pool.every(
        (q) =>
          q.page >= 142 &&
          q.page <= 159 &&
          q.captions.length === 1 &&
          q.captions[0]?.category === "nervous",
      ),
    ).toBe(true);
    const excluded = pool[0];
    if (!excluded) throw new Error("Missing filtered fixture");
    expect(
      autoPool(questions, 142, 159, "nervous", "one-caption", [excluded.id]),
    ).toHaveLength(pool.length - 1);
  });
  it("keeps every numeric anchor inside its context crop, including page-edge detections", () => {
    for (const q of questions) {
      const crop = autoPracticeCrop(q);
      expect(crop.x).toBeLessThanOrEqual(q.anchor.x);
      expect(crop.y).toBeLessThanOrEqual(q.anchor.y);
      expect(crop.x + crop.w + 1e-9).toBeGreaterThanOrEqual(
        q.anchor.x + q.anchor.w,
      );
      expect(crop.y + crop.h + 1e-9).toBeGreaterThanOrEqual(
        q.anchor.y + q.anchor.h,
      );
      expect(crop.x + crop.w).toBeLessThanOrEqual(1);
      expect(crop.y + crop.h).toBeLessThanOrEqual(1);
    }
  });
  it("offers authored notes only for one caption without conflicting number readings", () => {
    expect(
      questions.filter((q) => autoNotes(q).length > 0).length,
    ).toBeGreaterThan(300);
    expect(
      questions
        .filter((q) => q.captions.length !== 1 || q.conflictNumbers.length)
        .every((q) => autoNotes(q).length === 0),
    ).toBe(true);
  });
  it("restores the exact automatic session, answer, filters, rating and exclusion through export/import", () => {
    const study = emptyStudy();
    const session = startSession(study, study.preferences, 1, "auto-session");
    Object.assign(session, {
      source: "photo",
      atlasId: mcminnId,
      questionId: one.id,
      draft: "nervus medianus",
      reasoning: "course beside the artery",
      revealed: true,
      graded: true,
      photoFilters: {
        mode: "auto",
        autoQuality: "one-caption",
        firstPage: 142,
        lastPage: 159,
        bookCategory: "nervous",
        region: "all",
        system: "all",
        exercise: 0,
        earlyReview: false,
        onlyMistakes: false,
      },
    });
    const id = `photo:${mcminnId}:${one.id}`;
    vi.stubGlobal("localStorage", { setItem: vi.fn() });
    recordRatedReview(study, id, 3, session.id, session.reasoning);
    study.excludedBookQuestions.push(questions[0]?.id ?? "missing");
    const restored = parseStudy(JSON.parse(JSON.stringify(study)));
    expect(restored.sessions[0]).toEqual(session);
    expect(restored.schedules[id]).toBeDefined();
    expect(mergeStudy(restored, study).excludedBookQuestions).toEqual(
      study.excludedBookQuestions,
    );
    expect(autoReviewName(id, "pl")).toContain(`strona ${one.page}`);
    expect(autoReviewName(id, "en")).toContain(`number ${one.number}`);
    expect(
      autoReviewName(`photo:${mcminnId}:mcminn-book-149-1-21`, "pl"),
    ).toBeNull();
  });
  it("rejects duplicate identities, wrong scan/page and non-public fields", () => {
    const item = index.candidates[0];
    if (!item) throw new Error("Missing candidate");
    expect(() =>
      autoIndexSchema.parse({ ...index, atlasId: "other" }),
    ).toThrow();
    expect(() =>
      autoIndexSchema.parse({ ...index, candidates: [item, item] }),
    ).toThrow();
    expect(() =>
      autoIndexSchema.parse({ ...index, candidates: [{ ...item, page: 362 }] }),
    ).toThrow();
    expect(() =>
      autoIndexSchema.parse({
        ...index,
        candidates: [
          {
            ...item,
            captions: [
              {
                id: "x",
                answer: item.anchor,
                legend: item.anchor,
                category: "other",
                noteIds: ["unknown"],
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });
  it("reports failed/malformed metadata and loads a validated corpus", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("missing", { status: 404 })),
    );
    await expect(loadAutoPins()).rejects.toThrow("404");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ version: 1 })),
    );
    await expect(loadAutoPins()).rejects.toThrow();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(index)));
    await expect(loadAutoPins()).resolves.toHaveLength(9928);
  });
});

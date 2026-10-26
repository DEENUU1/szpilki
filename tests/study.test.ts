import { describe, it, expect } from "vitest";
import {
  activeSession,
  emptyStudy,
  endSession,
  mergeStudy,
  parseStudy,
  readStudy,
  recordReview,
  saveStudy,
  startSession,
} from "../src/storage";
import { answerMatches, latestMistakes, nextQuestion } from "../src/domain";
import { getLanguage, setLanguage, translate } from "../src/i18n";

describe("practice and resume", () => {
  it("restores a session, unfinished typed answer and absolute deadline after a reload", () => {
    const study = emptyStudy();
    const session = startSession(study, study.preferences, 1000, "session-a");
    Object.assign(session, {
      questionId: "median_nerve_r",
      questionCount: 3,
      draft: "nervus medi",
      deadline: 31000,
    });
    saveStudy(study);
    const reloaded = readStudy();
    expect(activeSession(reloaded)).toMatchObject({
      id: "session-a",
      questionId: "median_nerve_r",
      draft: "nervus medi",
      deadline: 31000,
      questionCount: 3,
    });
    expect(
      startSession(reloaded, reloaded.preferences, 2000, "session-b").id,
    ).toBe("session-a");
    expect(reloaded.sessions).toHaveLength(1);
  });
  it("keeps completed sessions and associates each answer with its actual session", () => {
    const study = emptyStudy();
    const first = startSession(study, study.preferences, 1000, "first");
    recordReview(study, "male:femur_l", false, first.id);
    endSession(study, 2000);
    const second = startSession(study, study.preferences, 3000, "second");
    recordReview(study, "male:femur_l", true, second.id);
    expect(study.sessions[0]?.endedAt).toBe(2000);
    expect(study.reviews.map((r) => r.sessionId)).toEqual(["first", "second"]);
    expect(latestMistakes(study.reviews)).toEqual([]);
  });
  it("preserves photo sessions and their atlas identity in the same local export", () => {
    const study = emptyStudy();
    const session = startSession(study, study.preferences, 1, "photo-session");
    session.source = "photo";
    session.atlasId = "book-hash";
    session.questionId = "plate-121-7";
    session.revealed = true;
    saveStudy(study);
    expect(activeSession(readStudy())).toMatchObject({
      source: "photo",
      atlasId: "book-hash",
      questionId: "plate-121-7",
      revealed: true,
    });
  });
  it("merges imports without duplicating attempts or replacing the active local session", () => {
    const local = emptyStudy();
    startSession(local, local.preferences, 1, "local");
    recordReview(local, "male:ulna_l", true, "local");
    const imported = parseStudy(JSON.parse(JSON.stringify(local)));
    endSession(imported, 2);
    imported.sessions[0] && (imported.sessions[0].updatedAt = 3);
    const merged = mergeStudy(local, imported);
    expect(merged.reviews).toHaveLength(1);
    expect(merged.activeSessionId).toBe("local");
    expect(activeSession(merged)?.id).toBe("local");
    expect(merged.sessions).toHaveLength(1);
  });
  it("rejects malformed external state instead of treating it as successful progress", () => {
    expect(() =>
      parseStudy({ version: 2, reviews: [{ id: "bad", correct: "yes" }] }),
    ).toThrow();
  });
  it("migrates the earlier local history without discarding attempts", () => {
    const migrated = parseStudy({
      version: 1,
      reviews: [{ id: "femur_l", at: 1, correct: false }],
    });
    expect(migrated.version).toBe(2);
    expect(migrated.reviews).toHaveLength(1);
  });
});
describe("question selection and answers", () => {
  it("does not repeat the previous structure when another eligible one exists", () => {
    expect(
      nextQuestion([{ id: "a" }, { id: "b" }], "a", [], false, () => 0)?.id,
    ).toBe("b");
  });
  it("uses the latest result for mistakes and distinguishes male, female and photo identities", () => {
    const reviews = [
      { id: "male:a", correct: false, at: 1 },
      { id: "male:a", correct: true, at: 2 },
      { id: "female:a", correct: false, at: 3 },
    ];
    expect(
      nextQuestion(
        [{ id: "male:a" }, { id: "female:a" }],
        null,
        reviews,
        true,
        () => 0,
      )?.id,
    ).toBe("female:a");
    expect(
      nextQuestion([{ id: "photo:a" }], null, reviews, true),
    ).toBeUndefined();
  });
  it("accepts accents and standard Latin prefixes without accepting an unrelated structure", () => {
    expect(answerMatches("m. dwugłowy", ["Dwugłowy"])).toBe(true);
    expect(answerMatches("nervus medianus", ["medianus"])).toBe(true);
    expect(answerMatches("ulnaris", ["Nervus medianus"])).toBe(false);
    expect(answerMatches("", [""])).toBe(false);
    expect(answerMatches("Łopatka", ["łopatka"])).toBe(true);
  });
});
describe("language preferences", () => {
  it("defaults to English and stores an explicit Polish selection", () => {
    setLanguage("en");
    expect(getLanguage()).toBe("en");
    expect(translate("Moja nauka")).toBe("My learning");
    setLanguage("pl");
    expect(localStorage.getItem("szpilki-language")).toBe("pl");
    expect(translate("Moja nauka")).toBe("Moja nauka");
    setLanguage("en");
  });
});

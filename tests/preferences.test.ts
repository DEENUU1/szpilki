import { describe, expect, it } from "vitest";
import { languageFromPreference } from "../src/i18n";
import {
  emptyStudy,
  prepareSupportedModel,
  startSession,
} from "../src/storage";
import { atlasLibrary, atlasPreviewUrl } from "../src/atlas-library";

describe("supported atlas and language preferences", () => {
  it("uses Polish on a first visit and preserves an explicit English choice", () => {
    expect(languageFromPreference(null)).toBe("pl");
    expect(languageFromPreference("unknown")).toBe("pl");
    expect(languageFromPreference("pl")).toBe("pl");
    expect(languageFromPreference("en")).toBe("en");
  });
  it("replaces the withdrawn female viewer without relabelling an unfinished female question", () => {
    const data = emptyStudy();
    data.preferences.sex = "female";
    data.preferences.layers = [
      { system: "renal", visible: true, opacity: 0.5 },
    ];
    const session = startSession(
      data,
      { ...data.preferences },
      1,
      "female-session",
    );
    session.questionId = "kidney_l";
    data.reviews.push({
      id: "female:kidney_l",
      at: 2,
      correct: true,
      sessionId: session.id,
    });
    prepareSupportedModel(data, 100);
    expect(data.preferences.sex).toBe("male");
    expect(data.preferences.layers).toEqual([]);
    expect(data.activeSessionId).toBeNull();
    expect(session).toMatchObject({
      endedAt: 100,
      settings: { sex: "female" },
      questionId: "kidney_l",
    });
    expect(data.reviews[0]?.id).toBe("female:kidney_l");
  });
  it("preserves active photo practice and existing male settings", () => {
    const data = emptyStudy();
    data.preferences.sex = "female";
    const session = startSession(
      data,
      { ...data.preferences },
      1,
      "photo-session",
    );
    session.source = "photo";
    session.questionId = "mcminn-book-200-0-13";
    prepareSupportedModel(data, 100);
    expect(data.activeSessionId).toBe(session.id);
    expect(session.endedAt).toBeNull();
    const male = emptyStudy();
    male.preferences.layers = [
      { system: "nervous", visible: true, opacity: 0.4 },
    ];
    const before: unknown = JSON.parse(JSON.stringify(male));
    expect(prepareSupportedModel(male)).toEqual(before);
  });
  it("links to the exact supplied files with distinct reading previews", () => {
    expect(atlasLibrary.map((a) => a.fileId)).toEqual([
      "1qlynRQ3MWNWhG8SLEKONpfC_oQAROAem",
      "1cI1SWzqukhvGBrA4fJk16m2uomeuQvy3",
    ]);
    expect(atlasLibrary[0].preview).toBe(false);
    expect(atlasLibrary[1].preview).toBe(true);
    for (const atlas of atlasLibrary) {
      expect(new URL(atlas.url).hostname).toBe("drive.google.com");
      if (atlas.preview)
        expect(atlasPreviewUrl(atlas)).toBe(
          `https://drive.google.com/file/d/${atlas.fileId}/preview`,
        );
    }
  });
});

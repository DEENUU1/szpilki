import { describe, it, expect } from "vitest";
import {
  atlasId,
  ocrSchema,
  evidenceSchema,
  propose,
  latinKey,
  captionLatin,
  tissueComponents,
  makeReviewedPin,
  restoreReviews,
  benchmark,
  provisionalGlossary,
  modelCatalog,
} from "../scripts/pin-pipeline";
import type { Ocr, Evidence, Candidate, Report } from "../scripts/pin-pipeline";
import type { BookIndex } from "../src/atlas-book";
import type { PhotoPin } from "../src/photo-data";
const entry: PhotoPin = {
  id: "catalog-median",
  atlasId,
  page: 150,
  x: 0.5,
  y: 0.5,
  crop: { x: 0, y: 0, w: 1, h: 1 },
  pl: "Nerw pośrodkowy",
  en: "Median nerve",
  latin: "Nervus medianus",
  system: "nervous",
  region: "upper",
  exercise: 7,
  recognize: {
    en: "Original view-specific recognition only.",
    pl: "Wskazówka tylko dla oryginalnego widoku.",
  },
  theory: {
    en: "Existing teaching note requires review for a new specimen.",
    pl: "Istniejąca notatka wymaga sprawdzenia dla nowego preparatu.",
  },
  modelId: "median_nerve_r",
  source: "McMinn, source teaching plate",
};
function inputs(): { ocr: Ocr; book: BookIndex; evidence: Evidence } {
  const ocr: Ocr = {
    sourceSha256: atlasId,
    pages: Array.from({ length: 362 }, (_, i) => ({
      page: i + 1,
      width: 100,
      height: 100,
      text_items: [],
    })),
  };
  const book: BookIndex = {
    atlasId,
    pageCount: 362,
    pages: Array.from({ length: 362 }, (_, i) => ({
      page: i + 1,
      masks: [],
      labels: [],
    })),
  };
  const evidence: Evidence = {
    atlasId,
    pages: Array.from({ length: 362 }, (_, i) => ({
      page: i + 1,
      image: `pages/${i + 1}.jpg`,
      columns: 4,
      rows: 4,
      tissue: Array<boolean>(16).fill(true),
      anchors: [],
    })),
  };
  const o = ocr.pages[148],
    b = book.pages[148],
    e = evidence.pages[148];
  if (!o || !b || !e) throw new Error("Missing fixture");
  o.text_items = [
    { text: "21", x: 50, y: 40, width: 4, height: 4 },
    {
      text: "21 N. pośrodkowy (n. medianus)",
      x: 60,
      y: 80,
      width: 38,
      height: 4,
    },
  ];
  b.labels = [
    {
      id: "legend-21",
      number: 21,
      category: "nervous",
      answer: { x: 0.59, y: 0.79, w: 0.4, h: 0.06 },
      legend: { x: 0.58, y: 0.77, w: 0.41, h: 0.15 },
    },
  ];
  e.anchors = [{ item: 0, patch: { white: 0, warm: 0.8, dark: 0.1 } }];
  return { ocr, book, evidence };
}
function report(): Report {
  const i = inputs();
  return propose(i.ocr, i.book, i.evidence, [entry], "2026-10-27T00:00:00Z");
}
function candidate(): Candidate {
  const c = report().candidates[0];
  if (!c) throw new Error("Missing fixture candidate");
  return c;
}
function values(): Record<string, unknown> {
  return {
    tip: { x: 0.48, y: 0.45 },
    crop: { x: 0.2, y: 0.2, w: 0.6, h: 0.5 },
    pl: entry.pl,
    en: entry.en,
    latin: entry.latin,
    recognize: {
      en: "Follow the nerve in this reviewed specimen.",
      pl: "Prześledź nerw na tym sprawdzonym preparacie.",
    },
    theory: entry.theory,
    system: "nervous",
    region: "upper",
    exercise: 7,
    side: "r",
    catalogId: entry.id,
    useModel: true,
    geometryChecked: true,
    captionChecked: true,
    contentChecked: true,
  };
}
describe("offline atlas proposals", () => {
  it("uses exact terminology normalisation and declines multi-structure captions", () => {
    expect(latinKey("n. medianus")).toBe(latinKey("Nervus medianus"));
    expect(latinKey("tendo m. teres major")).toBe(
      latinKey("tendo musculi teres major"),
    );
    expect(latinKey("Vertebra cervicalis C1")).not.toBe(
      latinKey("Vertebra cervicalis C2"),
    );
    expect(latinKey("Nervus radialis")).not.toBe(latinKey("Nervus medianus"));
    expect(captionLatin("21 N. pośrodkowy (n. medianus)")).toBe("n. medianus");
    expect(
      captionLatin("Nerve (n. medianus) and vessel (a. brachialis)"),
    ).toBeNull();
  });
  it("joins a number to its source caption while leaving its anchor unapproved", () => {
    const r = report(),
      c = candidate();
    expect(r.candidates).toHaveLength(1);
    expect(c.captionState).toBe("one-caption");
    expect(c.captions[0]?.catalogIds).toEqual([entry.id]);
    expect(c.imageHint).toBe("colour-photo-support");
    expect(c.anchor).toEqual({ x: 0.5, y: 0.4, w: 0.04, h: 0.04 });
    expect("x" in c).toBe(false);
    expect("recognize" in c).toBe(false);
  });
  it("retains grayscale/diagram uncertainty without claiming a photographic match", () => {
    const i = inputs(),
      e = i.evidence.pages[148];
    if (!e) throw new Error("Missing fixture");
    e.anchors = [{ item: 0, patch: { white: 0.9, warm: 0.02, dark: 0 } }];
    const r = propose(i.ocr, i.book, i.evidence, [entry], "now");
    expect(r.candidates[0]?.imageHint).toBe("unresolved-image");
    expect(r.statistics.weakImageSupport).toBe(1);
  });
  it("does not pick one of repeated legends and reports overlapping OCR conflicts", () => {
    const i = inputs(),
      b = i.book.pages[148],
      p = i.ocr.pages[148],
      e = i.evidence.pages[148];
    if (!b || !p || !e || !b.labels[0]) throw new Error("Missing fixture");
    b.labels.push({
      ...b.labels[0],
      id: "second-legend",
      answer: { x: 0.05, y: 0.8, w: 0.4, h: 0.05 },
      legend: { x: 0.04, y: 0.77, w: 0.42, h: 0.15 },
    });
    p.text_items.push({ text: "27", x: 50, y: 40, width: 4, height: 4 });
    e.anchors.push({ item: 2, patch: { white: 0, warm: 0.8, dark: 0 } });
    const r = propose(i.ocr, i.book, i.evidence, [entry], "now");
    expect(r.candidates[0]?.captionState).toBe("ambiguous-caption");
    expect(r.candidates[0]?.conflictNumbers).toEqual([27]);
    expect(r.candidates[1]?.captionState).toBe("missing-caption");
  });
  it("excludes text/legend anchors and rejects missing pixel evidence", () => {
    const i = inputs(),
      b = i.book.pages[148],
      e = i.evidence.pages[148];
    if (!b || !e) throw new Error("Missing fixture");
    b.masks = [{ x: 0.49, y: 0.39, w: 0.08, h: 0.08 }];
    expect(
      propose(i.ocr, i.book, i.evidence, [], "now").candidates,
    ).toHaveLength(0);
    e.anchors = [];
    expect(() => propose(i.ocr, i.book, i.evidence, [], "now")).toThrow(
      "evidence missing",
    );
  });
  it("uses model metadata as a draft without manufacturing teaching notes", () => {
    const entries = modelCatalog(
      [],
      [
        {
          organ_id: "median_nerve_l",
          ta2_latin: "Nervus medianus",
          name_en: "Median nerve (left)",
          system: "nervous",
          mesh_file: "nervous_male.glb",
          node: "nerve",
          path: [],
        },
      ],
    );
    expect(entries[0]).toMatchObject({
      id: "model:median_nerve_l",
      en: "Median nerve",
      pl: "",
      theory: { en: "", pl: "" },
    });
    const i = inputs(),
      r = propose(i.ocr, i.book, i.evidence, entries, "now");
    expect(r.statistics.catalogMatched).toBe(1);
    expect(r.statistics.authoredNotesMatched).toBe(0);
  });
  it("groups repeated source terms without claiming unique verified structures", () => {
    const i = inputs(),
      p = i.ocr.pages[149],
      b = i.book.pages[149],
      source = i.book.pages[148]?.labels[0];
    if (!p || !b || !source) throw new Error("Missing fixture");
    p.text_items = [
      {
        text: "21 Nerve (Nervus medianus)",
        x: 60,
        y: 80,
        width: 38,
        height: 4,
      },
    ];
    b.labels = [{ ...source, id: "second-source" }];
    const glossary = provisionalGlossary(i.ocr, i.book, [entry]);
    expect(glossary).toHaveLength(1);
    expect(glossary[0]?.status).toBe("unreviewed-ocr");
    expect(glossary[0]?.occurrences).toHaveLength(2);
  });
  it("deduplicates overlapping same-number detections without merging separate views", () => {
    const i = inputs(),
      p = i.ocr.pages[148],
      e = i.evidence.pages[148];
    if (!p || !e) throw new Error("Missing fixture");
    p.text_items.push(
      { text: "21", x: 50.1, y: 40.1, width: 4, height: 4 },
      { text: "21", x: 20, y: 30, width: 4, height: 4 },
    );
    e.anchors.push(
      { item: 2, patch: { white: 0, warm: 0.8, dark: 0 } },
      { item: 3, patch: { white: 0, warm: 0.8, dark: 0 } },
    );
    const r = propose(i.ocr, i.book, i.evidence, [entry], "now");
    expect(r.candidates).toHaveLength(2);
    expect(r.statistics.duplicateAnchors).toBe(1);
    expect(r.statistics.oneCaption).toBe(2);
  });
  it("validates source identity, page uniqueness and image references", () => {
    const i = inputs();
    expect(
      ocrSchema.safeParse({ ...i.ocr, sourceSha256: "wrong" }).success,
    ).toBe(false);
    const first = i.evidence.pages[0];
    if (!first) throw new Error("Missing fixture");
    first.image = "../private.jpg";
    expect(evidenceSchema.safeParse(i.evidence).success).toBe(false);
    first.image = "pages/1.jpg";
    first.tissue = [];
    expect(evidenceSchema.safeParse(i.evidence).success).toBe(false);
    const page = i.ocr.pages[0];
    if (!page) throw new Error("Missing fixture");
    page.page = 2;
    expect(ocrSchema.safeParse(i.ocr).success).toBe(false);
  });
  it("proposes bounded connected-component crops and measures marker neighbours, not tip accuracy", () => {
    expect(tissueComponents(Array<boolean>(16).fill(true), 4, 4)).toEqual([
      { x: 0, y: 0, w: 1, h: 1 },
    ]);
    expect(() => tissueComponents([], 4, 4)).toThrow();
    const p = { ...entry, id: "mcminn-149-A-21", page: 149, x: 0.52, y: 0.42 };
    expect(benchmark([candidate()], [entry, p]).development).toMatchObject({
      targets: 1,
      anchorWithin24px: 1,
      anchorWithin48px: 1,
      captionAndCatalog: 1,
    });
  });
});
describe("review boundary", () => {
  it("requires reviewed geometry/content, a tissue tip and correct model side", () => {
    const c = candidate();
    expect(() =>
      makeReviewedPin(c, { ...values(), contentChecked: false }, [entry]),
    ).toThrow();
    expect(() =>
      makeReviewedPin(c, { ...values(), tip: { x: 0.52, y: 0.42 } }, [entry]),
    ).toThrow("printed-number");
    expect(() =>
      makeReviewedPin(c, { ...values(), tip: { x: 0.99, y: 0.99 } }, [entry]),
    ).toThrow("outside");
    expect(() =>
      makeReviewedPin(c, { ...values(), side: "l" }, [entry]),
    ).toThrow("side");
    expect(() =>
      makeReviewedPin(c, { ...values(), crop: { x: 0, y: 0, w: 1, h: 1 } }, [
        entry,
      ]),
    ).toThrow("answer legend");
    const pin = makeReviewedPin(c, values(), [entry]);
    expect(pin.id).toBe("mcminn-reviewed-149-0-21");
    expect(pin.modelId).toBe("median_nerve_r");
    expect(pin.recognize.en).not.toBe(entry.recognize.en);
  });
  it("restores only decisions belonging to the same run/candidate and geometry", () => {
    const r = report(),
      c = candidate(),
      pin = makeReviewedPin(c, values(), [entry]);
    const saved = {
      version: 1,
      atlasId,
      reportId: `${atlasId}:${r.createdAt}`,
      reviews: [{ candidateId: c.id, decision: "approved", pin }],
    };
    expect(restoreReviews(r, saved).reviews).toHaveLength(1);
    expect(() =>
      restoreReviews(r, { ...saved, reportId: "another-run" }),
    ).toThrow("another OCR");
    expect(() =>
      restoreReviews(r, {
        ...saved,
        reviews: [...saved.reviews, ...saved.reviews],
      }),
    ).toThrow("Duplicate");
    expect(() =>
      restoreReviews(r, {
        ...saved,
        reviews: [{ candidateId: c.id, decision: "approved", pin: null }],
      }),
    ).toThrow();
    expect(() =>
      restoreReviews(r, {
        ...saved,
        reviews: [
          {
            candidateId: c.id,
            decision: "approved",
            pin: { ...pin, page: 150 },
          },
        ],
      }),
    ).toThrow("identity");
  });
});

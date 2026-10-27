import { z } from "zod";
import { bookSchema, boxSchema } from "../src/atlas-book";
import { photoPinSchema } from "../src/photo-data";
import type { PhotoPin } from "../src/photo-data";
import type { Organ } from "../src/domain";
export const atlasId =
  "a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451";
const ocrItemSchema = z.object({
  text: z.string(),
  x: z.number().min(-1),
  y: z.number().min(-1),
  width: z.number().positive(),
  height: z.number().positive(),
});
export const ocrSchema = z
  .object({
    sourceSha256: z.literal(atlasId),
    pages: z
      .array(
        z.object({
          page: z.number().int().min(1).max(362),
          width: z.number().positive(),
          height: z.number().positive(),
          text_items: z.array(ocrItemSchema),
        }),
      )
      .length(362),
  })
  .superRefine((d, ctx) => {
    if (new Set(d.pages.map((p) => p.page)).size !== 362)
      ctx.addIssue({ code: "custom", message: "Duplicate OCR pages" });
    for (const p of d.pages)
      for (const i of p.text_items)
        if (i.x + i.width > p.width + 1 || i.y + i.height > p.height + 1)
          ctx.addIssue({
            code: "custom",
            message: `OCR box outside page ${p.page}`,
          });
  });
const patchSchema = z.object({
  white: z.number().min(0).max(1),
  warm: z.number().min(0).max(1),
  dark: z.number().min(0).max(1),
});
export const evidenceSchema = z
  .object({
    atlasId: z.literal(atlasId),
    pages: z
      .array(
        z.object({
          page: z.number().int().min(1).max(362),
          image: z.string().regex(/^pages\/[1-9][0-9]{0,2}\.jpg$/),
          columns: z.number().int().min(2).max(100),
          rows: z.number().int().min(2).max(150),
          tissue: z.array(z.boolean()),
          anchors: z.array(
            z.object({
              item: z.number().int().nonnegative(),
              patch: patchSchema,
            }),
          ),
        }),
      )
      .length(362),
  })
  .superRefine((d, ctx) => {
    if (new Set(d.pages.map((p) => p.page)).size !== 362)
      ctx.addIssue({ code: "custom", message: "Duplicate image pages" });
    for (const p of d.pages) {
      if (p.tissue.length !== p.columns * p.rows)
        ctx.addIssue({ code: "custom", message: "Invalid image grid" });
      if (new Set(p.anchors.map((a) => a.item)).size !== p.anchors.length)
        ctx.addIssue({ code: "custom", message: "Duplicate anchor evidence" });
      if (p.image !== `pages/${p.page}.jpg`)
        ctx.addIssue({ code: "custom", message: "Image/page mismatch" });
    }
  });
export type Ocr = z.infer<typeof ocrSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
type Box = z.infer<typeof boxSchema>;
type Point = { x: number; y: number };
type CatalogItem = Pick<
  PhotoPin,
  "id" | "pl" | "en" | "latin" | "system" | "theory" | "modelId" | "source"
>;
export function modelCatalog(
  pins: readonly CatalogItem[],
  organs: readonly Organ[],
): CatalogItem[] {
  return [
    ...pins,
    ...organs
      .filter((o) => !/_(el|er|ol|or)$/.test(o.organ_id))
      .map((o) => ({
        id: `model:${o.organ_id}`,
        pl: "",
        en: o.name_en.replace(/ \((left|right)\)$/i, ""),
        latin: o.ta2_latin,
        system: o.system,
        theory: { en: "", pl: "" },
        modelId: o.organ_id,
        source:
          "Z-Anatomy / BodyParts3D model metadata only. No authored teaching note; verify the photograph, side and terminology.",
      })),
  ];
}
const captionSchema = z.object({
  id: z.string(),
  number: z.number().int().positive(),
  answer: boxSchema,
  legend: boxSchema,
  raw: z.string(),
  category: z.string(),
  latin: z.string().nullable(),
  catalogIds: z.array(z.string()),
});
export const candidateSchema = z.object({
  id: z.string(),
  page: z.number().int().positive(),
  number: z.number().int().positive(),
  anchor: boxSchema,
  crop: boxSchema,
  photoPatch: patchSchema,
  imageHint: z.enum(["colour-photo-support", "unresolved-image"]),
  conflictNumbers: z.array(z.number().int().positive()),
  captionState: z.enum(["one-caption", "ambiguous-caption", "missing-caption"]),
  captions: z.array(captionSchema),
});
export type Candidate = z.infer<typeof candidateSchema>;
const catalogSchema = photoPinSchema.pick({
  id: true,
  pl: true,
  en: true,
  latin: true,
  system: true,
  theory: true,
  modelId: true,
  source: true,
});
export const reportSchema = z.object({
  version: z.literal(1),
  atlasId: z.literal(atlasId),
  createdAt: z.string(),
  candidates: z.array(candidateSchema),
  catalog: z.array(catalogSchema),
  statistics: z.record(z.string(), z.number()),
});
export type Report = z.infer<typeof reportSchema>;
export const reviewSchema = z.object({
  version: z.literal(1),
  atlasId: z.literal(atlasId),
  reportId: z.string(),
  reviews: z.array(
    z.discriminatedUnion("decision", [
      z.object({
        candidateId: z.string(),
        decision: z.literal("approved"),
        pin: photoPinSchema,
      }),
      z.object({
        candidateId: z.string(),
        decision: z.literal("rejected"),
        pin: z.null(),
      }),
    ]),
  ),
});
export function contains(b: Box, p: Point): boolean {
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}
function overlaps(a: Box, b: Box): boolean {
  return (
    Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x) &&
    Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y)
  );
}
export function center(b: Box): Point {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}
export function latinKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/([a-z])-\s+([a-z])/g, "$1$2")
    .replace(/\btendo\s+m\./g, "tendo musculi ")
    .replace(/\bm\./g, "musculus ")
    .replace(/\bn\./g, "nervus ")
    .replace(/\blig\./g, "ligamentum ")
    .normalize("NFD")
    .replace(/[^a-z0-9]/g, "");
}
export function captionLatin(raw: string): string | null {
  const matches = [...raw.matchAll(/\(([^()]{3,180})\)/g)];
  // A caption with several parenthesised structures is not one unambiguous answer.
  if (matches.length !== 1) return null;
  const value = matches[0]?.[1];
  return value?.trim() ?? null;
}
export function patchLooksPhotographic(
  p: z.infer<typeof patchSchema>,
): boolean {
  // A colour/occupancy heuristic, NOT a probability or anatomical verification.
  // Grayscale radiographs/MR and most white-background diagrams are intentionally deferred.
  return p.warm >= 0.3 && p.white <= 0.6;
}
export function tissueComponents(
  tissue: readonly boolean[],
  columns: number,
  rows: number,
): Box[] {
  if (tissue.length !== columns * rows) throw new Error("Invalid tissue grid");
  const seen = new Set<number>(),
    boxes: Box[] = [];
  for (let index = 0; index < tissue.length; index++) {
    if (!tissue[index] || seen.has(index)) continue;
    const queue = [index];
    seen.add(index);
    let left = columns,
      right = 0,
      top = rows,
      bottom = 0,
      count = 0;
    for (let at = 0; at < queue.length; at++) {
      const cell = queue[at];
      if (cell === undefined) throw new Error("Missing grid cell");
      const x = cell % columns,
        y = Math.floor(cell / columns);
      count++;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] as const) {
        const nx = x + dx,
          ny = y + dy,
          n = ny * columns + nx;
        if (
          nx >= 0 &&
          nx < columns &&
          ny >= 0 &&
          ny < rows &&
          tissue[n] &&
          !seen.has(n)
        ) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    if (count >= 6) {
      const x = Math.max(0, left - 1) / columns,
        y = Math.max(0, top - 1) / rows;
      boxes.push({
        x,
        y,
        w: Math.min(columns, right + 2) / columns - x,
        h: Math.min(rows, bottom + 2) / rows - y,
      });
    }
  }
  return boxes;
}
function catalogByLatin(
  catalog: readonly CatalogItem[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of catalog) {
    const key = latinKey(entry.latin),
      ids = map.get(key) ?? [];
    ids.push(entry.id);
    map.set(key, ids);
  }
  return map;
}
function captionsFor(
  p: Ocr["pages"][number],
  labels: z.infer<typeof bookSchema>["pages"][number]["labels"],
  catalog: ReadonlyMap<string, string[]>,
): z.infer<typeof captionSchema>[] {
  return labels.map((l) => {
    const items = p.text_items
      .filter((i) =>
        contains(l.answer, {
          x: (i.x + i.width / 2) / p.width,
          y: (i.y + i.height / 2) / p.height,
        }),
      )
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const raw = items.map((i) => i.text).join(" ");
    const latin = captionLatin(raw);
    const catalogIds = latin ? (catalog.get(latinKey(latin)) ?? []) : [];
    return { ...l, raw, latin, catalogIds };
  });
}
interface GlossaryGroup {
  key: string;
  status: "unreviewed-ocr";
  sourceForms: string[];
  catalogIds: string[];
  occurrences: { page: number; captionId: string; number: number }[];
}
export function provisionalGlossary(
  ocr: Ocr,
  book: z.infer<typeof bookSchema>,
  catalog: readonly CatalogItem[],
): GlossaryGroup[] {
  const groups = new Map<string, GlossaryGroup>();
  const lookup = catalogByLatin(catalog);
  for (const page of book.pages) {
    const p = ocr.pages.find((p) => p.page === page.page);
    if (!p) throw new Error("Missing OCR page");
    for (const c of captionsFor(p, page.labels, lookup)) {
      if (!c.latin) continue;
      const key = latinKey(c.latin);
      if (!key) continue;
      const existing = groups.get(key) ?? {
        key,
        status: "unreviewed-ocr",
        sourceForms: [],
        catalogIds: [],
        occurrences: [],
      };
      if (!existing.sourceForms.includes(c.latin))
        existing.sourceForms.push(c.latin);
      for (const id of c.catalogIds)
        if (!existing.catalogIds.includes(id)) existing.catalogIds.push(id);
      existing.occurrences.push({
        page: page.page,
        captionId: c.id,
        number: c.number,
      });
      groups.set(key, existing);
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      b.occurrences.length - a.occurrences.length || a.key.localeCompare(b.key),
  );
}
export function propose(
  ocr: Ocr,
  book: z.infer<typeof bookSchema>,
  evidence: Evidence,
  catalog: readonly CatalogItem[],
  createdAt: string,
): Report {
  const pages = new Map(ocr.pages.map((p) => [p.page, p]));
  const indexed = new Map(book.pages.map((p) => [p.page, p]));
  const candidates: Candidate[] = [];
  const lookup = catalogByLatin(catalog);
  const teachingIds = new Set(
    catalog
      .filter((c) => c.theory.en.length >= 20 && c.theory.pl.length >= 20)
      .map((c) => c.id),
  );
  const counts = {
    numericBoxes: 0,
    outOfPageBoxes: 0,
    legendOrText: 0,
    margins: 0,
    weakImageSupport: 0,
    conflictingNumbers: 0,
    oneCaption: 0,
    ambiguousCaption: 0,
    missingCaption: 0,
    catalogMatched: 0,
    authoredNotesMatched: 0,
    duplicateAnchors: 0,
  };
  for (const e of evidence.pages) {
    const p = pages.get(e.page),
      b = indexed.get(e.page);
    if (!p || !b) throw new Error(`Missing page ${e.page}`);
    const anchorEvidence = new Map(e.anchors.map((a) => [a.item, a.patch]));
    const components = tissueComponents(e.tissue, e.columns, e.rows);
    const captions = captionsFor(p, b.labels, lookup);
    for (const [index, i] of p.text_items.entries()) {
      if (!/^[1-9][0-9]?$/.test(i.text.trim())) continue;
      counts.numericBoxes++;
      // Vision sometimes returns a clipped header slightly outside the media box.
      // Preserve the raw input; off-page boxes never become candidate anchors.
      if (
        i.x < 0 ||
        i.y < 0 ||
        i.x + i.width > p.width ||
        i.y + i.height > p.height
      ) {
        counts.outOfPageBoxes++;
        continue;
      }
      const anchor = {
          x: i.x / p.width,
          y: i.y / p.height,
          w: i.width / p.width,
          h: i.height / p.height,
        },
        point = center(anchor);
      const patch = anchorEvidence.get(index);
      if (!patch)
        throw new Error(`Image evidence missing for ${e.page}:${index}`);
      if (point.y < 0.05 || point.y > 0.94) {
        counts.margins++;
        continue;
      }
      const adjacentText = p.text_items.some(
        (other) =>
          other !== i &&
          other.x >= i.x + i.width &&
          other.x < i.x + i.width + 16 &&
          Math.abs(other.y - i.y) < 4 &&
          /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(other.text),
      );
      if (
        adjacentText ||
        b.masks.some((mask) => contains(mask, point)) ||
        captions.some((c) => contains(c.legend, point))
      ) {
        counts.legendOrText++;
        continue;
      }
      const imageHint = patchLooksPhotographic(patch)
        ? "colour-photo-support"
        : "unresolved-image";
      const conflictNumbers = [
        ...new Set(
          p.text_items
            .filter(
              (other) =>
                other !== i &&
                /^[1-9][0-9]?$/.test(other.text.trim()) &&
                Number(other.text) !== Number(i.text) &&
                Math.abs(other.x + other.width / 2 - (i.x + i.width / 2)) <
                  Math.max(other.width, i.width) * 0.45 &&
                Math.abs(other.y + other.height / 2 - (i.y + i.height / 2)) <
                  Math.max(other.height, i.height) * 0.45,
            )
            .map((other) => Number(other.text)),
        ),
      ];
      const matches = captions.filter((c) => c.number === Number(i.text));
      const captionState =
        matches.length === 1
          ? "one-caption"
          : matches.length
            ? "ambiguous-caption"
            : "missing-caption";
      const crop = components
        .filter((c) => contains(c, point))
        .sort((a, b) => a.w * a.h - b.w * b.h)[0] ?? { x: 0, y: 0, w: 1, h: 1 };
      candidates.push({
        id: `draft-${e.page}-${index}-${Number(i.text)}`,
        page: e.page,
        number: Number(i.text),
        anchor,
        crop,
        photoPatch: patch,
        imageHint,
        conflictNumbers,
        captionState,
        captions: matches,
      });
    }
  }
  const unique: Candidate[] = [];
  const buckets = new Map<string, Candidate[]>();
  for (const c of candidates) {
    const key = `${c.page}:${c.number}`,
      existing = buckets.get(key) ?? [];
    const duplicate = existing.some((other) => {
      const a = c.anchor,
        b = other.anchor;
      const overlap =
        Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
        Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      return overlap / Math.min(a.w * a.h, b.w * b.h) > 0.65;
    });
    if (duplicate) {
      counts.duplicateAnchors++;
      continue;
    }
    existing.push(c);
    buckets.set(key, existing);
    unique.push(c);
  }
  counts.catalogMatched = unique.filter(
    (c) => c.captionState === "one-caption" && c.captions[0]?.catalogIds.length,
  ).length;
  counts.authoredNotesMatched = unique.filter(
    (c) =>
      c.captionState === "one-caption" &&
      c.captions[0]?.catalogIds.some((id) => teachingIds.has(id)),
  ).length;
  counts.oneCaption = unique.filter(
    (c) => c.captionState === "one-caption",
  ).length;
  counts.ambiguousCaption = unique.filter(
    (c) => c.captionState === "ambiguous-caption",
  ).length;
  counts.missingCaption = unique.filter(
    (c) => c.captionState === "missing-caption",
  ).length;
  counts.weakImageSupport = unique.filter(
    (c) => c.imageHint === "unresolved-image",
  ).length;
  counts.conflictingNumbers = unique.filter(
    (c) => c.conflictNumbers.length,
  ).length;
  return reportSchema.parse({
    version: 1,
    atlasId,
    createdAt,
    candidates: unique,
    catalog: [...catalog],
    statistics: counts,
  });
}
export function benchmark(
  candidates: readonly Candidate[],
  pins: readonly PhotoPin[],
): { development: Benchmark; comparison: Benchmark } {
  const allowedPages = new Set([
    142, 147, 149, 151, 156, 159, 318, 322, 331, 333, 338,
  ]);
  const comparable = pins.filter(
    (p) => allowedPages.has(p.page) && /^mcminn-\d+-[A-Z]-\d+$/.test(p.id),
  );
  const holdout = new Set([318, 322, 331, 333, 338]);
  return {
    development: score(comparable.filter((p) => !holdout.has(p.page))),
    comparison: score(comparable.filter((p) => holdout.has(p.page))),
  };
  function score(targets: readonly PhotoPin[]): Benchmark {
    let within24 = 0,
      within48 = 0,
      captionAndCatalog = 0;
    const missing: string[] = [];
    for (const p of targets) {
      const n = Number(p.id.split("-").at(-1));
      const eligible = candidates.filter(
        (c) =>
          c.page === p.page &&
          c.number === n &&
          contains(p.crop, center(c.anchor)) &&
          !(p.masks ?? []).some((m) => contains(m, center(c.anchor))),
      );
      const nearest = eligible
        .map((c) => ({
          c,
          d: Math.hypot(
            (center(c.anchor).x - p.x) * 1274,
            (center(c.anchor).y - p.y) * 1800,
          ),
        }))
        .sort((a, b) => a.d - b.d)[0];
      if (nearest && nearest.d <= 48) {
        within48++;
        if (nearest.d <= 24) within24++;
        if (
          nearest.c.captionState === "one-caption" &&
          nearest.c.captions[0]?.catalogIds.some(
            (id) => pins.find((c) => c.id === id)?.latin === p.latin,
          )
        )
          captionAndCatalog++;
      } else missing.push(p.id);
    }
    return {
      targets: targets.length,
      anchorWithin24px: within24,
      anchorWithin48px: within48,
      captionAndCatalog,
      missing,
    };
  }
}
interface Benchmark {
  targets: number;
  anchorWithin24px: number;
  anchorWithin48px: number;
  captionAndCatalog: number;
  missing: string[];
}
const reviewedValuesSchema = z.object({
  tip: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
  crop: boxSchema,
  pl: z.string().trim().min(2),
  en: z.string().trim().min(2),
  latin: z.string().trim().min(2),
  recognize: z.object({
    en: z.string().trim().min(20),
    pl: z.string().trim().min(20),
  }),
  theory: z.object({
    en: z.string().trim().min(20),
    pl: z.string().trim().min(20),
  }),
  system: photoPinSchema.shape.system,
  region: photoPinSchema.shape.region,
  exercise: photoPinSchema.shape.exercise,
  side: z.enum(["l", "r", "none"]),
  catalogId: z.string().nullable(),
  useModel: z.boolean(),
  geometryChecked: z.literal(true),
  captionChecked: z.literal(true),
  contentChecked: z.literal(true),
});
export function makeReviewedPin(
  candidate: Candidate,
  raw: unknown,
  catalog: readonly CatalogItem[],
): PhotoPin {
  const v = reviewedValuesSchema.parse(raw);
  if (candidate.captions.some((c) => overlaps(v.crop, c.legend)))
    throw new Error("Crop includes a source answer legend; tighten the crop");
  if (!contains(v.crop, v.tip))
    throw new Error("Tip is outside the reviewed crop");
  if (contains(candidate.anchor, v.tip))
    throw new Error(
      "Choose the tissue/leader endpoint, not the printed-number box",
    );
  const source = v.catalogId ? catalog.find((c) => c.id === v.catalogId) : null;
  if (v.catalogId && !source) throw new Error("Unknown catalogue entry");
  const modelId = v.useModel ? (source?.modelId ?? null) : null;
  if (v.useModel && !modelId) throw new Error("No model for this entry");
  if (modelId && source?.system !== v.system)
    throw new Error("Model belongs to another system");
  if (modelId && /_[lr]$/.test(modelId) && !modelId.endsWith(`_${v.side}`))
    throw new Error("Model side differs from the photograph");
  return photoPinSchema.parse({
    id: candidate.id.replace(/^draft-/, "mcminn-reviewed-"),
    atlasId,
    page: candidate.page,
    x: v.tip.x,
    y: v.tip.y,
    crop: v.crop,
    pl: v.pl,
    en: v.en,
    latin: v.latin,
    region: v.region,
    system: v.system,
    exercise: v.exercise,
    recognize: v.recognize,
    theory: v.theory,
    modelId,
    source: `McMinn · PDF ${candidate.page} · printed number ${candidate.number} · batch annotation manually reviewed`,
  });
}

export function restoreReviews(
  report: Report,
  raw: unknown,
): z.infer<typeof reviewSchema> {
  const data = reviewSchema.parse(raw);
  if (data.reportId !== `${report.atlasId}:${report.createdAt}`)
    throw new Error("Review belongs to another OCR run");
  if (
    new Set(data.reviews.map((r) => r.candidateId)).size !== data.reviews.length
  )
    throw new Error("Duplicate reviewed candidates");
  for (const r of data.reviews) {
    const c = report.candidates.find((c) => c.id === r.candidateId);
    if (!c) throw new Error("Unknown reviewed candidate");
    if (r.decision === "approved") {
      const p = r.pin;
      if (
        p.id !== c.id.replace(/^draft-/, "mcminn-reviewed-") ||
        p.page !== c.page ||
        p.atlasId !== report.atlasId
      )
        throw new Error("Reviewed pin identity differs");
      if (c.captions.some((caption) => overlaps(p.crop, caption.legend)))
        throw new Error("Reviewed crop includes answer legend");
      if (!contains(p.crop, p) || contains(c.anchor, p))
        throw new Error("Invalid reviewed geometry");
      for (const lang of ["en", "pl"] as const)
        if (
          p.recognize[lang].trim().length < 20 ||
          p.theory[lang].trim().length < 20
        )
          throw new Error("Incomplete reviewed content");
      if (
        p.modelId &&
        !report.catalog.some(
          (entry) => entry.modelId === p.modelId && entry.system === p.system,
        )
      )
        throw new Error("Unknown reviewed model");
    }
  }
  return data;
}

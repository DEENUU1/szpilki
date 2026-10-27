import { z } from "zod";
import { boxSchema } from "./atlas-book";
import type { PageBox } from "./atlas-book";
import { bookCategories } from "./book-category";
import type { BookCategory } from "./book-category";
import { mcminnId, starterPins } from "./photo-data";
import type { PhotoPin } from "./photo-data";
import autoUrl from "./data/mcminn-auto.json?url";

const captionReferenceSchema = z.strictObject({
  id: z.string(),
  answer: boxSchema,
  legend: boxSchema,
  category: z.enum(bookCategories),
  noteIds: z.array(z.string()),
});
export const autoItemSchema = z.strictObject({
  id: z.string().regex(/^mcminn-auto-\d+-\d+-\d+$/),
  page: z.number().int().min(1).max(362),
  number: z.number().int().min(1).max(99),
  anchor: boxSchema,
  crop: boxSchema,
  imageHint: z.enum(["colour-photo-support", "unresolved-image"]),
  conflictNumbers: z.array(z.number().int().positive()),
  captions: z.array(captionReferenceSchema),
});
export const autoIndexSchema = z
  .strictObject({
    version: z.literal(1),
    atlasId: z.literal(mcminnId),
    candidates: z.array(autoItemSchema),
  })
  .superRefine((index, ctx) => {
    if (
      new Set(index.candidates.map((item) => item.id)).size !==
      index.candidates.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate automatic question ID",
      });
    for (const item of index.candidates) {
      const match = /^mcminn-auto-(\d+)-\d+-(\d+)$/.exec(item.id);
      if (
        Number(match?.[1]) !== item.page ||
        Number(match?.[2]) !== item.number
      )
        ctx.addIssue({
          code: "custom",
          message: "Automatic question identity mismatch",
        });
      for (const caption of item.captions)
        if (
          caption.noteIds.some(
            (id) => !starterPins.some((pin) => pin.id === id),
          )
        )
          ctx.addIssue({ code: "custom", message: "Unknown authored note" });
    }
  });
export type AutoIndex = z.infer<typeof autoIndexSchema>;
export type AutoQuestion = AutoIndex["candidates"][number] & {
  kind: "auto";
  atlasId: typeof mcminnId;
};
export const autoQualities = [
  "all",
  "one-caption",
  "ambiguous-caption",
  "missing-caption",
  "conflicting-number",
] as const;
export type AutoQuality = (typeof autoQualities)[number];
export function autoQuestions(index: AutoIndex): AutoQuestion[] {
  return index.candidates.map((item) => ({
    ...item,
    kind: "auto",
    atlasId: index.atlasId,
  }));
}
export function autoPool(
  questions: readonly AutoQuestion[],
  first: number,
  last: number,
  category: BookCategory | "all",
  quality: AutoQuality,
  excluded: readonly string[],
): AutoQuestion[] {
  const hidden = new Set(excluded);
  return questions.filter(
    (q) =>
      q.page >= first &&
      q.page <= last &&
      !hidden.has(q.id) &&
      (category === "all" || q.captions.some((c) => c.category === category)) &&
      (quality === "all" ||
        (quality === "one-caption"
          ? q.captions.length === 1
          : quality === "ambiguous-caption"
            ? q.captions.length > 1
            : quality === "missing-caption"
              ? q.captions.length === 0
              : q.conflictNumbers.length > 0)),
  );
}
// Keep the numeric anchor and surrounding photograph visible. Crops are proposals;
// answer masking must happen on the full local page before this box is applied.
export function autoPracticeCrop(question: AutoQuestion): PageBox {
  const left = Math.max(0, Math.min(question.crop.x, question.anchor.x) - 0.04);
  const top = Math.max(0, Math.min(question.crop.y, question.anchor.y) - 0.04);
  const right = Math.min(
    1,
    Math.max(
      question.crop.x + question.crop.w,
      question.anchor.x + question.anchor.w,
    ) + 0.04,
  );
  const bottom = Math.min(
    1,
    Math.max(
      question.crop.y + question.crop.h,
      question.anchor.y + question.anchor.h,
    ) + 0.04,
  );
  return { x: left, y: top, w: right - left, h: bottom - top };
}
export function autoNotes(question: AutoQuestion): PhotoPin[] {
  if (question.captions.length !== 1 || question.conflictNumbers.length)
    return [];
  const ids = new Set(question.captions[0]?.noteIds);
  return starterPins.filter((pin) => ids.has(pin.id));
}
export async function loadAutoPins(): Promise<AutoQuestion[]> {
  const response = await fetch(autoUrl);
  if (!response.ok)
    throw new Error(`Could not load automatic pins (${response.status})`);
  const raw: unknown = await response.json();
  return autoQuestions(autoIndexSchema.parse(raw));
}
export function autoReviewName(
  id: string,
  language: "en" | "pl",
): string | null {
  const match = new RegExp(
    `^photo:${mcminnId}:mcminn-auto-(\\d+)-\\d+-(\\d+)$`,
  ).exec(id);
  return match
    ? language === "pl"
      ? `McMinn · auto · strona ${match[1]} · numer ${match[2]}`
      : `McMinn · auto · page ${match[1]} · number ${match[2]}`
    : null;
}

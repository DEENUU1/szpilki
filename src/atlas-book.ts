import { z } from "zod";
import { mcminnId } from "./photo-data";
import bookUrl from "./data/mcminn-book.json?url";

export const boxSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().positive().max(1),
    h: z.number().positive().max(1),
  })
  .refine(
    (b) => b.x + b.w <= 1.0001 && b.y + b.h <= 1.0001,
    "Box exceeds page",
  );
export type PageBox = z.infer<typeof boxSchema>;
const labelSchema = z.object({
  id: z.string(),
  number: z.number().int().positive(),
  answer: boxSchema,
  legend: boxSchema,
});
export const bookSchema = z.object({
  atlasId: z.literal(mcminnId),
  pageCount: z.literal(362),
  pages: z
    .array(
      z.object({
        page: z.number().int().min(1).max(362),
        masks: z.array(boxSchema),
        labels: z.array(labelSchema),
      }),
    )
    .length(362),
});
export type BookIndex = z.infer<typeof bookSchema>;
export async function loadBook(): Promise<BookIndex> {
  const response = await fetch(bookUrl);
  if (!response.ok)
    throw new Error(`Could not load the McMinn index (${response.status})`);
  const raw: unknown = await response.json();
  return bookSchema.parse(raw);
}
export interface BookQuestion {
  kind: "book";
  id: string;
  atlasId: string;
  page: number;
  number: number;
  answer: PageBox;
  legend: PageBox;
}
export function bookQuestions(book: BookIndex): BookQuestion[] {
  return book.pages.flatMap((page) =>
    page.labels.map((label) => ({
      ...label,
      kind: "book",
      atlasId: mcminnId,
      page: page.page,
    })),
  );
}
export function bookPool(
  book: BookIndex,
  first: number,
  last: number,
): BookQuestion[] {
  return bookQuestions(book).filter((q) => q.page >= first && q.page <= last);
}
export function questionName(
  question: Pick<BookQuestion, "page" | "number">,
  language: "en" | "pl",
): string {
  return language === "en"
    ? `McMinn · PDF page ${question.page} · label ${question.number}`
    : `McMinn · strona PDF ${question.page} · numer ${question.number}`;
}
export function bookReviewName(
  id: string,
  language: "en" | "pl",
): string | null {
  const match = new RegExp(
    `^photo:${mcminnId}:mcminn-book-(\\d+)-\\d+-(\\d+)$`,
  ).exec(id);
  return match
    ? questionName(
        { page: Number(match[1]), number: Number(match[2]) },
        language,
      )
    : null;
}

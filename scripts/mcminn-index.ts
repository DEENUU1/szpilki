/** Offline geometry index. Private OCR text and textbook pixels never enter the output. */
import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { captionCategory } from "../src/book-category.ts";

const itemSchema = z.object({
  text: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});
const pageSchema = z.object({
  page: z.number(),
  width: z.number(),
  height: z.number(),
  text_items: z.array(itemSchema),
});
type Item = z.infer<typeof itemSchema>;
type Page = z.infer<typeof pageSchema>;
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Caption {
  number: number;
  items: Item[];
  start: Item;
}
const input = process.argv[2] ?? ".research/mcminn/vision.json";
const output = process.argv[3] ?? "src/data/mcminn-book.json";
const raw: unknown = JSON.parse(await readFile(input, "utf8"));
const data = z
  .object({
    sourceSha256: z.literal(
      "a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451",
    ),
    pages: z.array(pageSchema).length(362),
  })
  .parse(raw);

function bounds(items: Item[], page: Page, padding = 1): Rect {
  const x = Math.max(0, Math.min(...items.map((i) => i.x)) - padding);
  const y = Math.max(0, Math.min(...items.map((i) => i.y)) - padding);
  const right = Math.min(
    page.width,
    Math.max(...items.map((i) => i.x + i.width)) + padding,
  );
  const bottom = Math.min(
    page.height,
    Math.max(...items.map((i) => i.y + i.height)) + padding,
  );
  const round = (n: number): number => Math.round(n * 100000) / 100000;
  return {
    x: round(x / page.width),
    y: round(y / page.height),
    w: round((right - x) / page.width),
    h: round((bottom - y) / page.height),
  };
}
function captions(page: Page): Caption[] {
  const starts: { start: Item; number: number; text: Item }[] = [];
  for (const item of page.text_items) {
    const match = /^(\d{1,2})\s+([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż].*)/.exec(item.text);
    if (match?.[1])
      starts.push({ start: item, number: Number(match[1]), text: item });
    else if (/^\d{1,2}$/.test(item.text)) {
      const adjacent = page.text_items.filter(
        (i) =>
          i !== item &&
          i.x >= item.x + item.width &&
          i.x < item.x + item.width + 16 &&
          Math.abs(i.y - item.y) < 4 &&
          /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(i.text),
      );
      if (adjacent.length === 1 && adjacent[0])
        starts.push({
          start: item,
          number: Number(item.text),
          text: adjacent[0],
        });
    }
  }
  const labels: Caption[] = [];
  for (const entry of starts) {
    if (!entry.number) continue;
    const { start, text } = entry;
    const nextRow = Math.min(
      page.height,
      ...starts
        .filter(
          (s) =>
            s !== entry &&
            Math.abs(s.start.x - start.x) < 12 &&
            s.start.y > start.y + 4,
        )
        .map((s) => s.start.y - 1),
    );
    const nextColumn = Math.min(
      page.width,
      ...starts
        .filter(
          (s) => s.start.x > start.x + 40 && Math.abs(s.start.y - start.y) < 75,
        )
        .map((s) => s.start.x - 3),
    );
    const rows = page.text_items
      .filter(
        (i) =>
          i !== start &&
          i !== text &&
          i.y > start.y + 4 &&
          i.y < Math.min(nextRow, start.y + 70) &&
          i.x >= text.x - 3 &&
          i.x + i.width < nextColumn + 4 &&
          i.x < text.x + 16,
      )
      .sort((a, b) => a.y - b.y);
    const items = start === text ? [start] : [start, text];
    let content = text.text;
    for (const row of rows) {
      if (content.includes("(") && content.includes(")")) break;
      const last = items.at(-1);
      if (!last || row.y - last.y > 17) break;
      items.push(row);
      content += ` ${row.text}`;
    }
    // Paired vernacular / Latin captions distinguish legends from numbers on specimens.
    if (!/\([A-Za-z][^()]{2,180}\)/.test(content)) continue;
    if (
      !labels.some(
        (l) =>
          Math.abs(l.start.y - start.y) < 3 &&
          Math.abs(l.start.x - start.x) < 3,
      )
    )
      labels.push({ number: entry.number, start, items });
  }
  return labels.filter((l) =>
    labels.some(
      (other) =>
        other !== l &&
        Math.abs(l.start.x - other.start.x) < 12 &&
        Math.abs(l.start.y - other.start.y) < 70 &&
        Math.abs(l.number - other.number) <= 4,
    ),
  );
}
const pages = data.pages.map((page) => {
  const labels = captions(page);
  const groups: Caption[][] = [];
  for (const label of [...labels].sort((a, b) => a.start.y - b.start.y)) {
    const group = groups.find((g) =>
      g.some(
        (other) =>
          Math.abs(other.start.x - label.start.x) < 12 &&
          Math.abs(other.start.y - label.start.y) < 70 &&
          Math.abs(other.number - label.number) <= 4,
      ),
    );
    if (group) group.push(label);
    else groups.push([label]);
  }
  const masks = page.text_items
    .filter(
      (i) => i.text.length > 3 && /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(i.text),
    )
    .map((i) => bounds([i], page, 2));
  return {
    page: page.page,
    masks,
    labels: groups.flatMap((group, groupIndex) =>
      group
        .filter(
          (label) =>
            group.filter((other) => other.number === label.number).length === 1,
        )
        .map((label) => ({
          id: `mcminn-book-${page.page}-${groupIndex}-${label.number}`,
          number: label.number,
          category: captionCategory(
            label.items.map((item) => item.text).join(" "),
          ),
          answer: bounds(label.items, page, 2),
          legend: bounds(
            group.flatMap((l) => l.items),
            page,
            3,
          ),
        })),
    ),
  };
});
await writeFile(
  output,
  JSON.stringify({
    atlasId: "a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451",
    pageCount: 362,
    pages,
  }),
);
console.log({
  pages: pages.length,
  questionPages: pages.filter((p) => p.labels.length).length,
  questions: pages.reduce((n, p) => n + p.labels.length, 0),
});

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { reportSchema } from "./pin-pipeline";
import { autoIndexSchema } from "../src/auto-pins";
import { starterPins } from "../src/photo-data";
const { values } = parseArgs({
  options: { report: { type: "string" } },
  strict: true,
});
if (!values.report)
  throw new Error(
    "Usage: npm run atlas:public-index -- --report .research/run/report.json",
  );
const raw: unknown = JSON.parse(await readFile(values.report, "utf8"));
const report = reportSchema.parse(raw);
const noteIds = new Set(starterPins.map((pin) => pin.id));
const index = autoIndexSchema.parse({
  version: 1,
  atlasId: report.atlasId,
  candidates: report.candidates.map((item) => ({
    id: item.id.replace(/^draft-/, "mcminn-auto-"),
    page: item.page,
    number: item.number,
    anchor: item.anchor,
    crop: item.crop,
    imageHint: item.imageHint,
    conflictNumbers: item.conflictNumbers,
    captions: item.captions.map((caption) => ({
      id: caption.id,
      answer: caption.answer,
      legend: caption.legend,
      category: caption.category,
      noteIds: caption.catalogIds.filter((id) => noteIds.has(id)),
    })),
  })),
});
// Publish geometry/references only; source pixels and OCR prose stay local.
await writeFile(
  "src/data/mcminn-auto.json",
  JSON.stringify(index, (_key, value: unknown) =>
    typeof value === "number" && !Number.isInteger(value)
      ? Math.round(value * 1e6) / 1e6
      : value,
  ),
);
console.log(
  `Published metadata for ${index.candidates.length} automatic questions`,
);

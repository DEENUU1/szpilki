import { readFile, writeFile, mkdir, access, realpath } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { parseArgs } from "node:util";
import { build } from "vite";
import { manifestSchema } from "../src/domain";
import { bookSchema } from "../src/atlas-book";
import { starterPins } from "../src/photo-data";
import {
  ocrSchema,
  evidenceSchema,
  propose,
  benchmark,
  provisionalGlossary,
  modelCatalog,
} from "./pin-pipeline.ts";
const { values } = parseArgs({
  options: { ocr: { type: "string" }, out: { type: "string" } },
  strict: true,
});
if (!values.ocr || !values.out)
  throw new Error(
    "Usage: npm run atlas:propose -- --ocr vision.json --out .research/run (after image-evidence extraction)",
  );
const root = process.cwd(),
  out = resolve(values.out),
  privateRoot = resolve(root, ".research");
const within = relative(privateRoot, out);
if (
  !within ||
  within.startsWith(`..${sep}`) ||
  within === ".." ||
  within.startsWith(sep)
)
  throw new Error("Output must be inside .research/");
const resolvedOut = await realpath(out),
  resolvedPrivateRoot = await realpath(privateRoot);
const actual = relative(resolvedPrivateRoot, resolvedOut);
if (
  !actual ||
  actual.startsWith(`..${sep}`) ||
  actual === ".." ||
  actual.startsWith(sep)
)
  throw new Error("Output symlink leaves .research/");
const reportFile = resolve(out, "report.json");
try {
  await access(reportFile);
  throw new Error(
    "Report already exists; choose a new run directory to preserve review work",
  );
} catch (error) {
  if (
    !(error instanceof Error) ||
    !("code" in error) ||
    error.code !== "ENOENT"
  )
    throw error;
}
const start = performance.now();
const parsed = await Promise.allSettled([
  readFile(values.ocr, "utf8"),
  readFile(resolve(root, "src/data/mcminn-book.json"), "utf8"),
  readFile(resolve(out, "evidence.json"), "utf8"),
]);
const contents = parsed.map((result) => {
  if (result.status === "rejected") throw result.reason;
  return result.value;
});
const [rawOcr, rawBook, rawEvidence] = contents;
if (!rawOcr || !rawBook || !rawEvidence) throw new Error("Missing input");
const ocr = ocrSchema.parse(JSON.parse(rawOcr) as unknown),
  book = bookSchema.parse(JSON.parse(rawBook) as unknown),
  evidence = evidenceSchema.parse(JSON.parse(rawEvidence) as unknown);
const manifest = manifestSchema.parse(
  JSON.parse(
    await readFile(resolve(root, "public/anatomy/manifest.json"), "utf8"),
  ) as unknown,
);
const catalog = modelCatalog(starterPins, manifest.organs);
const report = propose(ocr, book, evidence, catalog, new Date().toISOString());
const glossary = provisionalGlossary(ocr, book, catalog);
const evaluation = benchmark(report.candidates, starterPins);
const elapsedMs = Math.round(performance.now() - start);
await mkdir(out, { recursive: true });
await writeFile(resolve(out, "glossary.json"), JSON.stringify(glossary), {
  flag: "wx",
});
await writeFile(reportFile, JSON.stringify(report), { flag: "wx" });
await writeFile(
  resolve(out, "benchmark.json"),
  JSON.stringify(
    {
      coordinateUnit: "pixels in a 1274×1800 rendering",
      meaning:
        "Marker-neighbour recovery, not anatomical tip accuracy. No precision estimate for the whole book.",
      developmentPages: [142, 147, 149, 151, 156, 159],
      comparisonPages: [318, 322, 331, 333, 338],
      ...evaluation,
    },
    null,
    2,
  ),
  { flag: "wx" },
);
await build({
  configFile: false,
  logLevel: "warn",
  build: {
    outDir: out,
    emptyOutDir: false,
    lib: {
      entry: resolve(root, "scripts/atlas-review-ui.ts"),
      formats: ["es"],
      fileName: () => "review.js",
    },
  },
});
await writeFile(
  resolve(out, "index.html"),
  await readFile(resolve(root, "scripts/atlas-review.html"), "utf8"),
  { flag: "wx" },
);
console.log(
  JSON.stringify(
    {
      pages: ocr.pages.length,
      candidates: report.candidates.length,
      ...report.statistics,
      proposalMs: elapsedMs,
      provisionalOcrGroups: glossary.length,
      benchmark: evaluation,
      review: resolve(out, "index.html"),
    },
    null,
    2,
  ),
);

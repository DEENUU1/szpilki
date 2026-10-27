# McMinn whole-book practice

The exact supplied 362-page scan is identified by SHA-256:

`a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451`

The index contains **6,784 numbered-caption questions on 317 PDF pages**. These are occurrences of printed labels, including repeated structures on different plates, not 6,784 unique anatomical structures. Every PDF page remains accessible through the page browser.

## What the learner sees

Choose **Whole McMinn · printed numbers**, select an inclusive PDF page range and draw a question. The app retains numbers on specimens, masks detected text and outlines the relevant legend block. The question asks for a printed number associated with that block. It does not invent a point on the photograph.

Type an answer and reveal it. The app shows a magnified crop of the **original caption from the local PDF**, and restores the page, including its source commentary and neighbouring structures. The category filter is automatic and can leave ambiguous captions unclassified. Use **Enlarge source page** to read it at full size. Assess the answer manually. English UI does not translate the book's original Polish/Latin captions.

Neither OCR text nor generated medical claims are used as an answer key. The existing 39 prepared pins retain automatic name matching, original bilingual explanations and verified model identifiers. Their content is separate from this source-caption mode. Detailed new explanations, structured syllabus classification and 3D links have **not** been authored for every book question.

Automatically located captions and masks have **not** all been reviewed individually. A malformed crop, repeated number in separate figures or missed text can make a question unsuitable. Skip it without grading, or use **Wrong caption / exclude question**. Exclusions are saved locally, included in study JSON and can be restored. They are not sent anywhere.

## Coverage boundaries

All 362 pages were processed. The 45 pages without eligible caption questions are:

1, 2, 3, 4, 5, 11, 20, 30, 56, 61, 89, 90, 91, 92, 93, 94, 95, 96, 107, 114, 119, 136, 163, 177, 178, 179, 181, 221, 222, 233, 255, 283, 284, 285, 315, 316, 333, 339, 356, 357, 358, 359, 360, 361, 362.

These include front matter, clinical prose, unnumbered diagrams, and plates where this extractor did not recover a reliable numbered-caption sequence. A zero count does not mean a page has no anatomical material. PDF page numbers include the scan front matter and may differ from printed page numbers.

## Reproducing the geometry index

This is an offline maintainer workflow on macOS, using the system Vision OCR framework and PDFKit. Node.js 22.12+ and the project's installed dependencies are required for the second step. OCR results can vary between macOS revisions; regenerated geometry needs review before replacing the checked-in index.

```bash
mkdir -p .research/mcminn
swift scripts/mcminn-ocr.swift /absolute/path/to/source.pdf .research/mcminn/vision.json
node --experimental-strip-types scripts/mcminn-index.ts
npm test
npm run build
```

The OCR runner rejects a different scan before processing. OCR output contains private textbook text and belongs in ignored `.research/`. The public index contains only page numbers, printed numbers, IDs, inferred category codes and normalized rectangles for captions, legends and text masks. It contains no textbook pixels or transcribed prose. The browser downloads this approximately 2.15 MB metadata asset only after opening the matching PDF.

The extractor requires nearby numbered-caption sequences with a parenthesized Latin name, bounds continuation lines by column and the next caption, and excludes ambiguous duplicate numbers within one legend group. These are layout heuristics, not anatomical verification. The source caption remains the authority.

# Offline atlas proposal pipeline

This maintainer tool automates batch preparation, not anatomical approval. It reads the exact McMinn scan and cached OCR locally, refines numeric observations on overlapping image tiles, joins them to the existing caption index, proposes crops and produces an editable review page. It does not call an external model/API, change the public practice deck, or modify learner progress.

A detected printed number is an **OCR anchor, not a pin tip**. An operator must click the tissue or leader-line endpoint and verify the source, crop, terminology, teaching content and model side before exporting a prepared question. No automatic conversion of all proposals into ready study material is claimed.

## Measured run, 27 October 2026

Exact input: the 362-page scan whose SHA-256 is `a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451`, the existing macOS Vision OCR and the committed 6,784-caption geometry index. The authored reference deck was the 119-question version released by PR #5. All timings are local observations on this workstation, not a cross-machine performance guarantee.

| Stage / output                                                           | Observation |
| ------------------------------------------------------------------------ | ----------: |
| Second OCR, six overlapping tiles on all 362 pages                       | 205 seconds |
| Additional numeric observations from this pass                           |      10,369 |
| Image sampling and private page thumbnails                               |  68 seconds |
| JSON parsing, joins, glossary and diagnostic calculation                 |      348 ms |
| Proposals after removing 68 overlapping duplicate detections             |       9,928 |
| One matching caption on the page                                         |       6,045 |
| Multiple possible captions                                               |       2,051 |
| No matching caption                                                      |       1,832 |
| Exact normalised match to an existing name/model entry                   |       1,530 |
| Existing authored teaching note available as a draft                     |         410 |
| Image support unresolved (includes grayscale specimens, MR and diagrams) |       2,587 |
| Conflicting overlapping OCR numbers                                      |         441 |
| Provisional normalised Latin groups                                      |       3,081 |

These counts describe **proposals**, including repeats across figures, residual text/diagram detections and OCR errors. They are neither 9,928 reviewed pins nor 3,081 verified unique anatomical structures. The provisional glossary deliberately retains OCR mistakes and separate inflected/variant names rather than merging them with a fuzzy medical guess.

### Geometric diagnostic

The diagnostic uses 80 already placed points on 11 specimen pages with explicit printed-number identifiers. It measures whether an OCR number-box centre with that number lies within **48 pixels** of the existing pin in a 1274 × 1800 rendering, inside the relevant reference crop and outside its masks. Reference coordinates are used only for this diagnostic, never to place proposals.

| Input                                                            | Development pages, 39 targets | Comparison pages, 41 targets | Combined |
| ---------------------------------------------------------------- | ----------------------------: | ---------------------------: | -------: |
| Cached whole-page OCR, with uncertain images retained for review |                            18 |                           26 |    44/80 |
| Second tiled OCR plus the same candidate/review approach         |                            28 |                           34 |    62/80 |

Only 28/80 targets additionally had one source caption matching an already authored canonical term. Source captions often name a whole muscle while the prepared question identifies a head or tendon; repeated numbers and legends on a following page also remain unresolved.

Both groups were inspected during development. This is a development diagnostic, **not an independent holdout evaluation, pin-tip accuracy, whole-book recall or a precision estimate**. The tool does not trace leader lines. The image heuristic is a colour/occupancy signal, not a calibrated probability; grayscale bone specimens are retained under an unresolved-image flag.

## Run it

Requirements: macOS with Swift/PDFKit/Vision, Node.js matching the project and `npm ci`. No extra package or API key is required. Existing OCR can be reused; see [OCR reproduction](mcminn-index.md). Each stage checks the exact scan identity and page count. Choose fresh paths: existing reports/evidence are not overwritten.

```bash
# Paths below are local user files, not repository assets.
PDF='/absolute/path/to/McMinn.pdf'
OCR='/absolute/path/to/cached/vision.json'

# Optional first experiment: replace "all" with e.g. "142,149,151".
swift scripts/mcminn-refine-labels.swift "$PDF" "$OCR" \
  .research/atlas-run/refined.json all

swift scripts/mcminn-image-evidence.swift "$PDF" \
  .research/atlas-run/refined.json .research/atlas-run/output

npm run atlas:propose -- --ocr .research/atlas-run/refined.json \
  --out .research/atlas-run/output

# Serve only on loopback; do not publish this folder.
python3 -m http.server 4180 --bind 127.0.0.1 \
  --directory .research/atlas-run/output
```

Open `http://127.0.0.1:4180/`. To compare a first pass, run image evidence and proposals using the original cached OCR in another fresh directory. Reuse the generated inputs for browser/UI iterations; rerunning OCR is unnecessary.

The output contains private `pages/*.jpg`, `report.json`, `glossary.json`, `benchmark.json` and the local review UI. Output roots must resolve inside `.research/`, including through symlinks. This directory is ignored by Git. Do not copy its atlas pixels or raw captions to `public/`, repository documentation images, or a Pages artifact.

## Review and export

1. Choose a page and candidate. The blue rectangle is the OCR number; orange is a proposed crop. Repeated numbers in distinct legends remain ambiguous. Conflicting OCR readings are shown rather than silently selected.
2. Verify the actual specimen and click the tissue/leader endpoint. Tighten the crop so it does not include answer legends or explanatory diagrams. Coarse connected components can produce an oversized or fragmented crop.
3. Exact Latin matching offers existing authored entries or Z-Anatomy model metadata. Model-only entries have **empty teaching notes**; no anatomy explanation or translation is fabricated. Parent/group models remain explicitly distinguishable. Verify side and system before enabling a model link.
4. Write recognition clues for this photograph in PL and EN. Reused theory from another plate is a draft and may contain specimen-specific observations. Reviewed entries from the current session become available for exact-name reuse on subsequent candidates; view-specific recognition text is never copied automatically.
5. Confirm geometry, caption and content, then approve or reject. The export boundary requires complete bilingual content, a tip outside the printed-number box, a point inside the crop, a crop excluding the matched source legend, and a model consistent with system and declared side.
6. Download review progress before closing. It can be resumed only against the same report/run. Decisions with mismatched identities, duplicate candidate IDs, missing approved pins or invalid geometry are rejected. Downloaded `reviewed-pins.json` is an array conforming to `photoPinSchema` for subsequent maintainer integration; it is **not** an automatic study-progress import.

Approved decisions preserve the last approved version if fields are edited later; approve again to replace it. Unapproved form drafts are not saved by the progress download. Integration into the public deck remains a separate reviewed code change, including checking for duplicates of existing prepared questions and preserving published review IDs.

## Verification and limits

Synthetic regression tests cover identity/page validation, number-preserving exact terminology keys, ambiguous and missing captions, unresolved image evidence, conflicting OCR reads, crop components, duplicate anchors, metadata-only catalogue entries, glossary grouping, review/export guards and cross-run resume rejection. These tests do not prove anatomical correctness. The Swift image/OCR stages were exercised on the actual full local scan; Linux CI type-checks/tests the TypeScript components and builds the unchanged public app.

A browser check selected the photographic median-nerve number on PDF 149, showed its source caption and authored-note provenance, accepted an operator-selected tissue tip and tightened crop, and exported one structurally valid question with the right median-nerve model. That export is a workflow test of an existing question, not an additional published pin. No learner rating or session was changed.

# Automatic photograph practice

The web app now includes all **9,928 automatic proposals** from the local pipeline as a separate, default photo-practice mode. This is a proposal set, not a new set of individually verified anatomical pins. Prepared questions and whole-book caption questions retain their previous IDs and remain separate modes.

## Learner flow

1. Open Atlas photographs and add the exact McMinn PDF, identified by its existing SHA-256 check. Source pixels stay in local IndexedDB and are rendered in the browser.
2. Select Automatic pins. The initial pool includes all 9,928 items. Filter by inclusive PDF page range, inferred anatomical category and caption/detection status. No-caption items remain accessible under All or Caption not found; a category filter requires a matching caption in that category.
3. Draw a question. A red rectangle identifies the detected printed number inside a suggested image crop. It does not identify the endpoint of a traced leader line. Detected answer text and candidate legends are masked before cropping.
4. Type a structure name and optionally explain the identification. Reveal and compare shows every possible original source-caption crop and restores the full source page. Multiple captions, missing captions, unresolved image type and conflicting number readings are explicit. Original captions remain Polish/Latin in both interface languages.
5. Rate recall 1–4 using the existing FSRS scheduler. Text matching does not automatically grade these proposals. The next question clears answer/reasoning. The question ID, filters, drafts, reveal/grade state, ratings and exclusions persist through the existing local study store and JSON export/import.
6. Exclude an unsuitable detection locally, or skip without grading. Restore exclusions using the range controls.

The dataset has 6,045 one-caption proposals, 2,051 with multiple captions and 1,832 without captions. There are 441 conflicting numeric detections and 2,587 with unresolved image support; these flags overlap caption categories. Some candidates are false detections from diagrams or text, including front matter. Counts are occurrences across figures, not unique anatomical structures.

Existing authored theory is offered only when a single source caption matches an authored catalogue entry and there is no conflicting numeric read. These notes are labelled as material from another view, with the original reference. No photographic recognition clue, model-side assertion or generated explanation is invented for an automatic candidate. Where no note exists, the app says so and shows the original source page for context.

## Public data boundary

`src/data/mcminn-auto.json` is a strict, versioned geometry-only asset: page and number, numeric anchor, proposed crop, image/conflict flags, caption/legend rectangles, inferred categories and references to existing authored notes. It contains **no OCR prose, raw Latin extraction, image thumbnails or private run report**. Its raw size is approximately 4.21 MB (about 349 kB gzip) and it is fetched only when the matching PDF is opened, alongside the existing mask index.

Generate it from a local run:

```bash
npm run atlas:public-index -- --report .research/automation/final/report.json
npm test
npm run build
```

Candidate IDs use `mcminn-auto-PAGE-OCRITEM-NUMBER` and form a separate review namespace. Retain these IDs when improving existing questions so ratings remain attached. Replacing the underlying OCR/order is a data migration and must not silently renumber published IDs.

Synthetic tests validate the complete public corpus, its counts and data boundary, filter combinations, anchor visibility inside the proposed crop, note eligibility, loading failures and exact session/rating/exclusion round trips. They do not establish anatomical correctness. Browser verification covers the actual PDF render, revealed source crops, clearing inputs and persistence.

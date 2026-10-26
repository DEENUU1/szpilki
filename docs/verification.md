# Interface and atlas-library update — 2026-10-27

- Polish is the first-visit default; an explicit saved English or Polish selection still wins.
- The navbar caption and female-model controls are removed. The viewer loads only the male whole-body manifest.
- Earlier female preferences migrate to the supported viewer. An unfinished female 3D session is closed with its original identity and reviews preserved; an active photo session remains active.
- The two Drive files were identified through connected metadata. Sharing permissions were explicitly left unchanged at the user's request.
- Browser checks: fresh-origin Polish UI; no female controls or navbar caption; Yokochi's embedded reader shows page 1 of 157. Drive reports that McMinn is too large to preview, so the app offers its open/download link and local-import workflow instead of a broken preview.
- `npm test`: 25 passing tests. Strict TypeScript and the production build pass. Added coverage for supported-model migration, retained history, language fallback, and the exact linked files.

# Whole-book update verification

The whole-book geometry index covers all 362 source pages, with 6,784 eligible numbered-caption questions on 317 pages. The 39 authored points remain a separate practice mode. See [content boundaries and reproduction](mcminn-index.md).

`npm test`: 21 passing tests. `npm run assets:verify`: all 24 anatomy assets match. `npm run build`: strict TypeScript and static production build pass without a chunk-size warning. `swiftc -typecheck scripts/mcminn-ocr.swift`: passes. Automated checks cover unique question identities, normalized source geometry, caption containment, exact scan identity, page-range isolation, session migration and round-tripping an unfinished whole-book question. Original captions are revealed from the local PDF and assessed manually; no OCR transcription is automatically marked correct.

Browser verification on the production build includes selecting a single-page range, drawing a mediastinum label, typing an answer, revealing the correct original caption and the source page, and inspecting the masked and revealed views. Also checked: full-size source dialog, Polish UI, refresh restoration of the typed answer and page range, explicit self-grading, and the resulting review in My learning.

## Initial release verification — 2026-10-26

The release was checked against the production Vite build, not only the development server.

- `npm test`: 14 passing tests. Coverage includes state migration and persistence, unfinished drafts and absolute timer deadlines, completed sessions, import deduplication, mistake selection, answer normalisation, language preference, both atlas manifests and all 39 photographic points.
- `npm run assets:verify`: all 24 anatomy files match their pinned SHA-256 values.
- `npm run build`: strict TypeScript checks and a successful static production build.
- Browser checks: imported the actual 110 MB McMinn scan, recognised it by content hash, filtered class 7, answered a musculocutaneous-nerve question, revealed recognition and course notes, restored an unfinished answer after reload, changed language and reloaded, and followed a median-nerve photo to the corresponding right-sided 3D structure.
- Layout checked at 1440, 768 and 390 pixels. The design inspector reports zero failures. The remaining small-text warning concerns the 11–12 px controls and source metadata around a dense anatomy workspace; primary reading text is larger. The responsive screenshots were inspected visually.

The app follows the Framed sheet direction, seed 1365409261: a pale frame, a white workspace and IBM Plex Sans. Anatomical geometry is the main visual; systems and selected structures carry colour. No direction redraw was required.

## Content boundaries

The 39-photo starter set covers selected class 2 and class 7 structures. It does not cover every item in the supplied eight-class syllabus. Coordinates were checked against the exact source scan and all model links are validated against the male manifest. Recognition and relationship notes cite the specimen and attachment plates. They still benefit from review by an anatomy instructor.

The female HRA model is a limited torso/pelvis dataset. The app does not relabel a male whole-body model as female. Polish anatomical nomenclature in 3D is a curated subset; source English and Latin remain available. The UI and all built-in photo explanations have English and Polish versions.

Textbook scans remain local user files. Public repository images show only openly licensed 3D models.

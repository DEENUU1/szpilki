# Contributing

Create a feature branch and open a pull request into `main`. Run `npm ci`, `npm test`, `npm run assets:verify` and `npm run build` before requesting a review. Main is protected; use squash merges after the required check passes.

## Add photographic material

The starter dataset is in `src/photo-data.ts`. Add annotations only after inspecting the actual source page:

- Identify the exact PDF by SHA-256. Different scans can have different page order and geometry.
- Use 1-based PDF page numbers and normalised full-page coordinates.
- Keep the pin inside its specimen crop. Exclude answer captions from the crop.
- Provide English, Polish and Latin names, bilingual recognition cues and theory, and an exact source reference.
- Give nerve course or branch relationships and bone attachments only when the source supports them.
- Link to a verified identifier in `public/anatomy/manifest.json`. A whole-bone link is not a separately verified 3D landmark.
- Expand the tests and visually check the cropped image and pin in the browser.

Never commit textbook PDFs, local learning exports, credentials or private files. Coordinate metadata is not permission to redistribute a book scan. Built-in data changes should be reviewed for anatomy, not just for passing TypeScript.

## Update anatomy models

Source assets are pinned to a fixed upstream commit in `scripts/anatomy-assets.mjs`. Keep `LICENSE`, `NOTICE`, source URLs and SHA-256 records with any update. Do not combine the female and male data into a single relicensed asset set. Run the node-mapping tests and inspect the rendered models after an update.

## Languages

Interface messages are mapped in `src/i18n.ts`; photo explanations are explicitly bilingual. Preserve source Latin terms. Do not invent Polish labels for structures without checking the terminology. English is the default and the language selector must keep its localStorage preference after a reload.

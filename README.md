# Szpilki

**Anatomy practical exam practice: identify the structure, then understand where it belongs.**

[Open the app](https://deenuu1.github.io/szpilki/) · [How it works](#atlas-photographs) · [Run locally](#development) · [Data and licences](#data-and-licences)

![Interactive anatomy atlas with selectable layers and structures](docs/images/atlas.jpg)

_Actual application screenshot. Anatomy geometry: Z-Anatomy / BodyParts3D (DBCLS), CC BY-SA 4.0. Adapted GLB assets and metadata: Anatria3D. See [full credits](public/anatomy/NOTICE)._

Szpilki is a browser-based study tool for anatomy “pins” exams. Explore real anatomical meshes in 3D, or practise on photographs from your own atlas: draw a pin, type its name, and reveal an explanation of the landmarks, attachments or nerve relationships that help identify it.

English is the default. Switch to Polish at any time; your choice is remembered on the device.

## Atlas photographs

1. Open **Atlas photographs** and add your own PDF.
2. Choose a class from the syllabus, a region and a system.
3. Draw a photograph and identify the pinned structure by typing a Polish, English or Latin name.
4. Reveal the answer, recognition cues and anatomical relationships.
5. Use **Show in 3D** to inspect the corresponding bone or nerve in spatial context.

The included McMinn starter deck contains **39 manually positioned pins**: 15 scapular landmarks, 10 humeral landmarks, 11 proximal femoral landmarks and 3 arm nerves. Each has bilingual recognition notes, attachment or nerve-course explanations, a source-page reference and a link to a real 3D structure. It covers selected material from classes 2 and 7, rather than the entire syllabus.

The deck is matched to an exact scan by SHA-256. Other editions, including a different McMinn scan, do not silently reuse its coordinates. You can add your own labelled points and bilingual explanations to other PDFs, including Yokochi. Those annotations join your practice pool and JSON export. Original textbook pages are **not distributed in this repository**.

For bony landmarks, the 3D link opens the corresponding bone; it does not claim that the landmark has its own labelled mesh. Recognition notes are original, source-referenced study summaries. They are not generated dynamically by an LLM.

## 3D atlas

- Rotate, pan and zoom real anatomical models; choose anterior, posterior or lateral views.
- Filter by region, including the below-the-neck exam scope.
- Show, hide and change the opacity of anatomical systems.
- Search source English and Latin nomenclature and the available Polish translations.
- Focus, isolate or hide an individual structure.
- Practise random surface pins, optional 30-second questions and mistake-focused review.
- Type an answer or reveal it and self-assess. Unrecognised synonyms can be accepted manually.

The male atlas contains **3,478 dataset elements**, including 335 skeletal, 1,110 muscular, 353 articular and 525 nervous-system entries. These are mesh elements, not a count of distinct named human organs: some are paired, partial or attachment components. Separate muscle-attachment meshes are excluded from the ordinary muscle view and quiz pool.

The female HRA dataset contains **264 elements** and mainly covers the torso and pelvis. It is a genuinely different dataset, without a complete female limb, muscle or nerve atlas. The app shows this coverage explicitly. Not every bony groove, tubercle or foramen is separately identified in the 3D data, and Polish 3D labels are currently a curated subset; source English and Latin names remain available.

<img src="docs/images/mobile.jpg" alt="The responsive anatomy atlas on a mobile screen" width="300">

_Mobile view of the same application. Anatomy: Z-Anatomy / BodyParts3D (DBCLS), CC BY-SA 4.0; Anatria3D conversion. No textbook scans are included in these repository screenshots._

## Progress and sessions

**My learning** keeps answer history, mistakes and sessions on the device. An unfinished question, its typed draft, revealed state and timer deadline survive a refresh. Completed sessions remain in history. Export and import JSON to move learning records and custom photo annotations between browsers.

| Data                                             | Storage                                |
| ------------------------------------------------ | -------------------------------------- |
| Language selection                               | `localStorage`: `szpilki-language`     |
| Answers, sessions, atlas settings, custom points | `localStorage`: `szpilki-study-v2`     |
| Last selected PDF                                | `localStorage`: `szpilki-atlas-choice` |
| PDF files                                        | IndexedDB: `szpilki-atlas-files`       |

PDFs are too large for `localStorage`; their bytes stay in IndexedDB. Nothing is uploaded. JSON exports contain learning data and references, not the PDF files. Browser data is scoped to the origin: localhost and the public GitHub Pages site have separate records. Clearing browser data removes the local copy.

## Development

Requires Node.js 22.12 or newer in the Node 22 series, or a supported newer version.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Production build and preview:

```bash
npm run build
npm run preview
```

Checks:

```bash
npm test
npm run assets:verify
npm run build
```

The test suite covers session persistence and migration, answer handling, review selection, import merging, language preferences, model-node consistency and every starter photo point's bounds and 3D link. The asset verifier checks SHA-256 hashes for all vendored anatomy files.

The app uses TypeScript, Three.js, PDF.js, Zod and Vite. It needs no backend, login, AI provider key or paid service. The build is a static `dist/` directory with relative asset paths, suitable for a GitHub Pages project site.

## Deployment

[GitHub Actions](.github/workflows/ci.yml) runs asset verification, tests and the type-checked production build on pull requests. A successful `main` build deploys to GitHub Pages. Repository Pages settings must use **GitHub Actions** as the source.

`main` is intended to require a pull request and the `Verify` status check, with force pushes and deletion disabled. See [contributing](CONTRIBUTING.md) for the development workflow.

## Data and licences

Application code: [MIT](LICENSE). Anatomical assets keep their own licences:

| Dataset                                           | Coverage                                         | Licence                                                      |
| ------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Z-Anatomy, derived from BodyParts3D / DBCLS       | Male atlas                                       | CC BY-SA 4.0; upstream BodyParts3D attribution also retained |
| Human Reference Atlas / NIH, Visible Human Female | Female torso and pelvis                          | CC BY 4.0                                                    |
| Anatria3D conversions                             | GLB compression, identifiers and source metadata | Respective upstream licences                                 |

See [asset licences](public/anatomy/LICENSE), [complete attribution and modifications](public/anatomy/NOTICE), and [pinned source URLs and checksums](public/anatomy/provenance.json). Model screenshots are derivatives of their credited datasets. Typeface: IBM Plex, SIL Open Font License. Icons: Lucide, ISC licence. Draco decoder: Google Draco, Apache 2.0; see [decoder credits](public/draco/README.md).

Assets are vendored so the running application does not depend on another anatomy viewer's availability. To reproduce the pinned download:

```bash
npm run assets:fetch
npm run assets:verify
```

This is a study aid, not an exhaustive or professionally validated medical reference. Confirm the terminology and specimen interpretation expected by your anatomy instructor.

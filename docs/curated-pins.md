# Curated photograph pins

The authored deck now contains **119 questions for 104 distinct Latin names**, including 80 new questions on 11 additional source pages. Repeated structures in different views are counted as separate questions, not as newly discovered anatomical structures. The previous 39 IDs remain unchanged so existing FSRS history continues to apply.

| System    | Questions | Material                                                                                               |
| --------- | --------: | ------------------------------------------------------------------------------------------------------ |
| Skeletal  |        36 | Scapular, humeral and proximal femoral landmarks from the original deck                                |
| Muscular  |        41 | Back/axillary muscles, triceps, elbow muscles, short hip rotators, thigh/calf and anterior leg muscles |
| Nervous   |        30 | Brachial-plexus branches, radial branches, lumbar/sacral branches and popliteal/leg nerves             |
| Articular |        12 | Annular and radial collateral ligaments, knee cruciates, collateral ligaments and menisci              |

Selected material from classes 2–8 has authored questions. This does **not** claim complete coverage of these classes or the whole book. Class 1, much of the hand and foot, other joints and further muscle/nerve views still need individual content work. The 6,784 numbered-caption questions remain a separate mode without authored explanations for every item. Prepared pins are the initial mode; existing unfinished book sessions retain their mode when resumed.

## Source mapping

Coordinates use a 1274 × 1800 rendering of the exact supplied McMinn scan. In code they are normalised to page dimensions. Crop bounds isolate a photograph; masks remove the adjacent legend or explanatory diagram where necessary. Original printed number labels remain visible, but their answer legends are outside the practice view. Opening the source page restores the full page.

| PDF page | Printed page | Figures used                                           | New questions |
| -------- | -----------: | ------------------------------------------------------ | ------------: |
| 142      |          139 | Posterior right scapular region                        |             6 |
| 147      |          144 | A, B: right axillary walls                             |             3 |
| 149      |          146 | Right brachial plexus, vessels removed                 |            11 |
| 151      |          148 | A, B: posterior right arm                              |             8 |
| 156      |          153 | C: left cubital fossa                                  |             7 |
| 159      |          156 | A, C: left elbow / posterior forearm                   |             4 |
| 318      |          317 | C: right gluteal dissection                            |            12 |
| 322      |          320 | A, B: anterior right thigh                             |             5 |
| 331      |          330 | A: right popliteal fossa                               |             8 |
| 333      |          332 | A, C: left knee from front and back; legend on PDF 334 |            10 |
| 338      |          337 | A: left anterior/lateral leg                           |             6 |

For single photographs without a printed figure letter, `A` is an internal identifier. No textbook scans, OCR files or specimen screenshots are distributed with the application. The browser renders the user's local PDF.

## Teaching and verification

Each question has a view-specific recognition note and an original bilingual explanation. Nerve explanations describe parentage, course, important branches or territory; muscle explanations include attachments, action and innervation; ligament explanations describe attachments and relationships. A separate typed reasoning field lets the learner compare their reasoning with those notes, without claiming automated clinical or anatomical assessment.

Specimen details matter: PDF 318 shows an early sciatic division, so the two large cords are labelled tibial and common fibular nerves. The proximal deep radial branch entering supinator is distinguished from the posterior interosseous continuation after the muscle. The gluteal obturator-internus pin explicitly identifies a tendon. Its 3D link opens the whole muscle; similarly, selected component links are stated in the explanation.

Positions were visually checked against the source photographs and their printed legends, including magnified checks of fine nerve branches. These are author checks, not independent validation by an anatomy instructor. The supplied atlas photographs/legends are the primary reference; the explanations are concise study notes, not a replacement textbook.

Automated checks validate all 119 records, unique stable IDs, bilingual text, point/crop bounds, mask bounds and pin visibility outside masks. Every 3D identifier exists in the manifest, belongs to the question's system and matches the photographed side for the added plates. Moving from a muscle or ligament photo now enables its own 3D system and shows a translucent skeleton for context.

Release checks: 34 tests pass, the strict TypeScript/production build passes and all 24 vendored anatomy checksums match. Browser checks used the actual local McMinn PDF: class 6 showed 18 muscle questions, a tibialis-anterior photograph revealed Polish recognition/attachment/innervation notes and opened the left tibialis anterior in the muscle layer; class 3 showed 12 questions and revealed English lateral-meniscus notes with the correct source-page reference. No rating was submitted during these checks.

# Curated photograph pins

The authored deck now contains **174 questions for 153 distinct Latin names**, including 135 added questions on 17 additional source pages. Repeated structures in different views are counted as separate questions, not as newly discovered anatomical structures. All previously released IDs remain unchanged so existing FSRS history continues to apply.

| System    | Questions | Material                                                                          |
| --------- | --------: | --------------------------------------------------------------------------------- |
| Skeletal  |        36 | Scapular, humeral and proximal femoral landmarks                                  |
| Muscular  |        80 | Back/limb muscles, hand/foot muscles, tendons, retinacula and plantar aponeurosis |
| Nervous   |        39 | Plexus branches, arm/leg nerves, palmar and plantar branches                      |
| Articular |        19 | Elbow and knee ligaments/menisci, ankle and plantar ligaments                     |

Selected material from classes 2–8 has authored questions. This does **not** claim complete coverage of these classes or the whole book. Class 1, remaining hand and foot regions, other joints and further muscle/nerve views still need individual content work. The 6,784 numbered-caption questions remain a separate mode without authored explanations for every item. Prepared pins are the initial mode; existing unfinished book sessions retain their mode when resumed.

## Source mapping

Coordinates use a 1274 × 1800 rendering of the exact supplied McMinn scan. In code they are normalised to page dimensions. Crop bounds isolate a photograph; masks remove the adjacent legend or explanatory diagram where necessary. Original printed number labels remain visible, but their answer legends are outside the practice view. Opening the source page restores the full page.

| PDF page | Printed page | Figures used                                                     | New questions |
| -------- | -----------: | ---------------------------------------------------------------- | ------------: |
| 142      |          139 | Posterior right scapular region                                  |             6 |
| 147      |          144 | A, B: right axillary walls                                       |             3 |
| 149      |          146 | Right brachial plexus, vessels removed                           |            11 |
| 151      |          148 | A, B: posterior right arm                                        |             8 |
| 156      |          153 | C: left cubital fossa                                            |             7 |
| 159      |          156 | A, C: left elbow / posterior forearm                             |             4 |
| 318      |          317 | C: right gluteal dissection                                      |            12 |
| 322      |          320 | A, B: anterior right thigh                                       |             5 |
| 331      |          330 | A: right popliteal fossa                                         |             8 |
| 333      |          332 | A, C: left knee from front and back; legend on PDF 334           |            10 |
| 338      |          337 | A: left anterior/lateral leg                                     |             6 |
| 165      |          162 | A: left palm and distal forearm                                  |            15 |
| 169      |          166 | A, B: superficial/deep right palm                                |             7 |
| 171      |          168 | A: dorsal left hand and wrist                                    |            11 |
| 346      |          345 | C: lateral right ankle and foot                                  |             7 |
| 347      |          346 | B: medial right ankle and plantar branches                       |             8 |
| 350      |          349 | C, D, E: medial, lateral and posterior left ankle/foot ligaments |             7 |

For single photographs without a printed figure letter, `A` is an internal identifier. No textbook scans, OCR files or specimen screenshots are distributed with the application. The browser renders the user's local PDF.

## Teaching and verification

Each question has a view-specific recognition note and an original bilingual explanation. Nerve explanations describe parentage, course, important branches or territory; muscle explanations include attachments, action and innervation; ligament explanations describe attachments and relationships. A separate typed reasoning field lets the learner compare their reasoning with those notes, without claiming automated clinical or anatomical assessment.

Specimen details matter: PDF 318 shows an early sciatic division, so the two large cords are labelled tibial and common fibular nerves. The proximal deep radial branch entering supinator is distinguished from the posterior interosseous continuation after the muscle. The gluteal obturator-internus pin explicitly identifies a tendon. Its 3D link opens the whole muscle; similarly, selected component links are stated in the explanation.

Positions were visually checked against the source photographs and their printed legends, including magnified checks of fine nerve branches. These are author checks, not independent validation by an anatomy instructor. The supplied atlas photographs/legends are the primary reference; the explanations are concise study notes, not a replacement textbook.

Automated checks validate all 174 records, unique stable IDs, bilingual text, point/crop bounds, mask bounds and pin visibility outside masks. Every 3D identifier exists in the manifest, belongs to the question's system and matches the photographed side for the added plates. Moving from a muscle or ligament photo now enables its own 3D system and shows a translucent skeleton for context.

First expansion checks (119 questions): 34 tests passed, the strict TypeScript/production build passes and all 24 vendored anatomy checksums match. Browser checks used the actual local McMinn PDF: class 6 showed 18 muscle questions, a tibialis-anterior photograph revealed Polish recognition/attachment/innervation notes and opened the left tibialis anterior in the muscle layer; class 3 showed 12 questions and revealed English lateral-meniscus notes with the correct source-page reference. No rating was submitted during these checks.

## Distal limb expansion

The second batch adds 55 questions (49 additional distinct Latin names) on six source pages. Tendon questions are explicitly named as tendons; when only the parent muscle is available in 3D, the explanation states this. The same applies to the median parent nerve for its recurrent branch, the grouped lumbricals/interossei and selected muscle heads. Retinacula follow the model atlas's muscular/fascial system, so photo filters and 3D layers agree; the seven new ankle/foot ligament questions are articular.

The palm questions distinguish the median carpal-tunnel route from the superficial ulnar/Guyon route, and follow the deep ulnar branch to intrinsic muscles. Dorsal wrist notes cover the six extensor compartments. Ankle questions trace tibial-to-plantar branching and the order of the long flexor tendons; ligament views use the malleoli and talus/calcaneus/navicular as landmarks.

Additional topographic references: [hand lumbricals](https://www.ncbi.nlm.nih.gov/books/NBK534876/), [BOFAS tarsal tunnel anatomy](https://www.bofas.org.uk/hyperbook/mid-hindfoot/tarsal-tunnel-syndrome). The exact source scan and its own legends remain the primary coordinate reference. As with the first batch, these notes have not received independent instructor review.

Second expansion checks: 35 tests pass, including bilingual content, crop/mask bounds, all 174 model identifiers and photographed sides, and explicit parent/group links for tendon and small-branch questions. The strict production build and all 24 asset hashes pass. Browser verification with the local PDF showed the 45-question upper-limb muscle pool, Polish opponens-pollicis notes and the right-sided 3D muscle; the 17-question lower-limb joint pool showed English long-plantar-ligament notes and selected the left-sided ligament in 3D. No rating was submitted during these content checks. Specimen images and screenshots remain local.

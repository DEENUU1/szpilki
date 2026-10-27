# Study feedback — implementation criteria

Problem: typed answers can be graded too early, photograph drafts leak into the next question, and reviews do not have a due date or confidence rating.

Acceptance criteria:
- New photo questions start with empty answer and reasoning fields; refreshing the same question restores both drafts.
- Typing/checking reveals feedback without adding a failed review. A learner explicitly chooses one of four FSRS ratings.
- FSRS review state and dates survive local save/load and JSON merge, with due cards selected before new cards and future reviews held back.
- Ratings show their actual next intervals. A no-due state never masquerades as an empty scope and supports optional early practice without silently rescheduling cards.
- A reasoning field lets the learner explain recognition before comparing it with available source notes; no automated anatomical judgement is claimed.
- Whole-book filtering distinguishes automatic source-caption categories from the authored deck. Missing authored explanations remain explicit.

Blast radius: study storage/scheduling, photo and 3D practice UI, whole-book metadata/filtering, regression tests and README. No backend, account, or external AI service.

Implementation: ts-fsrs 5.4.2, 90% retention, learning steps 10m/1h, relearning 10m, deterministic interval previews. Schema v3 stores numeric FSRS dates, retains v2 source data and merges schedules by latest review timestamp.

Content boundary: category heuristics were added to all indexed captions. The 39-pin authored deck was not falsely relabelled as a fully authored 6,784-pin bank; image-specific annotation and theory expansion remain separate content work.

Verification: regression tests cover draft ownership, typed-name feedback, schedule timing and queue priority, persistence, import merging and category prefixes. Browser checks verify zero reviews after typo feedback, explicit four-button ratings, empty fields on the next photo, and restoration of the same card's answer and reasoning after reload.

Automated verification: 33 tests pass; the strict production build passes; all 24 vendored anatomy checksums match. The expanded metadata contains 733 skeletal, 284 articular, 1,327 muscular and 619 nervous labels; 3,821 remain other/unclassified. These are occurrences, not unique structures.

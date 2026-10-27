import { z } from "zod";
import { bookCategories } from "./book-category";
import { scheduleReview, scheduledCardSchema } from "./repetition";
import type { StudyRating } from "./repetition";
import { photoPinSchema } from "./photo-data";
import { regions, reviewsSchema, systems } from "./domain";
import type { Review } from "./domain";

export const preferencesSchema = z.object({
  sex: z.enum(["male", "female"]),
  region: z.enum(regions),
  layers: z.array(
    z.object({
      system: z.enum(systems),
      visible: z.boolean(),
      opacity: z.number().min(0.05).max(1),
    }),
  ),
  depth: z.enum(["all", "deep", "superficial"]),
  quizSystems: z.array(z.enum(systems)),
  timed: z.boolean(),
  onlyMistakes: z.boolean(),
  earlyReview: z.boolean().default(false),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const sessionSchema = z.object({
  id: z.string(),
  source: z.enum(["3d", "photo"]).default("3d"),
  atlasId: z.string().nullable().default(null),
  photoFilters: z
    .object({
      region: z.enum(regions),
      system: z.enum([...systems, "all"]),
      exercise: z.number().int().min(0).max(8),
      onlyMistakes: z.boolean(),
      earlyReview: z.boolean().default(false),
      mode: z.enum(["pins", "book"]).default("pins"),
      bookCategory: z.enum([...bookCategories, "all"]).default("all"),
      firstPage: z.number().int().min(1).max(362).default(1),
      lastPage: z.number().int().min(1).max(362).default(362),
    })
    .nullable()
    .default(null),
  startedAt: z.number(),
  updatedAt: z.number(),
  endedAt: z.number().nullable(),
  settings: preferencesSchema,
  questionId: z.string().nullable(),
  questionCount: z.number().int().nonnegative(),
  draft: z.string(),
  reasoning: z.string().max(4000).default(""),
  revealed: z.boolean(),
  graded: z.boolean(),
  deadline: z.number().nullable(),
});
export type StudySession = z.infer<typeof sessionSchema>;
export const studySchema = z.object({
  version: z.literal(3),
  reviews: reviewsSchema,
  schedules: z.record(z.string(), scheduledCardSchema).default({}),
  sessions: z.array(sessionSchema),
  activeSessionId: z.string().nullable(),
  preferences: preferencesSchema,
  photoPins: z.array(photoPinSchema).default([]),
  excludedBookQuestions: z.array(z.string()).default([]),
});
export type StudyData = z.infer<typeof studySchema>;
export function emptyStudy(): StudyData {
  return {
    version: 3,
    schedules: {},
    photoPins: [],
    excludedBookQuestions: [],
    reviews: [],
    sessions: [],
    activeSessionId: null,
    preferences: {
      sex: "male",
      region: "exam",
      layers: [],
      depth: "all",
      quizSystems: ["skeletal", "muscular", "articular", "nervous"],
      timed: false,
      onlyMistakes: false,
      earlyReview: false,
    },
  };
}
export function parseStudy(raw: unknown): StudyData {
  const current = studySchema.safeParse(raw);
  if (current.success) return prepareSupportedModel(current.data);
  const previous = studySchema.extend({ version: z.literal(2) }).safeParse(raw);
  if (previous.success)
    return prepareSupportedModel({ ...previous.data, version: 3 });
  const legacy = z
    .object({ version: z.literal(1), reviews: reviewsSchema })
    .parse(raw);
  return { ...emptyStudy(), reviews: legacy.reviews };
}
export function prepareSupportedModel(
  data: StudyData,
  now = Date.now(),
): StudyData {
  if (data.preferences.sex === "female") {
    data.preferences = {
      ...data.preferences,
      sex: "male",
      layers: [],
      quizSystems: ["skeletal", "muscular", "articular", "nervous"],
    };
  }
  const session = activeSession(data);
  if (session?.source === "3d" && session.settings.sex === "female") {
    session.endedAt = now;
    session.updatedAt = now;
    data.activeSessionId = null;
  }
  return data;
}
export function readStudy(): StudyData {
  const raw =
    localStorage.getItem("szpilki-study-v3") ??
    localStorage.getItem("szpilki-study-v2") ??
    localStorage.getItem("szpilki-study-v1");
  if (!raw) return emptyStudy();
  const value: unknown = JSON.parse(raw);
  return parseStudy(value);
}
export function saveStudy(data: StudyData): void {
  localStorage.setItem("szpilki-study-v3", JSON.stringify(data));
}
export function activeSession(data: StudyData): StudySession | undefined {
  return data.sessions.find(
    (s) => s.id === data.activeSessionId && s.endedAt === null,
  );
}
export function startSession(
  data: StudyData,
  settings: Preferences,
  now = Date.now(),
  id: string = crypto.randomUUID(),
): StudySession {
  const previous = activeSession(data);
  if (previous) return previous;
  const session: StudySession = {
    id,
    source: "3d",
    atlasId: null,
    photoFilters: null,
    startedAt: now,
    updatedAt: now,
    endedAt: null,
    settings,
    questionId: null,
    questionCount: 0,
    draft: "",
    reasoning: "",
    revealed: false,
    graded: false,
    deadline: null,
  };
  data.sessions.push(session);
  data.activeSessionId = id;
  return session;
}
export function endSession(data: StudyData, now = Date.now()): void {
  const session = activeSession(data);
  if (session) {
    session.endedAt = now;
    session.updatedAt = now;
    session.deadline = null;
  }
  data.activeSessionId = null;
}
export function recordRatedReview(
  data: StudyData,
  id: string,
  rating: StudyRating,
  sessionId: string,
  reasoning = "",
  now = Date.now(),
): Review {
  const card = scheduleReview(data.schedules[id], rating, now);
  const review: Review = {
    id,
    rating,
    correct: rating > 1,
    at: now,
    dueAt: card.due,
    sessionId,
    reasoning,
  };
  const schedules = { ...data.schedules, [id]: card };
  saveStudy({ ...data, schedules, reviews: [...data.reviews, review] });
  data.schedules = schedules;
  data.reviews.push(review);
  return review;
}
export function exportStudy(data: StudyData): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "szpilki-postepy-i-sesje.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function mergeStudy(current: StudyData, incoming: StudyData): StudyData {
  const reviews = new Map(
    current.reviews.map((r) => [`${r.sessionId ?? ""}:${r.id}:${r.at}`, r]),
  );
  for (const r of incoming.reviews)
    reviews.set(`${r.sessionId ?? ""}:${r.id}:${r.at}`, r);
  const sessions = new Map(current.sessions.map((s) => [s.id, s]));
  for (const s of incoming.sessions) {
    const existing = sessions.get(s.id);
    if (s.id === current.activeSessionId && existing?.endedAt === null)
      continue;
    if (!existing || s.updatedAt > existing.updatedAt) sessions.set(s.id, s);
  }
  const schedules = { ...current.schedules };
  for (const [id, card] of Object.entries(incoming.schedules)) {
    const existing = schedules[id];
    if (!existing || (card.last_review ?? 0) >= (existing.last_review ?? 0))
      schedules[id] = card;
  }
  return {
    ...current,
    schedules,
    excludedBookQuestions: [
      ...new Set([
        ...current.excludedBookQuestions,
        ...incoming.excludedBookQuestions,
      ]),
    ],
    photoPins: [
      ...new Map(
        [...current.photoPins, ...incoming.photoPins].map((pin) => [
          pin.id,
          pin,
        ]),
      ).values(),
    ],
    reviews: [...reviews.values()].sort((a, b) => a.at - b.at),
    sessions: [...sessions.values()].sort((a, b) => a.startedAt - b.startedAt),
  };
}

import { z } from "zod";
import { ratingSchema } from "./repetition";

export const systems = [
  "skeletal",
  "muscular",
  "articular",
  "nervous",
  "cardiovascular",
  "respiratory",
  "digestive",
  "renal",
  "reproductive",
  "lymphatic",
  "endocrine",
  "regional",
  "integumentary",
] as const;
export type System = (typeof systems)[number];
export type Sex = "male" | "female";
export const systemNames: Record<System, string> = {
  skeletal: "Kości",
  muscular: "Mięśnie",
  articular: "Stawy i więzadła",
  nervous: "Nerwy",
  cardiovascular: "Naczynia",
  respiratory: "Układ oddechowy",
  digestive: "Układ pokarmowy",
  renal: "Układ moczowy",
  reproductive: "Układ rozrodczy",
  lymphatic: "Układ chłonny",
  endocrine: "Gruczoły",
  regional: "Okolice ciała",
  integumentary: "Powłoki",
};
export const systemColors: Record<System, string> = {
  skeletal: "#e7d8ba",
  muscular: "#ab5c50",
  articular: "#98b3b7",
  nervous: "#d4b448",
  cardiovascular: "#a94343",
  respiratory: "#c29096",
  digestive: "#bb9277",
  renal: "#a96e65",
  reproductive: "#b0828d",
  lymphatic: "#88a885",
  endocrine: "#bd9476",
  regional: "#d8bda7",
  integumentary: "#d8bda7",
};
export const organSchema = z.object({
  organ_id: z.string(),
  ta2_latin: z.string(),
  name_en: z.string(),
  system: z.enum(systems),
  mesh_file: z.string().regex(/^[a-z]+_(male|female)\.glb$/),
  node: z.string(),
  path: z.array(z.string()),
});
export const manifestSchema = z.object({
  gender_model: z.enum(["male", "female"]),
  credit: z.string(),
  license: z.string(),
  organs: z.array(organSchema),
});
export type Organ = z.infer<typeof organSchema>;
export type Manifest = z.infer<typeof manifestSchema>;
export const regions = [
  "all",
  "exam",
  "upper",
  "lower",
  "trunk",
  "head",
] as const;
export type Region = (typeof regions)[number];
export const regionNames: Record<Region, string> = {
  all: "Całe ciało",
  exam: "Kolokwium · od szyi w dół",
  upper: "Kończyna górna",
  lower: "Kończyna dolna",
  trunk: "Tułów i miednica",
  head: "Głowa i szyja",
};
export function organRegion(
  organ: Organ,
  centerY: number,
): Exclude<Region, "all" | "exam"> {
  const path = organ.path.join(" ").toLowerCase();
  if (/upper limb|pectoral girdle|brachial plexus/.test(path)) return "upper";
  if (/lower limb|pelvic girdle|lumbar plexus|sacral plexus/.test(path))
    return "lower";
  if (
    /head|cranial|brain|cerebr|ear|eye|neck|cervical/.test(path) ||
    centerY > 1.46
  )
    return "head";
  return "trunk";
}
export function inRegion(
  organ: Organ,
  region: Region,
  centerY: number,
): boolean {
  if (region === "all") return true;
  if (region === "exam") return organRegion(organ, centerY) !== "head";
  return organRegion(organ, centerY) === region;
}
export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/\b(musculus|muscle|m\.|nervus|nerve|n\.)\s*/g, "")
    .replace(/[^a-z0-9]/g, "");
}
export function answerMatches(
  answer: string,
  accepted: readonly string[],
): boolean {
  const value = normalizeAnswer(answer);
  return (
    value.length > 1 && accepted.some((item) => normalizeAnswer(item) === value)
  );
}
export function answerFeedback(
  answer: string,
  accepted: readonly string[],
): "exact" | "typo" | "different" {
  if (answerMatches(answer, accepted)) return "exact";
  const value = normalizeAnswer(answer);
  if (value.length < 5 || /[0-9]/.test(value)) return "different";
  for (const candidate of accepted.map(normalizeAnswer)) {
    if (
      /[0-9]/.test(candidate) ||
      Math.abs(candidate.length - value.length) > 1
    )
      continue;
    // Suggest a single insertion, deletion, substitution or adjacent transposition; never auto-accept it.
    let left = 0;
    while (left < value.length && value[left] === candidate[left]) left++;
    if (
      value.length === candidate.length &&
      (value.slice(left + 1) === candidate.slice(left + 1) ||
        (value[left] === candidate[left + 1] &&
          value[left + 1] === candidate[left] &&
          value.slice(left + 2) === candidate.slice(left + 2)))
    )
      return "typo";
    if (
      value.length + 1 === candidate.length &&
      value.slice(left) === candidate.slice(left + 1)
    )
      return "typo";
    if (
      candidate.length + 1 === value.length &&
      value.slice(left + 1) === candidate.slice(left)
    )
      return "typo";
  }
  return "different";
}
export function shuffled<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}
export const reviewsSchema = z.array(
  z.object({
    id: z.string(),
    correct: z.boolean(),
    at: z.number(),
    sessionId: z.string().optional(),
    rating: ratingSchema.optional(),
    dueAt: z.number().int().nonnegative().optional(),
    reasoning: z.string().max(4000).optional(),
  }),
);
export type Review = z.infer<typeof reviewsSchema>[number];
export function nextQuestion<T extends { id: string }>(
  pool: readonly T[],
  previous: string | null,
  reviews: readonly Review[],
  onlyMistakes: boolean,
  random: () => number = Math.random,
): T | undefined {
  const latest = new Map<string, boolean>();
  for (const r of reviews) latest.set(r.id, r.correct);
  const eligible = pool.filter(
    (item) => !onlyMistakes || latest.get(item.id) === false,
  );
  const candidates =
    eligible.length > 1
      ? eligible.filter((item) => item.id !== previous)
      : eligible;
  // Failed structures get two additional tickets, while every eligible structure remains possible.
  const weighted = candidates.flatMap((item) =>
    latest.get(item.id) === false ? [item, item, item] : [item],
  );
  return weighted[
    Math.min(weighted.length - 1, Math.floor(random() * weighted.length))
  ];
}
export function latestMistakes(reviews: readonly Review[]): string[] {
  const latest = new Map<string, boolean>();
  for (const r of reviews) latest.set(r.id, r.correct);
  return [...latest].filter(([, correct]) => !correct).map(([id]) => id);
}
export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c,
  );
}

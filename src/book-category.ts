export const bookCategories = [
  "skeletal",
  "articular",
  "muscular",
  "nervous",
  "other",
] as const;
export type BookCategory = (typeof bookCategories)[number];
// A layout-index aid, not anatomical validation. Ambiguous captions remain unclassified.
export function captionCategory(text: string): BookCategory {
  const value = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .toLowerCase()
    .replace(/^\s*\d+\s*/, "");
  const name = value.split("(")[0] ?? value;
  if (
    /^(n\.|nerw|splot|zwoj)\b/.test(name) ||
    /\((n\.|nn\.|nervus |nervi |plexus |ganglion )/.test(value) ||
    /nerwu|nerwow/.test(name)
  )
    return "nervous";
  if (
    /^(m\.|mm\.|miesien |miesnie |sciegno |rozciegno |powiez )/.test(name) ||
    /\((m\.|mm\.|musculus |musculi |tendo |aponeurosis |fascia )/.test(value)
  )
    return "muscular";
  if (
    /^(w\.|wiezadl|staw |stawy |lakotk)/.test(name) ||
    /\((lig\.|ligg\.|art\.|articulatio |meniscus )/.test(value)
  )
    return "articular";
  if (
    /(kosc|kosci|kostny|kostna|kreg|zebr|mostek|lopatk)/.test(name) ||
    /\((os |ossa |vertebra|costa |scapula|humerus|femur|tibia|fibula|talus|calcaneus)/.test(
      value,
    )
  )
    return "skeletal";
  return "other";
}

import { readFileSync, readdirSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { manifestSchema } from "../src/domain";
import { photoPinSchema, starterPins } from "../src/photo-data";
const readManifest = (female = false) =>
  manifestSchema.parse(
    JSON.parse(
      readFileSync(
        new URL(
          `../public/anatomy/${female ? "manifest_female" : "manifest"}.json`,
          import.meta.url,
        ),
        "utf8",
      ),
    ),
  );
describe("atlas integrity", () => {
  for (const female of [false, true])
    it(`maps every declared ${female ? "female" : "male"} structure to an existing GLB node`, () => {
      const manifest = readManifest(female);
      const ids = manifest.organs.map((o) => o.organ_id);
      expect(new Set(ids).size).toBe(ids.length);
      const modelNames = new Map<string, Set<string>>();
      for (const organ of manifest.organs) {
        let nodes = modelNames.get(organ.mesh_file);
        if (!nodes) {
          const bytes = readFileSync(
            new URL(`../public/anatomy/${organ.mesh_file}`, import.meta.url),
          );
          expect(bytes.toString("utf8", 0, 4)).toBe("glTF");
          const raw: unknown = JSON.parse(
            bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
          );
          const parsed = glbNames(raw);
          nodes = new Set(parsed);
          modelNames.set(organ.mesh_file, nodes);
        }
        expect(nodes.has(organ.node), `${organ.mesh_file}:${organ.node}`).toBe(
          true,
        );
      }
    });
  it("has bilingual source-backed photo pins on the specimen, with real model links", () => {
    const models = new Map(readManifest().organs.map((o) => [o.organ_id, o]));
    const ids = new Set(models.keys());
    expect(starterPins).toHaveLength(119);
    expect(new Set(starterPins.map((p) => p.id)).size).toBe(starterPins.length);
    for (const value of starterPins) {
      const pin = photoPinSchema.parse(value);
      expect(pin.x).toBeGreaterThanOrEqual(pin.crop.x);
      expect(pin.x).toBeLessThanOrEqual(pin.crop.x + pin.crop.w);
      expect(pin.y).toBeGreaterThanOrEqual(pin.crop.y);
      expect(pin.y).toBeLessThanOrEqual(pin.crop.y + pin.crop.h);
      expect(pin.recognize.en.length).toBeGreaterThan(20);
      expect(pin.theory.pl.length).toBeGreaterThan(20);
      expect(pin.source).toContain("McMinn");
      expect(pin.crop.x + pin.crop.w).toBeLessThanOrEqual(1);
      expect(pin.crop.y + pin.crop.h).toBeLessThanOrEqual(1);
      for (const mask of pin.masks ?? []) {
        expect(mask.x + mask.w).toBeLessThanOrEqual(1);
        expect(mask.y + mask.h).toBeLessThanOrEqual(1);
        expect(
          pin.x >= mask.x &&
            pin.x <= mask.x + mask.w &&
            pin.y >= mask.y &&
            pin.y <= mask.y + mask.h,
          `${pin.id} masked pin`,
        ).toBe(false);
      }
      if (pin.modelId) {
        const model = models.get(pin.modelId);
        expect(model?.system, pin.id).toBe(pin.system);
      }
      if (pin.modelId) expect(ids.has(pin.modelId), pin.modelId).toBe(true);
    }
  });
  it("covers authored muscles, nerves and joints without replacing existing review IDs", () => {
    expect(new Set(starterPins.map((p) => p.latin)).size).toBe(104);
    for (const exercise of [2, 3, 4, 5, 6, 7, 8]) {
      expect(
        starterPins.some((p) => p.exercise === exercise),
        `class ${exercise}`,
      ).toBe(true);
    }
    const counts = Object.fromEntries(
      ["skeletal", "muscular", "nervous", "articular"].map((system) => [
        system,
        starterPins.filter((p) => p.system === system).length,
      ]),
    );
    expect(counts).toEqual({
      skeletal: 36,
      muscular: 41,
      nervous: 30,
      articular: 12,
    });
    // Preserve keys used by saved schedules before this expansion.
    const originalPages = [
      [121, 15],
      [125, 10],
      [295, 11],
      [150, 3],
    ] as const;
    expect(starterPins.slice(0, 39).map((p) => p.id)).toEqual(
      originalPages.flatMap(([page, count]) =>
        Array.from({ length: count }, (_, index) => `mcminn-${page}-${index}`),
      ),
    );
    for (const pin of starterPins.slice(39)) {
      expect(pin.source).toContain(`PDF ${pin.page}`);
      const side = [156, 159, 333, 338].includes(pin.page) ? "_l" : "_r";
      expect(pin.modelId?.endsWith(side), pin.id).toBe(true);
    }
    const highDivision = starterPins.find((p) => p.id === "mcminn-318-C-14");
    expect(highDivision?.latin).toBe("Nervus tibialis");
    expect(highDivision?.theory.en).toContain("early division");
    expect(
      starterPins.find((p) => p.id === "mcminn-333-C-11")?.source,
    ).toContain("legend: PDF 334");
  });
  it("does not distribute the private textbooks in public assets", () => {
    expect(
      readdirSync(new URL("../public/", import.meta.url)).some((name) =>
        name.toLowerCase().endsWith(".pdf"),
      ),
    ).toBe(false);
  });
});
function glbNames(raw: unknown): string[] {
  if (
    typeof raw !== "object" ||
    raw === null ||
    !("nodes" in raw) ||
    !Array.isArray(raw.nodes)
  )
    throw new Error("Invalid GLB nodes");
  return raw.nodes.map((node: unknown) => {
    if (
      typeof node !== "object" ||
      node === null ||
      !("name" in node) ||
      typeof node.name !== "string"
    )
      throw new Error("Unnamed GLB node");
    return node.name;
  });
}

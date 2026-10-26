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
    const ids = new Set(readManifest().organs.map((o) => o.organ_id));
    expect(starterPins).toHaveLength(39);
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
      if (pin.modelId) expect(ids.has(pin.modelId), pin.modelId).toBe(true);
    }
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

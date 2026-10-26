import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const commit = "108f5c5ab963d22021fa2bd6a52f63f3dcb5b004";
const root = new URL("../public/anatomy/", import.meta.url);
const files = [
  "LICENSE",
  "NOTICE",
  "manifest.json",
  "manifest_female.json",
  "skeletal_male.glb",
  "articular_male.glb",
  "muscular_male.glb",
  "nervous_male.glb",
  "cardiovascular_male.glb",
  "digestive_male.glb",
  "endocrine_male.glb",
  "lymphatic_male.glb",
  "regional_male.glb",
  "renal_male.glb",
  "reproductive_male.glb",
  "respiratory_male.glb",
  "visceral_male.glb",
  "skeletal_female.glb",
  "cardiovascular_female.glb",
  "digestive_female.glb",
  "integumentary_female.glb",
  "lymphatic_female.glb",
  "renal_female.glb",
  "reproductive_female.glb",
];
const hash = (b) => createHash("sha256").update(b).digest("hex");
if (process.argv.includes("--verify")) {
  const provenance = JSON.parse(
    await readFile(new URL("provenance.json", root), "utf8"),
  );
  for (const file of provenance.files) {
    const bytes = await readFile(new URL(file.name, root));
    if (hash(bytes) !== file.sha256)
      throw new Error(`Checksum mismatch: ${file.name}`);
  }
  console.log(`${provenance.files.length} assets: SHA-256 verified.`);
} else {
  await mkdir(root, { recursive: true });
  const records = [];
  // A fixed upstream revision makes data and licence changes deliberate and reviewable.
  for (const name of files) {
    const url = `https://raw.githubusercontent.com/Nurkan1/Anatria-3D/${commit}/public/anatomy/${name}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (name.endsWith(".glb") && bytes.toString("utf8", 0, 4) !== "glTF")
      throw new Error(`Invalid GLB ${name}`);
    await writeFile(new URL(name, root), bytes);
    records.push({ name, bytes: bytes.length, sha256: hash(bytes), url });
    console.log(`${name}: ${(bytes.length / 1048576).toFixed(2)} MB`);
  }
  await writeFile(
    new URL("provenance.json", root),
    JSON.stringify(
      {
        repository: "https://github.com/Nurkan1/Anatria-3D",
        commit,
        files: records,
      },
      null,
      2,
    ) + "\n",
  );
}

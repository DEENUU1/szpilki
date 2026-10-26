import { z } from "zod";
export interface AtlasFile {
  id: string;
  name: string;
  blob: Blob;
}
let opening: Promise<IDBDatabase> | null = null;
function database(): Promise<IDBDatabase> {
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    const request = indexedDB.open("szpilki-atlas-files", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("files", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return opening;
}
export async function saveAtlas(file: AtlasFile): Promise<void> {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(file);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function listAtlases(): Promise<AtlasFile[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction("files").objectStore("files").getAll();
    request.onsuccess = () => {
      const raw: unknown = request.result;
      const result = z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            blob: z.instanceof(Blob),
          }),
        )
        .safeParse(raw);
      if (result.success) resolve(result.data);
      else reject(result.error);
    };
    request.onerror = () => reject(request.error);
  });
}

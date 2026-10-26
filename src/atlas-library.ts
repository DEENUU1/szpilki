export const atlasLibrary = [
  {
    id: "mcminn",
    title: "McMinn",
    fileId: "1qlynRQ3MWNWhG8SLEKONpfC_oQAROAem",
    url: "https://drive.google.com/file/d/1qlynRQ3MWNWhG8SLEKONpfC_oQAROAem/view?usp=sharing",
    size: "110 MB",
    preview: false,
  },
  {
    id: "yokochi",
    title: "Yokochi",
    fileId: "1cI1SWzqukhvGBrA4fJk16m2uomeuQvy3",
    url: "https://drive.google.com/file/d/1cI1SWzqukhvGBrA4fJk16m2uomeuQvy3/view?usp=sharing",
    size: "25 MB",
    preview: true,
  },
] as const;
export type LibraryAtlas = (typeof atlasLibrary)[number];
export function atlasPreviewUrl(
  atlas: Extract<LibraryAtlas, { preview: true }>,
): string {
  return `https://drive.google.com/file/d/${atlas.fileId}/preview`;
}

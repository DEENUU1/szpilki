import {
  reportSchema,
  reviewSchema,
  makeReviewedPin,
  latinKey,
  restoreReviews,
} from "./pin-pipeline";
import type { Candidate, Report } from "./pin-pipeline";
import type { PhotoPin } from "../src/photo-data";
import type { z } from "zod";
type Review = z.infer<typeof reviewSchema>["reviews"][number];
function node<T extends Element>(id: string, type: { new (): T }): T {
  const n = document.getElementById(id);
  if (!(n instanceof type)) throw new Error(`Missing control ${id}`);
  return n;
}
const input = (id: string): HTMLInputElement => node(id, HTMLInputElement);
const select = (id: string): HTMLSelectElement => node(id, HTMLSelectElement);
const textarea = (id: string): HTMLTextAreaElement =>
  node(id, HTMLTextAreaElement);
const message = (text: string): void => {
  node("message", HTMLParagraphElement).textContent = text;
};
let report: Report,
  current: Candidate | null = null,
  tip: { x: number; y: number } | null = null;
let mode: "tip" | "crop" = "tip",
  corner: { x: number; y: number } | null = null;
const reviews = new Map<string, Review>();
const reportId = (): string => `${report.atlasId}:${report.createdAt}`;
const fields = ["pl", "en", "latin"] as const;
function download(name: string, value: unknown): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function counts(): void {
  node("counts", HTMLParagraphElement).textContent =
    `${report.candidates.length} propozycji · ${report.statistics.catalogMatched ?? 0} z dopasowaniem nazwy/modelu (${report.statistics.authoredNotesMatched ?? 0} z gotową notatką) · w tej sesji zatwierdzono ${[...reviews.values()].filter((r) => r.decision === "approved").length}, odrzucono ${[...reviews.values()].filter((r) => r.decision === "rejected").length}. Pobierz stan przed zamknięciem.`;
}
function filtered(): Candidate[] {
  const page = Number(input("page").value),
    f = select("filter").value;
  return report.candidates.filter(
    (c) =>
      c.page === page &&
      (f === "all" ||
        f === c.imageHint ||
        (f === "catalog"
          ? c.captions.some((s) => s.catalogIds.length)
          : c.captionState === f)),
  );
}
function options(): void {
  const list = select("candidate");
  list.replaceChildren();
  for (const c of filtered()) {
    const o = new Option(
      `${c.number} · ${c.imageHint} · ${c.conflictNumbers.length ? "CONFLICT " + c.conflictNumbers.join(",") : ""} · ${c.captionState} · ${c.captions[0]?.raw.slice(0, 90) ?? "brak podpisu"}`,
      c.id,
    );
    list.add(o);
  }
  load(list.value);
}
function crop(): PhotoPin["crop"] {
  return {
    x: Number(input("crop-x").value),
    y: Number(input("crop-y").value),
    w: Number(input("crop-w").value),
    h: Number(input("crop-h").value),
  };
}
function setCrop(b: PhotoPin["crop"]): void {
  for (const k of ["x", "y", "w", "h"] as const)
    input(`crop-${k}`).value = String(Math.round(b[k] * 100000) / 100000);
}
function overlay(): void {
  const svg = node("overlay", SVGElement);
  svg.replaceChildren();
  if (!current) return;
  const draw = (tag: string, attrs: Record<string, string | number>): void => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attrs))
      el.setAttribute(key, String(value));
    svg.append(el);
  };
  const a = current.anchor,
    b = crop();
  draw("rect", {
    x: a.x,
    y: a.y,
    width: a.w,
    height: a.h,
    fill: "none",
    stroke: "#147cb6",
    "stroke-width": 2,
  });
  draw("rect", {
    x: b.x,
    y: b.y,
    width: b.w,
    height: b.h,
    fill: "none",
    stroke: "#cf8513",
    "stroke-width": 2,
  });
  if (tip)
    draw("circle", {
      cx: tip.x,
      cy: tip.y,
      r: 0.006,
      fill: "#d92543",
      stroke: "white",
      "stroke-width": 1,
    });
}
function activeCatalog(): Report["catalog"] {
  return [
    ...report.catalog,
    ...[...reviews.values()].flatMap((r) =>
      r.decision === "approved" ? [r.pin] : [],
    ),
  ];
}
function catalog(): void {
  const c = activeCatalog().find((c) => c.id === select("catalog").value);
  node("provenance", HTMLParagraphElement).textContent = c
    ? `Szkic z ${c.id}\n${c.source}\nModel: ${c.modelId ?? "brak"}`
    : "Brak gotowego wpisu: uzupełnij treść z kontrolą źródła.";
  input("content").checked = false;
  input("caption").checked = false;
  input("use-model").checked = false;
  if (!c) return;
  for (const f of fields) input(f).value = c[f];
  if (!c.pl)
    input("pl").value =
      current?.captions[0]?.raw
        .split("(")[0]
        ?.replace(/^\d+\s*|\s+\d+$/g, "")
        .trim() ?? "";
  select("system").value = c.system;
  textarea("theory-pl").value = c.theory.pl;
  textarea("theory-en").value = c.theory.en;
}
function load(id: string): void {
  current = report.candidates.find((c) => c.id === id) ?? null;
  tip = null;
  corner = null;
  mode = "tip";
  for (const f of fields) input(f).value = "";
  for (const id of ["geometry", "caption", "content", "use-model"])
    input(id).checked = false;
  for (const id of ["recognize-pl", "recognize-en", "theory-pl", "theory-en"])
    textarea(id).value = "";
  select("system").value = "";
  select("region").value = "";
  select("side").value = "none";
  input("exercise").value = "";
  const list = select("catalog");
  list.replaceChildren(new Option("Bez dopasowania", ""));
  if (!current) {
    node("source", HTMLDivElement).textContent =
      "Brak propozycji w tym filtrze.";
    overlay();
    return;
  }
  node("image", HTMLImageElement).src = `pages/${current.page}.jpg`;
  node("source", HTMLDivElement).textContent =
    current.captions.map((c) => `${c.id}\n${c.raw}`).join("\n\n") ||
    "Brak pewnego przypisania podpisu. Sprawdź legendę na pełnej stronie i sąsiednich stronach.";
  const ids = new Set(current.captions.flatMap((c) => c.catalogIds));
  const keys = new Set(
    current.captions.flatMap((c) => (c.latin ? [latinKey(c.latin)] : [])),
  );
  for (const c of activeCatalog())
    if (keys.has(latinKey(c.latin))) ids.add(c.id);
  for (const c of activeCatalog().filter((c) => ids.has(c.id)))
    list.add(new Option(`${c.pl || c.en || c.latin} · ${c.id}`, c.id));
  if (list.options.length > 1) {
    list.selectedIndex = 1;
    catalog();
  } else {
    const c = current.captions[0];
    input("latin").value = c?.latin ?? "";
    input("pl").value =
      c?.raw
        .split("(")[0]
        ?.replace(/^\d+\s*/, "")
        .trim() ?? "";
    node("provenance", HTMLParagraphElement).textContent =
      "Brak wpisu katalogowego. Nazwy z OCR nie są sprawdzonym kluczem odpowiedzi.";
  }
  setCrop(current.crop);
  overlay();
  message(
    reviews.has(id)
      ? `W tej sesji: ${reviews.get(id)?.decision}. Ponowne zatwierdzenie zastąpi wpis.`
      : "Wybierz koniec szpilki i sprawdź treść.",
  );
  counts();
}
function next(): void {
  const list = select("candidate");
  if (list.selectedIndex < list.options.length - 1) {
    list.selectedIndex++;
    load(list.value);
  } else message("Koniec listy na tej stronie. Zmień stronę lub filtr.");
}
function ready(): void {
  select("filter").value = "catalog";
  input("page").value = String(
    report.candidates.find((c) => c.captions.some((c) => c.catalogIds.length))
      ?.page ??
      report.candidates[0]?.page ??
      1,
  );
  input("page").oninput = options;
  select("filter").onchange = options;
  select("candidate").onchange = () => load(select("candidate").value);
  select("catalog").onchange = catalog;
  node("next-page", HTMLButtonElement).onclick = () => {
    const n = report.candidates.find(
      (c) => c.page > Number(input("page").value),
    );
    if (n) {
      input("page").value = String(n.page);
      options();
    }
  };
  node("next", HTMLButtonElement).onclick = next;
  node("tip-mode", HTMLButtonElement).onclick = () => {
    mode = "tip";
    corner = null;
    message("Kliknij strukturę lub koniec linii prowadzącej.");
  };
  node("crop-mode", HTMLButtonElement).onclick = () => {
    mode = "crop";
    corner = null;
    message("Kliknij dwa przeciwległe narożniki kadru, bez legendy.");
  };
  node("figure", HTMLDivElement).onclick = (event) => {
    if (!current) return;
    const rect = node("image", HTMLImageElement).getBoundingClientRect();
    const p = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
    if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) return;
    input("geometry").checked = false;
    if (mode === "tip") tip = p;
    else if (!corner) corner = p;
    else {
      setCrop({
        x: Math.min(p.x, corner.x),
        y: Math.min(p.y, corner.y),
        w: Math.abs(p.x - corner.x),
        h: Math.abs(p.y - corner.y),
      });
      corner = null;
      mode = "tip";
    }
    overlay();
  };
  for (const k of ["x", "y", "w", "h"])
    input(`crop-${k}`).oninput = () => {
      input("geometry").checked = false;
      overlay();
    };
  node("approve", HTMLButtonElement).onclick = () => {
    try {
      if (!current || !tip)
        throw new Error("Najpierw kliknij rzeczywisty koniec szpilki.");
      const pin = makeReviewedPin(
        current,
        {
          tip,
          crop: crop(),
          pl: input("pl").value,
          en: input("en").value,
          latin: input("latin").value,
          recognize: {
            pl: textarea("recognize-pl").value,
            en: textarea("recognize-en").value,
          },
          theory: {
            pl: textarea("theory-pl").value,
            en: textarea("theory-en").value,
          },
          system: select("system").value,
          region: select("region").value,
          exercise: Number(input("exercise").value),
          side: select("side").value,
          catalogId: select("catalog").value || null,
          useModel: input("use-model").checked,
          geometryChecked: input("geometry").checked,
          captionChecked: input("caption").checked,
          contentChecked: input("content").checked,
        },
        activeCatalog(),
      );
      reviews.set(current.id, {
        candidateId: current.id,
        decision: "approved",
        pin,
      });
      counts();
      message(
        "Zatwierdzono lokalnie. Pobierz stan kontroli, aby zachować pracę.",
      );
    } catch (e) {
      message(e instanceof Error ? e.message : String(e));
    }
  };
  node("reject", HTMLButtonElement).onclick = () => {
    if (current) {
      reviews.set(current.id, {
        candidateId: current.id,
        decision: "rejected",
        pin: null,
      });
      counts();
      message("Odrzucono propozycję.");
    }
  };
  node("save", HTMLButtonElement).onclick = () =>
    download("atlas-review-progress.json", {
      version: 1,
      atlasId: report.atlasId,
      reportId: reportId(),
      reviews: [...reviews.values()],
    });
  node("export", HTMLButtonElement).onclick = () =>
    download(
      "reviewed-pins.json",
      [...reviews.values()].flatMap((r) =>
        r.decision === "approved" && r.pin ? [r.pin] : [],
      ),
    );
  for (const element of document.querySelectorAll(
    "aside input,aside textarea,aside select",
  )) {
    if (
      element instanceof HTMLInputElement &&
      ["geometry", "caption", "content"].includes(element.id)
    )
      continue;
    element.addEventListener("input", () => {
      input("content").checked = false;
      if (fields.some((id) => id === element.id))
        input("caption").checked = false;
    });
  }
  input("resume").onchange = () => {
    const file = input("resume").files?.[0];
    if (!file) return;
    void file
      .text()
      .then((text) => {
        const data = restoreReviews(report, JSON.parse(text) as unknown);
        reviews.clear();
        for (const r of data.reviews) reviews.set(r.candidateId, r);
        counts();
        message("Wczytano stan kontroli.");
      })
      .catch((e) => message(e instanceof Error ? e.message : String(e)));
  };
  options();
  counts();
}
try {
  const response = await fetch("./report.json");
  if (!response.ok) throw new Error(`Report HTTP ${response.status}`);
  const raw: unknown = await response.json();
  report = reportSchema.parse(raw);
  ready();
} catch (e) {
  node("error", HTMLParagraphElement).textContent =
    e instanceof Error ? e.message : String(e);
}

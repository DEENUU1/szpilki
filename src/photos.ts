import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  answerMatches,
  escapeHtml,
  nextQuestion,
  regionNames,
  systemNames,
} from "./domain";
import type { Region, System } from "./domain";
import { getLanguage } from "./i18n";
import { mcminnId, photoName, starterPins } from "./photo-data";
import type { PhotoPin } from "./photo-data";
import { listAtlases, saveAtlas } from "./atlas-storage";
import type { AtlasFile } from "./atlas-storage";
import {
  activeSession,
  endSession,
  recordReview,
  saveStudy,
  startSession,
} from "./storage";
import type { StudyData } from "./storage";
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
const msg = (en: string, pl: string): string =>
  getLanguage() === "en" ? en : pl;
function element<T extends HTMLElement>(
  root: HTMLElement,
  selector: string,
  type: { new (): T },
): T {
  const result = root.querySelector(selector);
  if (!(result instanceof type))
    throw new Error(`Missing atlas element ${selector}`);
  return result;
}
export class PhotoPractice {
  private files: AtlasFile[] = [];
  private file: AtlasFile | null = null;
  private task: pdfjs.PDFDocumentLoadingTask | null = null;
  private doc: pdfjs.PDFDocumentProxy | null = null;
  private question: PhotoPin | null = null;
  private revealed = false;
  private graded = false;
  private busy = false;
  private page = 1;
  private region: Region = "all";
  private system: System | "all" = "all";
  private exercise = 0;
  private onlyMistakes = false;
  private annotate = false;
  private drawSequence = 0;
  private pending: { x: number; y: number } | null = null;
  constructor(
    private root: HTMLElement,
    private study: () => StudyData,
    private notify: (message: string) => void,
    private show3d: (pin: PhotoPin) => Promise<void>,
  ) {
    this.render();
    void this.restoreFiles();
  }
  get pins(): PhotoPin[] {
    return [...starterPins, ...this.study().photoPins];
  }
  private node<T extends HTMLElement>(
    selector: string,
    type: { new (): T },
  ): T {
    return element(this.root, selector, type);
  }
  activate(): void {
    const session = activeSession(this.study());
    if (session?.source !== "photo") {
      this.question = null;
      this.revealed = false;
      this.graded = false;
    }
    this.render();
    if (this.doc) void this.draw().catch((error) => console.error(error));
  }
  refreshLanguage(): void {
    this.render();
    if (this.doc) void this.draw();
  }
  private render(): void {
    this.root.innerHTML = `<div class="photo-header"><div><h1>${msg("Atlas photographs", "Preparaty z atlasu")}</h1><p>${msg("Identify a pinned structure, type its name, then learn its landmarks and connections.", "Rozpoznaj wskazaną strukturę, wpisz nazwę i poznaj jej punkty orientacyjne oraz powiązania.")}</p></div><label class="button" for="atlas-upload">${msg("Add atlas PDF", "Dodaj atlas PDF")}</label><input id="atlas-upload" type="file" accept="application/pdf" hidden></div>
  <div class="photo-filters"><label>${msg("Atlas", "Atlas")}<select id="atlas-file"><option value="">${msg("Choose a local PDF", "Wybierz lokalny PDF")}</option>${this.files.map((f) => `<option value="${f.id}" ${this.file?.id === f.id ? "selected" : ""}>${escapeHtml(f.name)}</option>`).join("")}</select></label><label>${msg("Class / syllabus", "Ćwiczenie / rozpiska")}<select id="atlas-exercise"><option value="0">${msg("All classes", "Wszystkie ćwiczenia")}</option><option value="1">1 · ${msg("Axial skeleton", "Kościec osiowy")}</option><option value="2">2 · ${msg("Limb bones and landmarks", "Kości kończyn i punkty kostne")}</option><option value="3">3 · ${msg("Joints", "Stawy")}</option><option value="4">4 · ${msg("Trunk muscles", "Mięśnie tułowia")}</option><option value="5">5 · ${msg("Upper limb muscles", "Mięśnie kończyny górnej")}</option><option value="6">6 · ${msg("Lower limb muscles", "Mięśnie kończyny dolnej")}</option><option value="7">7 · ${msg("Brachial plexus and nerves", "Splot ramienny i nerwy")}</option><option value="8">8 · ${msg("Lumbar / sacral nerves", "Nerwy lędźwiowe i krzyżowe")}</option></select></label><label>${msg("Region", "Okolica")}<select id="atlas-region">${(["all", "upper", "lower", "trunk", "head"] satisfies Region[]).map((r) => `<option value="${r}">${escapeHtml(regionNames[r])}</option>`).join("")}</select></label><label>${msg("System", "Układ")}<select id="atlas-system"><option value="all">${msg("All systems", "Wszystkie układy")}</option>${(["skeletal", "muscular", "articular", "nervous"] satisfies System[]).map((s) => `<option value="${s}">${systemNames[s]}</option>`).join("")}</select></label></div>
  <div class="photo-layout"><section class="photo-stage"><div id="atlas-empty" ${this.doc ? "hidden" : ""}><svg width="64" viewBox="0 0 80 90" aria-hidden="true"><path d="M10 3h40l20 20v63H10zM50 3v22h20M25 43h30M25 55h30M25 67h18" fill="none" stroke="currentColor" stroke-width="2"/></svg><h2>${msg("Practise on real atlas photographs", "Ćwicz na prawdziwych zdjęciach z atlasu")}</h2><p>${msg("Add your McMinn PDF to unlock 39 prepared pins on the scapula, humerus, femur and arm nerves, with explanations. You can annotate any other atlas yourself.", "Dodaj przesłany PDF McMinna, aby uruchomić 39 przygotowanych szpilek na łopatce, kości ramiennej, udowej i nerwach ramienia, z objaśnieniami. Inny atlas możesz oznaczyć samodzielnie.")}</p><p class="fineprint">${msg("The PDF stays in this browser. It is never uploaded. The public app contains points and explanations, not the book scans.", "PDF pozostaje w tej przeglądarce i nie jest wysyłany. Publiczna aplikacja zawiera punkty i objaśnienia, bez skanów książek.")}</p></div><div class="photo-canvas-wrap" id="atlas-image" ${this.doc ? "" : "hidden"}><canvas id="atlas-canvas"></canvas><div id="photo-pin" class="photo-pin" hidden><span>1</span><b></b></div></div><p id="atlas-status" role="status" class="fineprint"></p><div class="photo-page-controls" ${this.doc ? "" : "hidden"}><button id="atlas-annotate">${msg("Add my own pin", "Dodaj własną szpilkę")}</button><label>${msg("PDF page", "Strona PDF")}<input id="atlas-page" type="number" min="1" value="${this.page}" max="${this.doc?.numPages ?? 1}"></label><button id="atlas-open-page">${msg("Open page", "Otwórz stronę")}</button></div></section>
  <aside class="photo-question-panel"><span class="status-tag">${msg("Photo recognition", "Rozpoznawanie preparatów")}</span><h2>${msg("What does the pin indicate?", "Co wskazuje szpilka?")}</h2><p id="photo-pool" class="fineprint"></p><label class="checkbox-row"><input id="photo-mistakes" type="checkbox">${msg("Only my mistakes", "Tylko moje błędy")}</label><div id="photo-answer-area" ${this.question ? "" : "hidden"}><form id="photo-answer-form"><label for="photo-answer">${msg("Polish, Latin or English name", "Nazwa polska, łacińska lub angielska")}</label><input id="photo-answer" autocomplete="off" spellcheck="false" placeholder="${msg("Type the structure name", "Wpisz nazwę struktury")}"><button id="photo-check" type="submit">${msg("Check answer", "Sprawdź")}</button></form><button id="photo-reveal" class="text-button">${msg("Reveal answer", "Pokaż odpowiedź")}</button><div id="photo-feedback" aria-live="polite"></div><div class="button-row" id="photo-self-grade" hidden><button id="photo-wrong">${msg("Review again", "Do powtórki")}</button><button id="photo-correct">${msg("I knew it", "Umiem")}</button></div></div><button id="photo-draw" class="primary wide">${msg(this.question ? "Next photograph →" : "Draw a photograph", this.question ? "Następne zdjęcie →" : "Losuj zdjęcie")}</button><button id="photo-finish" class="text-button">${msg("Finish session", "Zakończ sesję")}</button><p class="fineprint">${msg("The starter deck covers selected items from classes 2 and 7. Other classes need additional checked annotations.", "Zestaw startowy obejmuje wybrane struktury z ćwiczeń 2 i 7. Pozostałe ćwiczenia wymagają kolejnych sprawdzonych oznaczeń.")}</p></aside></div>
  <dialog id="photo-pin-dialog"><form id="photo-pin-form"><h2>${msg("New photo pin", "Nowa szpilka fotograficzna")}</h2><label>English<input id="custom-en" required maxlength="180"></label><label>Polski<input id="custom-pl" required maxlength="180"></label><label>Latin<input id="custom-latin" required maxlength="180"></label><label>${msg("How to recognise it (English)", "Jak rozpoznać (po angielsku)")}<textarea id="custom-recognize-en" required maxlength="1600"></textarea></label><label>${msg("How to recognise it (Polish)", "Jak rozpoznać (po polsku)")}<textarea id="custom-recognize-pl" required maxlength="1600"></textarea></label><label>${msg("Connections / theory (English)", "Powiązania / teoria (po angielsku)")}<textarea id="custom-theory-en" required maxlength="2400"></textarea></label><label>${msg("Connections / theory (Polish)", "Powiązania / teoria (po polsku)")}<textarea id="custom-theory-pl" required maxlength="2400"></textarea></label><p class="fineprint">${msg("The current region, system and class filters are used for this pin. Set a specific class and system before adding one.", "Szpilka otrzyma aktualną okolicę, układ i ćwiczenie z filtrów. Przed dodaniem wybierz konkretne ćwiczenie i układ.")}</p><div class="button-row"><button id="custom-cancel" type="button">${msg("Cancel", "Anuluj")}</button><button type="submit" class="primary">${msg("Save pin", "Zapisz szpilkę")}</button></div></form></dialog>`;
    this.node("#atlas-exercise", HTMLSelectElement).value = String(
      this.exercise,
    );
    this.node("#atlas-region", HTMLSelectElement).value = this.region;
    this.node("#atlas-system", HTMLSelectElement).value = this.system;
    this.node("#photo-mistakes", HTMLInputElement).checked = this.onlyMistakes;
    this.node("#atlas-upload", HTMLInputElement).onchange = (e) => {
      if (e.target instanceof HTMLInputElement) {
        const file = e.target.files?.[0];
        if (file) void this.importFile(file);
      }
    };
    this.node("#atlas-file", HTMLSelectElement).onchange = (e) => {
      if (e.target instanceof HTMLSelectElement) {
        const id = e.target.value;
        const file = this.files.find((f) => f.id === id);
        if (file) void this.open(file);
      }
    };
    this.node("#atlas-exercise", HTMLSelectElement).onchange = () => {
      this.exercise = Number(
        this.node("#atlas-exercise", HTMLSelectElement).value,
      );
      this.scopeChanged();
    };
    this.node("#atlas-region", HTMLSelectElement).onchange = () => {
      const value = this.node("#atlas-region", HTMLSelectElement).value;
      if (
        value === "all" ||
        value === "upper" ||
        value === "lower" ||
        value === "trunk" ||
        value === "head"
      )
        this.region = value;
      this.scopeChanged();
    };
    this.node("#atlas-system", HTMLSelectElement).onchange = () => {
      const value = this.node("#atlas-system", HTMLSelectElement).value;
      if (
        value === "all" ||
        value === "skeletal" ||
        value === "muscular" ||
        value === "articular" ||
        value === "nervous"
      )
        this.system = value;
      this.scopeChanged();
    };
    this.node("#photo-mistakes", HTMLInputElement).onchange = () => {
      this.onlyMistakes = this.node(
        "#photo-mistakes",
        HTMLInputElement,
      ).checked;
      this.scopeChanged();
    };
    this.node("#photo-draw", HTMLButtonElement).onclick = () => {
      void this.random();
    };
    this.node("#photo-reveal", HTMLButtonElement).onclick = () => this.reveal();
    this.node("#photo-answer-form", HTMLFormElement).onsubmit = (e) => {
      e.preventDefault();
      if (!this.question || this.revealed) return;
      this.grade(
        answerMatches(this.node("#photo-answer", HTMLInputElement).value, [
          this.question.pl,
          this.question.en,
          this.question.latin,
        ]),
      );
    };
    this.node("#photo-answer", HTMLInputElement).oninput = () => this.persist();
    this.node("#photo-wrong", HTMLButtonElement).onclick = () =>
      this.grade(false);
    this.node("#photo-correct", HTMLButtonElement).onclick = () =>
      this.grade(true);
    this.node("#photo-finish", HTMLButtonElement).onclick = () => {
      if (activeSession(this.study())?.source === "photo")
        endSession(this.study());
      this.question = null;
      this.revealed = false;
      this.graded = false;
      this.persist();
      this.render();
      if (this.doc) void this.draw();
    };
    this.node("#atlas-annotate", HTMLButtonElement).onclick = () => {
      this.annotate = !this.annotate;
      void this.draw();
    };
    this.node("#atlas-open-page", HTMLButtonElement).onclick = () => {
      const page = Number(this.node("#atlas-page", HTMLInputElement).value);
      if (
        Number.isInteger(page) &&
        page >= 1 &&
        page <= (this.doc?.numPages ?? 0)
      ) {
        this.page = page;
        this.annotate = true;
        void this.draw();
      }
    };
    this.node("#atlas-canvas", HTMLCanvasElement).onclick = (e) => {
      if (!this.annotate || !this.file) return;
      if (!this.exercise || this.system === "all" || this.region === "all") {
        this.notify(
          msg(
            "Select a class, region and system before adding a pin.",
            "Przed dodaniem wybierz ćwiczenie, okolicę i układ.",
          ),
        );
        return;
      }
      const b = this.node(
        "#atlas-canvas",
        HTMLCanvasElement,
      ).getBoundingClientRect();
      this.pending = {
        x: (e.clientX - b.left) / b.width,
        y: (e.clientY - b.top) / b.height,
      };
      this.node("#photo-pin-dialog", HTMLDialogElement).showModal();
    };
    this.node("#custom-cancel", HTMLButtonElement).onclick = () =>
      this.node("#photo-pin-dialog", HTMLDialogElement).close();
    this.node("#photo-pin-form", HTMLFormElement).onsubmit = (e) => {
      e.preventDefault();
      this.addCustom();
    };
    this.poolLabel();
    if (this.question) {
      const session = activeSession(this.study());
      this.node("#photo-answer", HTMLInputElement).value = session?.draft ?? "";
      if (this.revealed) this.showExplanation();
    }
  }
  private scopeChanged(): void {
    const data = this.study();
    if (activeSession(data)?.source === "photo") endSession(data);
    this.question = null;
    this.revealed = false;
    this.graded = false;
    this.persist();
    this.render();
    if (this.doc) void this.draw().catch((error) => console.error(error));
  }
  private pool(): PhotoPin[] {
    return this.pins.filter(
      (p) =>
        p.atlasId === this.file?.id &&
        (this.region === "all" || p.region === this.region) &&
        (this.system === "all" || p.system === this.system) &&
        (!this.exercise || p.exercise === this.exercise),
    );
  }
  private poolLabel(): void {
    const count = this.pool().length;
    this.node("#photo-pool", HTMLParagraphElement).textContent = msg(
      `${count} checked pins in this atlas and scope.`,
      `${count} sprawdzonych szpilek w tym atlasie i zakresie.`,
    );
    this.node("#photo-draw", HTMLButtonElement).disabled = !count || this.busy;
  }
  private async restoreFiles(): Promise<void> {
    try {
      this.files = await listAtlases();
      this.render();
      const saved = activeSession(this.study());
      const lastId = localStorage.getItem("szpilki-atlas-choice");
      if (saved?.source === "photo") {
        const file = this.files.find((f) => f.id === saved.atlasId);
        if (file) await this.open(file, true);
      } else {
        const file = this.files.find((f) => f.id === lastId);
        if (file) await this.open(file);
      }
    } catch (error) {
      console.error(error);
      this.notify(
        msg(
          "PDF storage is unavailable. You can still add a PDF for this visit.",
          "Pamięć PDF jest niedostępna. Możesz dodać plik na czas tej wizyty.",
        ),
      );
    }
  }
  private async importFile(file: File): Promise<void> {
    if (this.busy) return;
    if (file.size > 250 * 1024 * 1024) {
      this.notify(
        msg("Please choose a PDF under 250 MB.", "Wybierz PDF poniżej 250 MB."),
      );
      return;
    }
    this.busy = true;
    this.poolLabel();
    this.node("#atlas-status", HTMLParagraphElement).textContent = msg(
      "Reading and identifying the atlas…",
      "Odczytuję i identyfikuję atlas…",
    );
    try {
      const bytes = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const id = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const atlas = { id, name: file.name, blob: file };
      if (!(await this.open(atlas, false, new Uint8Array(bytes)))) return;
      this.files = this.files.filter((f) => f.id !== id);
      this.files.push(atlas);
      try {
        await saveAtlas(atlas);
      } catch (error) {
        console.error(error);
        this.notify(
          msg(
            "PDF opened, but could not be saved. Add it again on your next visit.",
            "PDF otwarty, ale nie zapisany. Dodaj go ponownie przy następnej wizycie.",
          ),
        );
      }
      this.render();
      if (this.doc) await this.draw();
      if (id === mcminnId)
        this.notify(
          msg(
            "Atlas recognised: 39 prepared pins with explanations are ready.",
            "Atlas rozpoznany: 39 gotowych szpilek z objaśnieniami.",
          ),
        );
      else
        this.notify(
          msg(
            "This PDF has no starter deck. Use “Add my own pin” to prepare it.",
            "Ten PDF nie ma zestawu startowego. Użyj „Dodaj własną szpilkę”.",
          ),
        );
    } catch (error) {
      console.error(error);
      this.notify(
        msg(
          "Could not open this PDF. Please check the file.",
          "Nie udało się otworzyć PDF. Sprawdź plik.",
        ),
      );
    } finally {
      this.busy = false;
      this.poolLabel();
    }
  }
  private async open(
    file: AtlasFile,
    resume = false,
    bytes?: Uint8Array<ArrayBuffer>,
  ): Promise<boolean> {
    try {
      const task = pdfjs.getDocument({
        data: bytes ?? new Uint8Array(await file.blob.arrayBuffer()),
      });
      const doc = await task.promise;
      if (this.task) await this.task.destroy();
      const session = activeSession(this.study());
      if (session?.source === "photo" && session.atlasId !== file.id) {
        endSession(this.study());
        saveStudy(this.study());
      }
      this.task = task;
      this.doc = doc;
      this.file = file;
      try {
        localStorage.setItem("szpilki-atlas-choice", file.id);
      } catch (error) {
        console.warn("Could not remember the selected atlas.", error);
      }
      this.question = null;
      this.revealed = false;
      this.graded = false;
      this.annotate = false;
      if (resume) {
        const session = activeSession(this.study());
        this.question =
          this.pins.find(
            (p) => p.id === session?.questionId && p.atlasId === file.id,
          ) ?? null;
        this.revealed = session?.revealed ?? false;
        this.graded = session?.graded ?? false;
        this.region = session?.photoFilters?.region ?? "all";
        this.system = session?.photoFilters?.system ?? "all";
        this.exercise =
          session?.photoFilters?.exercise ?? this.question?.exercise ?? 0;
        this.onlyMistakes = session?.photoFilters?.onlyMistakes ?? false;
      }
      this.render();
      await this.draw();
      return true;
    } catch (error) {
      console.error(error);
      this.notify(
        msg("Could not render the atlas.", "Nie udało się wyświetlić atlasu."),
      );
      return false;
    }
  }
  private async draw(): Promise<void> {
    if (!this.doc) return;
    const sequence = ++this.drawSequence;
    const pin = this.question ?? this.pool()[0] ?? null;
    const page = this.annotate ? this.page : (pin?.page ?? this.page);
    const pdfPage = await this.doc.getPage(page);
    const viewport = pdfPage.getViewport({ scale: 2 });
    const full = document.createElement("canvas");
    full.width = viewport.width;
    full.height = viewport.height;
    const context = full.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    await pdfPage.render({ canvas: full, canvasContext: context, viewport })
      .promise;
    if (page === 125 && !this.annotate) {
      context.fillStyle = "white";
      context.fillRect(
        0,
        full.height * 0.53,
        full.width * 0.28,
        full.height * 0.32,
      );
    }
    if (sequence !== this.drawSequence) return;
    const crop = this.annotate || !pin ? { x: 0, y: 0, w: 1, h: 1 } : pin.crop;
    const canvas = this.node("#atlas-canvas", HTMLCanvasElement);
    canvas.width = Math.round(full.width * crop.w);
    canvas.height = Math.round(full.height * crop.h);
    this.node("#atlas-image", HTMLDivElement).style.maxWidth =
      `${Math.min(850, Math.max(200, (window.innerHeight * 0.75 * canvas.width) / canvas.height))}px`;
    const target = canvas.getContext("2d");
    if (!target) throw new Error("Canvas unavailable");
    target.drawImage(
      full,
      full.width * crop.x,
      full.height * crop.y,
      full.width * crop.w,
      full.height * crop.h,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    full.width = 0;
    full.height = 0;
    const marker = this.node("#photo-pin", HTMLDivElement);
    marker.hidden = !pin || this.annotate || !this.question;
    if (pin && !this.annotate) {
      marker.style.left = `${((pin.x - crop.x) / crop.w) * 100}%`;
      marker.style.top = `${((pin.y - crop.y) / crop.h) * 100}%`;
    }
    this.node("#atlas-image", HTMLDivElement).hidden = false;
    this.node("#atlas-empty", HTMLDivElement).hidden = true;
    this.node("#atlas-status", HTMLParagraphElement).textContent = this.annotate
      ? msg(
          "Click the exact structure to add a pin.",
          "Kliknij dokładnie w strukturę, aby dodać szpilkę.",
        )
      : msg(
          `Local PDF · ${this.doc.numPages} pages · the image has no answer labels.`,
          `Lokalny PDF · ${this.doc.numPages} stron · obraz nie ma podpisów odpowiedzi.`,
        );
  }
  async restoreSession(): Promise<void> {
    const session = activeSession(this.study());
    if (session?.source !== "photo") return;
    const file = this.files.find((f) => f.id === session.atlasId);
    if (file) await this.open(file, true);
    else
      this.notify(
        msg(
          "Add the original PDF to resume this session.",
          "Dodaj oryginalny PDF, aby wznowić tę sesję.",
        ),
      );
  }
  private async random(): Promise<void> {
    if (this.busy || !this.file) return;
    const data = this.study();
    const previous = this.question?.id ?? null;
    const pin = nextQuestion(
      this.pool().map((pin) => ({ id: `photo:${pin.atlasId}:${pin.id}`, pin })),
      previous ? `photo:${this.file.id}:${previous}` : null,
      data.reviews,
      this.onlyMistakes,
    )?.pin;
    if (!pin) {
      this.notify(
        msg(
          "No pins match these filters.",
          "Brak szpilek pasujących do filtrów.",
        ),
      );
      return;
    }
    if (activeSession(data)?.source === "3d") endSession(data);
    const session = startSession(data, {
      ...data.preferences,
      region: this.region,
      quizSystems:
        this.system === "all"
          ? ["skeletal", "nervous", "muscular", "articular"]
          : [this.system],
    });
    session.source = "photo";
    session.photoFilters = {
      region: this.region,
      system: this.system,
      exercise: this.exercise,
      onlyMistakes: this.onlyMistakes,
    };
    session.atlasId = this.file.id;
    session.questionId = pin.id;
    session.questionCount++;
    session.draft = "";
    session.revealed = false;
    session.graded = false;
    session.deadline = null;
    this.question = pin;
    this.revealed = false;
    this.graded = false;
    this.annotate = false;
    this.persist();
    this.render();
    this.busy = true;
    this.poolLabel();
    try {
      await this.draw();
    } catch (error) {
      console.error(error);
      this.notify(
        msg(
          "Could not render the photograph.",
          "Nie udało się wyświetlić zdjęcia.",
        ),
      );
    } finally {
      this.busy = false;
      this.poolLabel();
    }
    this.node("#photo-answer", HTMLInputElement).focus();
  }
  private reveal(): void {
    if (!this.question) return;
    this.revealed = true;
    this.persist();
    this.showExplanation();
  }
  private showExplanation(): void {
    const pin = this.question;
    if (!pin) return;
    const lang = getLanguage();
    this.node("#photo-answer", HTMLInputElement).disabled = true;
    this.node("#photo-check", HTMLButtonElement).disabled = true;
    this.node("#photo-reveal", HTMLButtonElement).hidden = true;
    this.node("#photo-self-grade", HTMLDivElement).hidden = this.graded;
    this.node("#photo-feedback", HTMLDivElement).innerHTML =
      `<div class="revealed-answer"><span>${msg("Pinned structure", "Wskazana struktura")}</span><strong>${escapeHtml(photoName(pin, lang))}</strong><em lang="la">${escapeHtml(pin.latin)}</em></div><section class="photo-theory"><h3>${msg("How to recognise it", "Jak ją rozpoznać")}</h3><p>${escapeHtml(pin.recognize[lang])}</p><h3>${msg("Connections and theory", "Powiązania i teoria")}</h3><p>${escapeHtml(pin.theory[lang])}</p><p class="fineprint">${escapeHtml(pin.source)}</p>${pin.modelId ? `<button id="photo-to-3d">${msg("Show in 3D", "Pokaż w 3D")} ↗</button><p class="fineprint">${msg(pin.system === "skeletal" ? "Opens the corresponding bone. The photographic landmark is not a separately labelled 3D mesh." : "Opens the corresponding nerve in its spatial context.", pin.system === "skeletal" ? "Otwiera odpowiadającą kość. Punkt kostny ze zdjęcia nie jest osobno opisanym elementem siatki 3D." : "Otwiera odpowiadający nerw w kontekście przestrzennym.")}</p>` : ""}</section>`;
    const link = this.root.querySelector("#photo-to-3d");
    if (link instanceof HTMLButtonElement)
      link.onclick = () => {
        void this.show3d(pin);
      };
  }
  private grade(correct: boolean): void {
    if (!this.question || this.graded) return;
    this.graded = true;
    const data = this.study();
    const session = activeSession(data);
    if (!session || session.source !== "photo") return;
    let review;
    try {
      review = recordReview(
        data,
        `photo:${this.question.atlasId}:${this.question.id}`,
        correct,
        session.id,
      );
    } catch (error) {
      console.error(error);
      review = data.reviews.at(-1);
      this.notify(
        msg(
          "Could not save progress. Export your data.",
          "Nie udało się zapisać postępów. Wyeksportuj dane.",
        ),
      );
    }
    if (!review) return;
    const savedReview = review;
    this.reveal();
    const status = document.createElement("p");
    status.className = correct ? "grade-correct" : "grade-wrong";
    status.textContent = msg(
      correct ? "Correct answer." : "Review this structure again.",
      correct ? "Dobra odpowiedź." : "Wróć do tej struktury w powtórce.",
    );
    this.node("#photo-feedback", HTMLDivElement).prepend(status);
    if (!correct) {
      const accept = document.createElement("button");
      accept.className = "text-button";
      accept.textContent = msg(
        "Accept my synonym as correct",
        "Uznaj mój synonim za poprawny",
      );
      accept.onclick = () => {
        savedReview.correct = true;
        this.persist();
        status.textContent = msg(
          "Answer accepted manually.",
          "Odpowiedź uznana ręcznie.",
        );
        status.className = "grade-correct";
        accept.remove();
      };
      this.node("#photo-feedback", HTMLDivElement).append(accept);
    }
  }
  private persist(): void {
    const data = this.study();
    const session = activeSession(data);
    if (session?.source === "photo" && this.question) {
      session.questionId = this.question.id;
      session.draft = this.node("#photo-answer", HTMLInputElement).value;
      session.revealed = this.revealed;
      session.graded = this.graded;
      session.updatedAt = Date.now();
    }
    try {
      saveStudy(data);
    } catch (error) {
      console.error(error);
      this.notify(
        msg(
          "Could not save progress. Export your data.",
          "Nie udało się zapisać postępów. Wyeksportuj dane.",
        ),
      );
    }
  }
  private addCustom(): void {
    if (!this.file || !this.pending || this.system === "all" || !this.exercise)
      return;
    const text = (id: string): string => {
      const node = this.root.querySelector(id);
      return node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement
        ? node.value.trim()
        : "";
    };
    const pin: PhotoPin = {
      id: crypto.randomUUID(),
      atlasId: this.file.id,
      page: this.page,
      ...this.pending,
      crop: { x: 0, y: 0, w: 1, h: 1 },
      pl: text("#custom-pl"),
      en: text("#custom-en"),
      latin: text("#custom-latin"),
      region: this.region,
      system: this.system,
      exercise: this.exercise,
      recognize: {
        en: text("#custom-recognize-en"),
        pl: text("#custom-recognize-pl"),
      },
      theory: { en: text("#custom-theory-en"), pl: text("#custom-theory-pl") },
      modelId: null,
      source: `${this.file.name} · PDF page ${this.page} · user annotation`,
    };
    this.study().photoPins.push(pin);
    this.persist();
    this.node("#photo-pin-dialog", HTMLDialogElement).close();
    this.poolLabel();
    this.notify(
      msg("Your pin has been saved.", "Twoja szpilka została zapisana."),
    );
  }
}

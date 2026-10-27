import { bookCategories } from "./book-category";
import type { BookCategory } from "./book-category";
import { reviewQueue, ratingSchema, intervalLabel } from "./repetition";
import type { StudyRating } from "./repetition";
import { ratingButtons } from "./review-ui";
import { saveQuestionDraft } from "./question-draft";
import { atlasLibrary, atlasPreviewUrl } from "./atlas-library";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  answerFeedback,
  escapeHtml,
  latestMistakes,
  nextQuestion,
  regionNames,
  systemNames,
} from "./domain";
import type { Region, System } from "./domain";
import { getLanguage } from "./i18n";
import { mcminnId, photoName, starterPins } from "./photo-data";
import type { PhotoPin } from "./photo-data";
import { bookPool, bookQuestions, loadBook, questionName } from "./atlas-book";
import type { BookIndex, BookQuestion, PageBox } from "./atlas-book";
import { listAtlases, saveAtlas } from "./atlas-storage";
import type { AtlasFile } from "./atlas-storage";
import {
  activeSession,
  endSession,
  recordRatedReview,
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
  private question: PhotoPin | BookQuestion | null = null;
  private mode: "pins" | "book" = "pins";
  private bookCategory: BookCategory | "all" = "all";
  private firstPage = 1;
  private lastPage = 362;
  private book: BookIndex | null = null;
  private revealed = false;
  private graded = false;
  private busy = false;
  private page = 1;
  private region: Region = "all";
  private system: System | "all" = "all";
  private exercise = 0;
  private onlyMistakes = false;
  private earlyReview = false;
  private annotate = false;
  private browsing = false;
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
  get pins(): (PhotoPin | BookQuestion)[] {
    return [
      ...starterPins,
      ...this.study().photoPins,
      ...(this.book ? bookQuestions(this.book) : []),
    ];
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
    this.root.innerHTML = `<div class="photo-header"><div><h1>${msg("Atlas photographs", "Preparaty z atlasu")}</h1><p>${msg("Identify a pinned structure, type its name, then learn its landmarks and connections.", "Rozpoznaj wskazaną strukturę, wpisz nazwę i poznaj jej punkty orientacyjne oraz powiązania.")}</p></div><button data-import-atlas>${msg("Add atlas PDF", "Dodaj atlas PDF")}</button><input id="atlas-upload" type="file" accept="application/pdf" hidden></div>
  <section class="atlas-library" aria-label="${msg("Atlas library", "Biblioteka atlasów")}"><div class="atlas-library-heading"><h2>${msg("Your atlases", "Twoje atlasy")}</h2><p>${msg("Read online. To practise pins, download the PDF from Drive and add it once using “Add atlas PDF”.", "Czytaj online. Aby ćwiczyć szpilki, pobierz PDF z Drive i dodaj go jednorazowo przyciskiem „Dodaj atlas PDF”.")}</p></div><div class="atlas-library-cards">${atlasLibrary.map((atlas) => `<article><div><h3>${atlas.title}</h3><p>${atlas.size} · PDF · ${atlas.id === "mcminn" ? msg("Whole-book numbered questions", "Pytania z numerami z całej książki") : msg("Reading and your own annotations", "Czytanie i własne oznaczenia")}</p></div><div class="button-row">${atlas.preview ? `<button data-atlas-preview="${atlas.id}">${msg("Read here", "Czytaj tutaj")}</button>` : `<button data-import-atlas>${msg("Add PDF for practice", "Dodaj PDF do ćwiczeń")}</button>`}<a class="text-button" href="${atlas.url}" target="_blank" rel="noopener noreferrer">${atlas.preview ? msg("Open in Drive", "Otwórz w Drive") : msg("Open / download", "Otwórz / pobierz")} ↗</a></div>${atlas.preview ? "" : `<p class="fineprint">${msg("Drive cannot preview this large file. Download it and add the PDF to read and practise locally.", "Drive nie wyświetla podglądu tak dużego pliku. Pobierz go i dodaj PDF, aby czytać i ćwiczyć lokalnie.")}</p>`}</article>`).join("")}</div></section>
  <dialog id="atlas-preview-dialog" class="atlas-preview-dialog"></dialog>
  <div class="photo-filters"><label>${msg("Practice mode", "Tryb nauki")}<select id="atlas-mode"><option value="book">${msg("Whole McMinn · printed numbers", "Cały McMinn · numery z atlasu")}</option><option value="pins">${msg("Prepared pins · explanations + 3D", "Gotowe szpilki · objaśnienia + 3D")}</option></select></label><label>${msg("Atlas", "Atlas")}<select id="atlas-file"><option value="">${msg("Choose a local PDF", "Wybierz lokalny PDF")}</option>${this.files.map((f) => `<option value="${f.id}" ${this.file?.id === f.id ? "selected" : ""}>${escapeHtml(f.name)}</option>`).join("")}</select></label><label>${msg("Class / syllabus", "Ćwiczenie / rozpiska")}<select id="atlas-exercise"><option value="0">${msg("All classes", "Wszystkie ćwiczenia")}</option><option value="1">1 · ${msg("Axial skeleton", "Kościec osiowy")}</option><option value="2">2 · ${msg("Limb bones and landmarks", "Kości kończyn i punkty kostne")}</option><option value="3">3 · ${msg("Joints", "Stawy")}</option><option value="4">4 · ${msg("Trunk muscles", "Mięśnie tułowia")}</option><option value="5">5 · ${msg("Upper limb muscles", "Mięśnie kończyny górnej")}</option><option value="6">6 · ${msg("Lower limb muscles", "Mięśnie kończyny dolnej")}</option><option value="7">7 · ${msg("Brachial plexus and nerves", "Splot ramienny i nerwy")}</option><option value="8">8 · ${msg("Lumbar / sacral nerves", "Nerwy lędźwiowe i krzyżowe")}</option></select></label><label>${msg("Region", "Okolica")}<select id="atlas-region">${(["all", "upper", "lower", "trunk", "head"] satisfies Region[]).map((r) => `<option value="${r}">${escapeHtml(regionNames[r])}</option>`).join("")}</select></label><label>${msg("System", "Układ")}<select id="atlas-system"><option value="all">${msg("All systems", "Wszystkie układy")}</option>${(["skeletal", "muscular", "articular", "nervous"] satisfies System[]).map((s) => `<option value="${s}">${systemNames[s]}</option>`).join("")}</select></label></div>
  <div id="book-range" class="book-range" ${this.mode === "book" ? "" : "hidden"}><label>${msg("Category (automatic)", "Kategoria (automatyczna)")}<select id="book-category"><option value="all">${msg("All categories", "Wszystkie kategorie")}</option>${bookCategories.map((category) => `<option value="${category}">${category === "other" ? msg("Other / unclassified", "Pozostałe / nierozpoznane") : systemNames[category]}</option>`).join("")}</select></label><label>${msg("PDF pages from", "Strony PDF od")}<input id="book-first" type="number" min="1" max="362" value="${this.firstPage}"></label><label>${msg("to", "do")}<input id="book-last" type="number" min="1" max="362" value="${this.lastPage}"></label><button id="book-apply">${msg("Apply range", "Zastosuj zakres")}</button><button id="book-reset" ${this.study().excludedBookQuestions.length ? "" : "hidden"}>${msg(`Restore excluded (${this.study().excludedBookQuestions.length})`, `Przywróć wykluczone (${this.study().excludedBookQuestions.length})`)}</button><p class="fineprint">${msg("Type the name for the printed number. The outlined legend identifies the relevant figure. Reveal the original answer and page commentary, then assess yourself. OCR locates labels; it does not grade your answer.", "Wpisz nazwę dla numeru z atlasu. Obrys legendy wskazuje właściwą rycinę. Odkryj oryginalny podpis i komentarz strony, potem oceń odpowiedź. OCR lokalizuje podpisy; nie ocenia odpowiedzi.")}</p></div><div class="photo-layout"><section class="photo-stage"><div id="atlas-empty" ${this.doc ? "hidden" : ""}><svg width="64" viewBox="0 0 80 90" aria-hidden="true"><path d="M10 3h40l20 20v63H10zM50 3v22h20M25 43h30M25 55h30M25 67h18" fill="none" stroke="currentColor" stroke-width="2"/></svg><h2>${msg("Practise on real atlas photographs", "Ćwicz na prawdziwych zdjęciach z atlasu")}</h2><p>${msg(`Add your McMinn PDF to practise numbered structures throughout the book, or use the ${starterPins.length} prepared pins with original explanations and selected 3D links. The exact source scan is required.`, `Dodaj przesłany PDF McMinna, aby ćwiczyć numerowane struktury w całej książce, albo wybierz ${starterPins.length} gotowych szpilek z objaśnieniami i wybranymi połączeniami z 3D. Wymagany jest ten sam skan.`)}</p><p class="fineprint">${msg("The PDF stays in this browser. It is never uploaded. The public app contains points and explanations, not the book scans.", "PDF pozostaje w tej przeglądarce i nie jest wysyłany. Publiczna aplikacja zawiera punkty i objaśnienia, bez skanów książek.")}</p></div><div class="photo-canvas-wrap" id="atlas-image" ${this.doc ? "" : "hidden"}><canvas id="atlas-canvas"></canvas><div id="photo-pin" class="photo-pin" hidden><span>1</span><b></b></div></div><p id="atlas-status" role="status" class="fineprint"></p><div class="photo-page-controls" ${this.doc ? "" : "hidden"}><button id="atlas-enlarge" disabled>${msg("Enlarge photograph", "Powiększ zdjęcie")}</button><button id="atlas-annotate">${msg("Add my own pin", "Dodaj własną szpilkę")}</button><label>${msg("PDF page", "Strona PDF")}<input id="atlas-page" type="number" min="1" value="${this.page}" max="${this.doc?.numPages ?? 1}"></label><button id="atlas-open-page">${msg("Open page", "Otwórz stronę")}</button></div></section>
  <aside class="photo-question-panel"><span class="status-tag">${msg("Photo recognition", "Rozpoznawanie preparatów")}</span><h2>${this.question && "kind" in this.question ? msg(`Identify number ${this.question.number}`, `Rozpoznaj numer ${this.question.number}`) : msg("What does the pin indicate?", "Co wskazuje szpilka?")}</h2><p id="photo-pool" class="fineprint"></p><label class="checkbox-row"><input id="photo-early" type="checkbox">${msg("Practise before due date", "Ćwicz też przed terminem")}</label><label class="checkbox-row"><input id="photo-mistakes" type="checkbox">${msg("Only my mistakes", "Tylko moje błędy")}</label><div id="photo-answer-area" ${this.question ? "" : "hidden"}><form id="photo-answer-form"><label for="photo-answer">${msg("Polish, Latin or English name", "Nazwa polska, łacińska lub angielska")}</label><input id="photo-answer" data-question-id="${this.question?.id ?? ""}" autocomplete="off" spellcheck="false" placeholder="${msg("Type the structure name", "Wpisz nazwę struktury")}"><button id="photo-check" type="submit">${this.mode === "book" ? msg("Reveal and compare", "Odkryj i porównaj") : msg("Check answer", "Sprawdź")}</button><label for="photo-reasoning">${msg("Why do you think it is this structure? (optional)", "Dlaczego uważasz, że to ta struktura? (opcjonalnie)")}</label><textarea id="photo-reasoning" maxlength="4000" rows="3" placeholder="${msg("Landmarks, course, attachments, neighbouring structures…", "Punkty orientacyjne, przebieg, przyczepy, sąsiednie struktury…")}"></textarea></form><button id="photo-reveal" class="text-button">${msg("Reveal answer", "Pokaż odpowiedź")}</button><div id="photo-feedback" aria-live="polite"></div><div class="button-row" id="photo-self-grade" hidden></div></div><button id="photo-draw" class="primary wide">${msg(this.question ? "Next photograph →" : "Draw a photograph", this.question ? "Następne zdjęcie →" : "Losuj zdjęcie")}</button><button id="photo-finish" class="text-button">${msg("Finish session", "Zakończ sesję")}</button><p class="fineprint">${msg("Whole-book questions use the original Polish/Latin source captions and manual grading. Prepared pins include bilingual explanations. Automatically located labels have not been individually reviewed.", "Pytania z całej książki korzystają z oryginalnych polskich i łacińskich podpisów oraz samooceny. Gotowe szpilki mają dwujęzyczne objaśnienia. Automatycznie zlokalizowane podpisy nie przeszły indywidualnej weryfikacji.")}</p></aside></div>
  <dialog id="photo-pin-dialog"><form id="photo-pin-form"><h2>${msg("New photo pin", "Nowa szpilka fotograficzna")}</h2><label>English<input id="custom-en" required maxlength="180"></label><label>Polski<input id="custom-pl" required maxlength="180"></label><label>Latin<input id="custom-latin" required maxlength="180"></label><label>${msg("How to recognise it (English)", "Jak rozpoznać (po angielsku)")}<textarea id="custom-recognize-en" required maxlength="1600"></textarea></label><label>${msg("How to recognise it (Polish)", "Jak rozpoznać (po polsku)")}<textarea id="custom-recognize-pl" required maxlength="1600"></textarea></label><label>${msg("Connections / theory (English)", "Powiązania / teoria (po angielsku)")}<textarea id="custom-theory-en" required maxlength="2400"></textarea></label><label>${msg("Connections / theory (Polish)", "Powiązania / teoria (po polsku)")}<textarea id="custom-theory-pl" required maxlength="2400"></textarea></label><p class="fineprint">${msg("The current region, system and class filters are used for this pin. Set a specific class and system before adding one.", "Szpilka otrzyma aktualną okolicę, układ i ćwiczenie z filtrów. Przed dodaniem wybierz konkretne ćwiczenie i układ.")}</p><div class="button-row"><button id="custom-cancel" type="button">${msg("Cancel", "Anuluj")}</button><button type="submit" class="primary">${msg("Save pin", "Zapisz szpilkę")}</button></div></form></dialog>`;
    this.root
      .querySelectorAll<HTMLButtonElement>("[data-import-atlas]")
      .forEach((button) => {
        button.onclick = () =>
          this.node("#atlas-upload", HTMLInputElement).click();
      });
    this.root
      .querySelectorAll<HTMLButtonElement>("[data-atlas-preview]")
      .forEach((button) => {
        button.onclick = () =>
          this.openPreview(button.dataset.atlasPreview ?? "");
      });
    this.node("#book-category", HTMLSelectElement).value = this.bookCategory;
    this.node("#book-category", HTMLSelectElement).onchange = () => {
      const value = this.node("#book-category", HTMLSelectElement).value;
      const category = bookCategories.find((item) => item === value);
      this.bookCategory = category ?? "all";
      this.scopeChanged();
    };
    this.node("#atlas-mode", HTMLSelectElement).value = this.mode;
    for (const selector of [
      "#atlas-exercise",
      "#atlas-region",
      "#atlas-system",
    ])
      this.node(selector, HTMLSelectElement)
        .closest("label")
        ?.toggleAttribute("hidden", this.mode === "book");
    this.node("#atlas-annotate", HTMLButtonElement).disabled =
      this.mode === "book";
    this.node("#atlas-mode", HTMLSelectElement).onchange = () => {
      this.mode =
        this.node("#atlas-mode", HTMLSelectElement).value === "book"
          ? "book"
          : "pins";
      this.scopeChanged();
    };
    this.node("#book-reset", HTMLButtonElement).onclick = () => {
      this.study().excludedBookQuestions = [];
      this.persist();
      this.render();
      if (this.doc) void this.draw();
    };
    this.node("#book-apply", HTMLButtonElement).onclick = () => {
      const first = this.node("#book-first", HTMLInputElement).valueAsNumber;
      const last = this.node("#book-last", HTMLInputElement).valueAsNumber;
      if (
        !Number.isInteger(first) ||
        !Number.isInteger(last) ||
        first < 1 ||
        last > 362 ||
        first > last
      ) {
        this.notify(
          msg(
            "Choose a valid PDF page range (1–362).",
            "Wybierz prawidłowy zakres stron PDF (1–362).",
          ),
        );
        return;
      }
      this.firstPage = first;
      this.lastPage = last;
      this.scopeChanged();
    };
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
      if ("kind" in this.question) {
        this.reveal();
        return;
      }
      const feedback = answerFeedback(
        this.node("#photo-answer", HTMLInputElement).value,
        [this.question.pl, this.question.en, this.question.latin],
      );
      this.reveal();
      const note = document.createElement("p");
      note.textContent =
        feedback === "exact"
          ? msg(
              "Name matches. Choose how well you remembered it.",
              "Nazwa jest zgodna. Oceń, jak dobrze ją pamiętasz.",
            )
          : feedback === "typo"
            ? msg(
                "Possible typo. Compare the answer and choose a rating; no failure has been recorded.",
                "Możliwa literówka. Porównaj odpowiedź i wybierz ocenę; nie zapisano błędu.",
              )
            : msg(
                "Compare your answer with the explanation, then rate your recall.",
                "Porównaj odpowiedź z objaśnieniem i oceń swoją znajomość.",
              );
      this.node("#photo-feedback", HTMLDivElement).prepend(note);
    };
    this.node("#photo-answer", HTMLInputElement).oninput = () => this.persist();
    this.node("#photo-reasoning", HTMLTextAreaElement).oninput = () =>
      this.persist();
    this.node("#photo-early", HTMLInputElement).checked = this.earlyReview;
    this.node("#photo-early", HTMLInputElement).onchange = () => {
      this.earlyReview = this.node("#photo-early", HTMLInputElement).checked;
      this.scopeChanged();
    };
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
    this.node("#atlas-enlarge", HTMLButtonElement).onclick = () =>
      this.enlargePage();
    this.node("#atlas-annotate", HTMLButtonElement).onclick = () => {
      this.browsing = false;
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
        if (activeSession(this.study())?.source === "photo")
          endSession(this.study());
        this.question = null;
        this.revealed = false;
        this.graded = false;
        this.annotate = false;
        this.browsing = true;
        this.persist();
        this.render();
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
      this.node("#photo-reasoning", HTMLTextAreaElement).value =
        session?.reasoning ?? "";
      if (this.revealed) this.showExplanation();
    }
  }
  private openPreview(id: string): void {
    const atlas = atlasLibrary.find((item) => item.id === id);
    if (!atlas?.preview) return;
    const dialog = this.node("#atlas-preview-dialog", HTMLDialogElement);
    dialog.innerHTML = `<div class="dialog-header"><h2>${atlas.title} · Google Drive</h2><button id="atlas-preview-close">${msg("Close", "Zamknij")}</button></div><p class="fineprint">${msg("Preview unavailable?", "Podgląd niedostępny?")} <a href="${atlas.url}" target="_blank" rel="noopener noreferrer">${msg("Open the atlas in Google Drive", "Otwórz atlas w Google Drive")} ↗</a></p>`;
    const frame = document.createElement("iframe");
    frame.title = `${atlas.title} · ${msg("PDF preview", "podgląd PDF")}`;
    frame.src = atlasPreviewUrl(atlas);
    frame.allowFullscreen = true;
    frame.referrerPolicy = "no-referrer";
    dialog.append(frame);
    this.node("#atlas-preview-close", HTMLButtonElement).onclick = () =>
      dialog.close();
    dialog.onclose = () => dialog.replaceChildren();
    dialog.showModal();
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
  private pool(): (PhotoPin | BookQuestion)[] {
    if (this.mode === "book")
      return this.file?.id === mcminnId && this.book
        ? bookPool(this.book, this.firstPage, this.lastPage).filter(
            (q) =>
              !this.study().excludedBookQuestions.includes(q.id) &&
              (this.bookCategory === "all" || q.category === this.bookCategory),
          )
        : [];
    return this.pins.filter(
      (p): p is PhotoPin =>
        !("kind" in p) &&
        p.atlasId === this.file?.id &&
        (this.region === "all" || p.region === this.region) &&
        (this.system === "all" || p.system === this.system) &&
        (!this.exercise || p.exercise === this.exercise),
    );
  }
  private poolLabel(): void {
    const pool = this.pool();
    const count = pool.length;
    const pageCount = new Set(pool.map((q) => q.page)).size;
    this.node("#photo-pool", HTMLParagraphElement).textContent =
      this.mode === "book"
        ? msg(
            `${count} numbered questions on ${pageCount} PDF ${pageCount === 1 ? "page" : "pages"} in this range. All 362 pages are available in the page browser.`,
            `${count} pytań z numerami na ${pageCount} ${pageCount === 1 ? "stronie" : "stronach"} PDF w tym zakresie. Wszystkie 362 strony są dostępne w przeglądarce stron.`,
          )
        : msg(
            `${count} checked pins in this atlas and scope.`,
            `${count} sprawdzonych szpilek w tym atlasie i zakresie.`,
          );
    const mistakes = new Set(latestMistakes(this.study().reviews));
    const candidates = pool.map((pin) => ({
      id: `photo:${pin.atlasId}:${pin.id}`,
    }));
    const queue = reviewQueue(
      this.onlyMistakes
        ? candidates.filter((item) => mistakes.has(item.id))
        : candidates,
      this.study().schedules,
      Date.now(),
      this.earlyReview,
    );
    this.node("#photo-pool", HTMLParagraphElement).textContent += msg(
      ` Due now: ${queue.due}; new: ${queue.fresh}.`,
      ` Teraz do powtórki: ${queue.due}; nowych: ${queue.fresh}.`,
    );
    if (!queue.due && !queue.fresh && queue.nextDue !== null)
      this.node("#photo-pool", HTMLParagraphElement).textContent += msg(
        ` Next: ${new Date(queue.nextDue).toLocaleString("en-GB")}.`,
        ` Najbliższa: ${new Date(queue.nextDue).toLocaleString("pl-PL")}.`,
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
            `McMinn recognised: whole-book practice and ${starterPins.length} prepared pins are ready.`,
            `McMinn rozpoznany: nauka z całej książki i ${starterPins.length} gotowych szpilek są dostępne.`,
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
      try {
        if (file.id === mcminnId && !this.book) this.book = await loadBook();
      } catch (error) {
        await task.destroy();
        throw error;
      }
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
      this.browsing = false;
      if (resume) {
        const session = activeSession(this.study());
        this.question =
          this.pins.find(
            (p) => p.id === session?.questionId && p.atlasId === file.id,
          ) ?? null;
        this.page = this.question?.page ?? this.page;
        this.revealed = session?.revealed ?? false;
        this.graded = session?.graded ?? false;
        this.region = session?.photoFilters?.region ?? "all";
        this.system = session?.photoFilters?.system ?? "all";
        this.exercise =
          session?.photoFilters?.exercise ??
          (this.question && !("kind" in this.question)
            ? this.question.exercise
            : 0);
        this.onlyMistakes = session?.photoFilters?.onlyMistakes ?? false;
        this.earlyReview = session?.photoFilters?.earlyReview ?? false;
        this.mode =
          session?.photoFilters?.mode ??
          (this.question && "kind" in this.question ? "book" : "pins");
        this.bookCategory = session?.photoFilters?.bookCategory ?? "all";
        this.firstPage = session?.photoFilters?.firstPage ?? 1;
        this.lastPage = session?.photoFilters?.lastPage ?? 362;
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
    const page =
      this.annotate || this.browsing ? this.page : (pin?.page ?? this.page);
    const pdfPage = await this.doc.getPage(page);
    const viewport = pdfPage.getViewport({
      scale: pin && "kind" in pin ? 3 : 2,
    });
    const full = document.createElement("canvas");
    full.width = viewport.width;
    full.height = viewport.height;
    const context = full.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    await pdfPage.render({ canvas: full, canvasContext: context, viewport })
      .promise;
    if (
      page === 125 &&
      !this.annotate &&
      !this.browsing &&
      pin &&
      !("kind" in pin)
    ) {
      context.fillStyle = "white";
      context.fillRect(
        0,
        full.height * 0.53,
        full.width * 0.28,
        full.height * 0.32,
      );
    }
    if (pin && !("kind" in pin) && !this.annotate && !this.browsing) {
      context.fillStyle = "white";
      for (const mask of pin.masks ?? []) {
        context.fillRect(
          mask.x * full.width,
          mask.y * full.height,
          mask.w * full.width,
          mask.h * full.height,
        );
      }
    }
    if (sequence !== this.drawSequence) return;
    const printed = pin && "kind" in pin ? pin : null;
    const paintBox = (box: PageBox, fill: boolean): void => {
      if (fill)
        context.fillRect(
          box.x * full.width,
          box.y * full.height,
          box.w * full.width,
          box.h * full.height,
        );
      else
        context.strokeRect(
          box.x * full.width,
          box.y * full.height,
          box.w * full.width,
          box.h * full.height,
        );
    };
    if (printed && this.question && !this.annotate && !this.browsing) {
      if (this.revealed) {
        const answer = this.root.querySelector("#book-answer");
        if (answer instanceof HTMLCanvasElement) {
          const box = printed.answer;
          answer.width = Math.round(full.width * box.w);
          answer.height = Math.round(full.height * box.h);
          answer
            .getContext("2d")
            ?.drawImage(
              full,
              box.x * full.width,
              box.y * full.height,
              answer.width,
              answer.height,
              0,
              0,
              answer.width,
              answer.height,
            );
        }
      } else {
        context.fillStyle = "white";
        for (const mask of this.book?.pages.find((p) => p.page === page)
          ?.masks ?? [])
          paintBox(mask, true);
        paintBox(printed.legend, true);
      }
      context.strokeStyle = "#b13b31";
      context.lineWidth = 3;
      paintBox(this.revealed ? printed.answer : printed.legend, false);
    }
    const crop =
      this.annotate || this.browsing || !pin || "kind" in pin
        ? { x: 0, y: 0, w: 1, h: 1 }
        : pin.crop;
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
    if (printed && this.revealed && !this.annotate && !this.browsing) {
      const zoom = this.root.querySelector("#book-source-zoom");
      if (zoom instanceof HTMLButtonElement) zoom.disabled = false;
    }
    this.node("#atlas-enlarge", HTMLButtonElement).disabled = false;
    full.width = 0;
    full.height = 0;
    const marker = this.node("#photo-pin", HTMLDivElement);
    marker.hidden =
      !pin || "kind" in pin || this.annotate || this.browsing || !this.question;
    if (pin && !("kind" in pin) && !this.annotate) {
      marker.style.left = `${((pin.x - crop.x) / crop.w) * 100}%`;
      marker.style.top = `${((pin.y - crop.y) / crop.h) * 100}%`;
    }
    this.node("#atlas-image", HTMLDivElement).hidden = false;
    this.node("#atlas-empty", HTMLDivElement).hidden = true;
    this.node("#atlas-page", HTMLInputElement).value = String(page);
    this.page = page;
    this.node("#atlas-status", HTMLParagraphElement).textContent =
      !this.question && !this.annotate
        ? msg(
            `PDF page ${page}. Draw a card to start practice.`,
            `Strona PDF ${page}. Wylosuj fiszkę, aby rozpocząć ćwiczenie.`,
          )
        : this.browsing
          ? msg(
              `Source PDF · page ${page} of ${this.doc.numPages}.`,
              `Źródłowy PDF · strona ${page} z ${this.doc.numPages}.`,
            )
          : this.annotate
            ? msg(
                "Click the exact structure to add a pin.",
                "Kliknij dokładnie w strukturę, aby dodać szpilkę.",
              )
            : printed
              ? msg(
                  `PDF page ${page} · find printed number ${printed.number} in the figure associated with the outlined legend. ${this.revealed ? "Original captions and commentary are visible." : "Captions are masked automatically; report any visible answer."}`,
                  `Strona PDF ${page} · znajdź numer ${printed.number} na rycinie odpowiadającej obrysowanej legendzie. ${this.revealed ? "Widoczne są oryginalne podpisy i komentarz." : "Podpisy ukryto automatycznie; zgłoś widoczną odpowiedź."}`,
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
    const candidates = this.pool().map((pin) => ({
      id: `photo:${pin.atlasId}:${pin.id}`,
      pin,
    }));
    const mistakes = new Set(latestMistakes(data.reviews));
    const queue = reviewQueue(
      this.onlyMistakes
        ? candidates.filter((c) => mistakes.has(c.id))
        : candidates,
      data.schedules,
      Date.now(),
      this.earlyReview,
    );
    const pin = nextQuestion(
      queue.items,
      previous ? `photo:${this.file.id}:${previous}` : null,
      data.reviews,
      this.onlyMistakes,
    )?.pin;
    if (!pin && queue.nextDue !== null) {
      this.notify(
        msg(
          `No cards due now. Next review: ${new Date(queue.nextDue).toLocaleString("en-GB")}. Enable early practice if needed.`,
          `Teraz nie ma kart do powtórki. Najbliższa: ${new Date(queue.nextDue).toLocaleString("pl-PL")}. Możesz włączyć ćwiczenie przed terminem.`,
        ),
      );
      return;
    }
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
      earlyReview: this.earlyReview,
      mode: this.mode,
      bookCategory: this.bookCategory,
      firstPage: this.firstPage,
      lastPage: this.lastPage,
    };
    session.atlasId = this.file.id;
    session.questionId = pin.id;
    session.questionCount++;
    session.draft = "";
    session.reasoning = "";
    session.revealed = false;
    session.graded = false;
    session.deadline = null;
    this.question = pin;
    this.page = pin.page;
    this.revealed = false;
    this.graded = false;
    this.annotate = false;
    this.browsing = false;
    this.render();
    this.persist();
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
    if (this.question && "kind" in this.question)
      void this.draw().catch((error) => {
        console.error(error);
        this.notify(
          msg(
            "Could not display the source answer.",
            "Nie udało się wyświetlić odpowiedzi ze źródła.",
          ),
        );
      });
  }
  private showExplanation(): void {
    const pin = this.question;
    if (!pin) return;
    const lang = getLanguage();
    this.node("#photo-answer", HTMLInputElement).disabled = true;
    this.node("#photo-reasoning", HTMLTextAreaElement).disabled = true;
    this.node("#photo-check", HTMLButtonElement).disabled = true;
    this.node("#photo-reveal", HTMLButtonElement).hidden = true;
    const ratingRoot = this.node("#photo-self-grade", HTMLDivElement);
    ratingRoot.hidden = this.graded;
    ratingRoot.innerHTML = ratingButtons(
      this.study().schedules[`photo:${pin.atlasId}:${pin.id}`],
      lang,
    );
    ratingRoot
      .querySelectorAll<HTMLButtonElement>("[data-review-rating]")
      .forEach(
        (button) =>
          (button.onclick = () => {
            const rating = ratingSchema.parse(
              Number(button.dataset.reviewRating),
            );
            this.grade(rating);
          }),
      );
    if ("kind" in pin) {
      this.node("#photo-feedback", HTMLDivElement).innerHTML =
        `<div class="revealed-answer"><strong>${escapeHtml(questionName(pin, lang))}</strong><p>${msg("Your answer", "Twoja odpowiedź")}: ${escapeHtml(activeSession(this.study())?.draft ?? "")}</p></div><section class="photo-theory"><h3>${msg("Original source answer", "Oryginalna odpowiedź ze źródła")}</h3><canvas id="book-answer" aria-label="${msg("Original caption from your local PDF", "Oryginalny podpis z lokalnego PDF-a")}"></canvas><p>${msg("Compare your answer with the caption above, then choose a rating from 1 to 4. The full page now shows the source commentary and nearby structures. This mode uses the original Polish/Latin text; no automatic translation or generated anatomy is substituted.", "Porównaj odpowiedź z podpisem powyżej i wybierz ocenę od 1 do 4. Pełna strona pokazuje teraz komentarz z atlasu i sąsiednie struktury. Ten tryb korzysta z oryginalnego tekstu polskiego i łacińskiego, bez automatycznego tłumaczenia ani generowanej anatomii.")}</p><button id="book-exclude">${msg("Wrong caption / exclude question", "Błędny podpis / wyklucz pytanie")}</button><button id="book-source-zoom" disabled>${msg("Enlarge source page", "Powiększ stronę źródłową")}</button><p class="fineprint">${msg("Automatically located caption. If the number or crop is wrong, skip the question without grading it.", "Podpis zlokalizowany automatycznie. Jeżeli numer lub wycinek jest błędny, pomiń pytanie bez oceniania.")}</p></section>`;
      this.node("#book-exclude", HTMLButtonElement).onclick = () => {
        const excluded = this.study().excludedBookQuestions;
        if (!excluded.includes(pin.id)) excluded.push(pin.id);
        this.persist();
        const session = activeSession(this.study());
        if (session?.source === "photo") {
          session.questionId = null;
          session.draft = "";
          session.reasoning = "";
          session.revealed = false;
          session.graded = false;
        }
        this.question = null;
        this.revealed = false;
        this.graded = false;
        this.persist();
        this.render();
        this.notify(
          msg(
            "Question excluded on this device. You can restore excluded questions above.",
            "Pytanie wykluczone na tym urządzeniu. Możesz przywrócić wykluczone pytania nad zdjęciem.",
          ),
        );
        void this.random();
      };
      this.node("#book-source-zoom", HTMLButtonElement).onclick = () =>
        this.enlargePage();
      return;
    }
    this.node("#photo-feedback", HTMLDivElement).innerHTML =
      `<div class="revealed-answer"><span>${msg("Pinned structure", "Wskazana struktura")}</span><strong>${escapeHtml(photoName(pin, lang))}</strong><em lang="la">${escapeHtml(pin.latin)}</em></div><section class="photo-theory"><h3>${msg("How to recognise it", "Jak ją rozpoznać")}</h3><p>${escapeHtml(pin.recognize[lang])}</p><h3>${msg("Connections and theory", "Powiązania i teoria")}</h3><p>${escapeHtml(pin.theory[lang])}</p><p class="fineprint">${escapeHtml(pin.source)}</p>${pin.modelId ? `<button id="photo-to-3d">${msg("Show in 3D", "Pokaż w 3D")} ↗</button><p class="fineprint">${msg(pin.system === "skeletal" ? "Opens the corresponding bone. The photographic landmark is not a separately labelled 3D mesh." : "Opens the related structure in its spatial context. The explanation identifies links to a whole muscle or one component.", pin.system === "skeletal" ? "Otwiera odpowiadającą kość. Punkt kostny ze zdjęcia nie jest osobno opisanym elementem siatki 3D." : "Otwiera powiązaną strukturę w kontekście przestrzennym. Objaśnienie wskazuje połączenia z całym mięśniem lub jego częścią.")}</p>` : ""}</section>`;
    const link = this.root.querySelector("#photo-to-3d");
    if (link instanceof HTMLButtonElement)
      link.onclick = () => {
        void this.show3d(pin);
      };
  }
  private enlargePage(): void {
    const canvas = this.node("#atlas-canvas", HTMLCanvasElement);
    const dialog = document.createElement("dialog");
    dialog.className = "book-source-dialog";
    const close = document.createElement("button");
    close.textContent = msg("Close", "Zamknij");
    close.onclick = () => dialog.close();
    const image = document.createElement("img");
    image.src = canvas.toDataURL("image/png");
    image.alt = msg("Current atlas page", "Aktualna strona atlasu");
    dialog.append(close, image);
    dialog.onclose = () => dialog.remove();
    this.root.append(dialog);
    dialog.showModal();
  }
  private grade(rating: StudyRating): void {
    if (!this.question || this.graded) return;
    const data = this.study();
    const session = activeSession(data);
    if (!session || session.source !== "photo") return;
    const id = `photo:${this.question.atlasId}:${this.question.id}`;
    this.persist();
    try {
      recordRatedReview(data, id, rating, session.id, session.reasoning);
    } catch (error) {
      console.error(error);
      this.notify(
        msg(
          "Could not save the review. Export your data.",
          "Nie udało się zapisać oceny. Spróbuj ponownie lub wyeksportuj dane.",
        ),
      );
      return;
    }
    this.graded = true;
    this.reveal();
    this.poolLabel();
    const card = data.schedules[id];
    if (card) {
      const status = document.createElement("p");
      status.className = rating === 1 ? "grade-wrong" : "grade-correct";
      status.textContent = msg(
        `Rating ${rating}/4 · next review in ${intervalLabel(card.due, Date.now(), "en")}.`,
        `Ocena ${rating}/4 · kolejna powtórka za ${intervalLabel(card.due, Date.now(), "pl")}.`,
      );
      this.node("#photo-feedback", HTMLDivElement).prepend(status);
    }
  }
  private persist(): void {
    const data = this.study();
    const session = activeSession(data);
    if (session?.source === "photo" && this.question) {
      session.questionId = this.question.id;
      const input = this.node("#photo-answer", HTMLInputElement);
      saveQuestionDraft(
        session,
        input.dataset.questionId,
        input.value,
        this.node("#photo-reasoning", HTMLTextAreaElement).value,
      );
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

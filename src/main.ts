import { autoReviewName } from "./auto-pins";
import { reviewQueue, ratingSchema, intervalLabel } from "./repetition";
import type { StudyRating } from "./repetition";
import { ratingButtons } from "./review-ui";
import { saveQuestionDraft } from "./question-draft";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import { PhotoPractice } from "./photos";
import { photoName } from "./photo-data";
import { bookReviewName, questionName } from "./atlas-book";
import {
  getLanguage,
  setLanguage,
  translateUi,
  observeTranslations,
} from "./i18n";
import "@fontsource/ibm-plex-sans/latin-ext-400.css";
import "@fontsource/ibm-plex-sans/latin-ext-500.css";
import "@fontsource/ibm-plex-sans/latin-ext-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./style.css";
import {
  createIcons,
  Box,
  ScanLine,
  ChartNoAxesColumn,
  CircleHelp,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Maximize,
  Plus,
  Minus,
  Scan,
  MousePointer2,
  Pin,
  ArrowRight,
  Shuffle,
  Focus,
  EyeOff,
  Layers,
} from "lucide";
const icons = {
  Box,
  ScanLine,
  ChartNoAxesColumn,
  CircleHelp,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Maximize,
  Plus,
  Minus,
  Scan,
  MousePointer2,
  Pin,
  ArrowRight,
  Shuffle,
  Focus,
  EyeOff,
  Layers,
};
import {
  answerFeedback,
  escapeHtml,
  inRegion,
  latestMistakes,
  manifestSchema,
  nextQuestion,
  regionNames,
  systemColors,
  systemNames,
  systems,
} from "./domain";
import type { Manifest, Region, Sex, System } from "./domain";
import { acceptedNames, displayName, polishName } from "./names";
import {
  exportStudy,
  readStudy,
  recordRatedReview,
  saveStudy,
  emptyStudy,
  activeSession,
  startSession,
  endSession,
  parseStudy,
  mergeStudy,
} from "./storage";
import type { StudyData, Preferences } from "./storage";
import { AnatomyViewer } from "./viewer";
import type { Layer, Structure } from "./viewer";

function get<T extends HTMLElement>(selector: string, type: { new (): T }): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type))
    throw new Error(`Missing element: ${selector}`);
  return element;
}
const root = get("#app", HTMLDivElement);
root.innerHTML = `
<header class="app-header"><a class="brand" href="#atlas" aria-label="Szpilki, atlas anatomii"><svg width="30" height="34" viewBox="0 0 36 40" aria-hidden="true"><circle cx="24" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="m19 18-14 18m5-7-2-6m2 6 6 1" stroke="currentColor" stroke-width="2.5" fill="none"/></svg><span>szpilki<span class="brand-dot">.</span></span></a><nav class="main-tabs" aria-label="Tryb aplikacji"><button data-view="atlas" class="active"><i data-lucide="box"></i>Atlas 3D</button><button data-view="photos"><i data-lucide="scan-line"></i>Preparaty z atlasu</button><button data-view="progress"><i data-lucide="chart-no-axes-column"></i>Moja nauka</button></nav><label class="language-control"><span class="sr-only">Language / Język</span><select id="language" aria-label="Language / Język"><option value="en">EN</option><option value="pl">PL</option></select></label><button class="icon-button" id="help" aria-label="Pomoc i źródła"><i data-lucide="circle-help"></i></button></header>
<div id="atlas-view" class="atlas-layout"><aside class="sidebar"><button class="close-sidebar" id="close-controls" aria-label="Zamknij zakres i warstwy">×</button><div class="sidebar-heading"><h2>Atlas anatomii</h2><span class="muted">Odkrywaj. Odsłaniaj. Zapamiętuj.</span></div>
<div class="sidebar-section"><p id="coverage-note" class="fineprint">Model całego ciała · Z-Anatomy</p></div>
<div class="sidebar-section"><label for="region">Zakres nauki</label><select id="region">${Object.entries(
  regionNames,
)
  .map(
    ([k, v]) =>
      `<option value="${k}" ${k === "exam" ? "selected" : ""}>${v}</option>`,
  )
  .join(
    "",
  )}</select><p class="fineprint">Ćwiczenia 1–8: kości, stawy, mięśnie i nerwy.</p></div>
<div class="sidebar-section"><div class="section-title"><h2>Warstwy i układy</h2><button id="restore" title="Przywróć ukryte struktury" aria-label="Przywróć ukryte struktury"><i data-lucide="rotate-ccw"></i></button></div><label for="layer-preset" class="sr-only">Zestaw warstw</label><select id="layer-preset"><option value="muscles">Kości + mięśnie</option><option value="bones">Sam kościec</option><option value="joints">Kości + stawy</option><option value="nerves">Kości + nerwy</option><option value="exam">Wszystkie 4 układy egzaminacyjne</option><option value="all">Wszystkie dostępne układy</option><option value="custom" hidden>Własny zestaw</option></select><div id="layers"></div><details class="depth-details"><summary>Grupy mięśni</summary><label for="muscle-depth" class="sr-only">Grupy mięśni</label><select id="muscle-depth"><option value="all">Wszystkie grupy</option><option value="deep">Grupy oznaczone jako głębokie</option><option value="superficial">Pozostałe grupy</option></select><p class="fineprint">Podział według hierarchii atlasu; nie jest to symulacja kolejnych cięć preparatu. Przyczepy jako osobne siatki są pomijane.</p></details></div>
<div class="sidebar-section structure-section"><div class="section-title"><h2>Struktury</h2><span id="structure-count" class="count">0</span></div><label for="structure-search" class="sr-only">Szukaj struktury po polsku, łacinie lub angielsku</label><div class="search-field"><i data-lucide="search"></i><input id="structure-search" placeholder="Szukaj: femur, nerw…" autocomplete="off"></div><div id="structures" class="structure-list"></div><button id="more-structures" class="text-button" hidden>Pokaż kolejne 60</button></div>
<div class="sidebar-footer"><span class="connection-dot"></span> Bez konta. Postępy na urządzeniu.<button id="sources-link">Źródła i zakres atlasu ↗</button></div></aside>
<main class="work-sheet"><div class="viewer-header"><div><h1 class="canvas-title">Atlas anatomii</h1><button id="open-controls" class="mobile-controls"><i data-lucide="sliders-horizontal"></i> Zakres i warstwy</button><span class="breadcrumb">Pracownia <span>/</span> <strong id="region-title">Kolokwium · od szyi w dół</strong></span></div><div class="viewer-header-right"><span id="visible-count" class="muted">Ładowanie modelu…</span><button id="fullscreen" class="icon-button" aria-label="Pełny ekran modelu"><i data-lucide="maximize"></i></button></div></div>
<div class="workspace"><section class="model-area" aria-label="Model 3D"><div class="model-canvas" id="model-host"><div id="pin" class="anatomy-pin" hidden><span>1</span><b></b></div><div class="canvas-heading"><span id="model-caption">Z-Anatomy · model męski</span><span class="view-label" id="view-label">Widok przedni</span></div><div id="viewer-status" class="viewer-status"><span class="spinner"></span><strong>Przygotowuję preparat…</strong><span>Wczytuję rzeczywiste siatki anatomiczne.</span></div><div id="hover-label" class="hover-label" hidden></div><div class="orientation"><span>S</span><span>L</span><span>P</span><span>I</span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4v32M4 20h32" stroke="currentColor" fill="none"/><circle cx="20" cy="20" r="3" fill="currentColor"/></svg></div><div class="zoom-controls"><button id="zoom-in" aria-label="Powiększ"><i data-lucide="plus"></i></button><button id="zoom-out" aria-label="Pomniejsz"><i data-lucide="minus"></i></button><button id="fit" aria-label="Dopasuj model"><i data-lucide="scan"></i></button></div><div class="view-controls" aria-label="Kierunek widoku"><button data-direction="front" class="active">Przód</button><button data-direction="back">Tył</button><button data-direction="left">Lewy bok</button><button data-direction="right">Prawy bok</button></div></div><footer class="canvas-footer"><span><i data-lucide="mouse-pointer-2"></i> Przeciągnij, aby obrócić · przewiń, aby zbliżyć</span><span>Geometria 3D · rzeczywiste struktury</span></footer></section>
<aside class="study-panel"><div class="study-tabs"><button id="explore-tab" class="active">Odkrywaj</button><button id="quiz-tab">Ćwicz szpilki</button></div><section id="explore-panel"><div class="detail-empty" id="detail-empty"><svg viewBox="0 0 90 100" width="70" aria-hidden="true"><path d="M49 15c-9 0-13 7-13 13s4 9 4 13l-15 9-6 23m21-32 14 1 17 18-5 13M40 44l-3 27-7 23m23-49 3 25 7 24M25 50l-8 3M56 47l14-3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="53" cy="26" r="13" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><h2>Każda struktura<br> ma swoje miejsce.</h2><p>Kliknij model lub wybierz strukturę z listy. Odsłoń otoczenie i sprawdź, co znajduje się pod spodem.</p></div><div id="structure-detail" hidden></div><div class="study-callout"><i data-lucide="pin"></i><h3>Jak na szpilkach</h3><p>Wybierz zakres. Wylosuj strukturę. Rozpoznaj ją po położeniu — bez podpisów.</p><button id="start-quiz" class="primary">Rozpocznij ćwiczenie <i data-lucide="arrow-right"></i></button></div><div class="scope-note"><span>Twój najbliższy zakres</span><strong>Od kości po sploty nerwowe</strong><p>Kościec osiowy i kończyn, artrologia, mięśnie tułowia i kończyn, nerwy rdzeniowe i sploty.</p></div></section>
<section id="quiz-panel" hidden><div class="quiz-heading"><span class="status-tag">Trening praktyczny</span><h2>Rozpoznaj strukturę</h2><p class="muted">Końcówka szpilki wskazuje powierzchnię struktury.</p></div><fieldset class="quiz-systems"><legend>Losuj z układów</legend>${(["skeletal", "muscular", "articular", "nervous"] satisfies System[]).map((s) => `<label><input type="checkbox" data-quiz-system="${s}" checked> ${systemNames[s]}</label>`).join("")}</fieldset><label class="checkbox-row"><input type="checkbox" id="early-review"> Ćwicz też przed terminem</label><label class="checkbox-row"><input type="checkbox" id="only-mistakes"> Tylko moje błędy</label><label class="checkbox-row"><input type="checkbox" id="timed"> Limit 30 sekund</label><div class="quiz-score"><span>W tej sesji <strong id="session-score">0 / 0</strong></span><span id="quiz-timer"></span></div><div id="question-area" hidden><p id="question-number" class="question-number">Szpilka 01</p><h3>Co wskazuje szpilka?</h3><form id="answer-form"><label for="answer">Nazwa polska, łacińska lub angielska</label><input id="answer" placeholder="Wpisz nazwę struktury" autocomplete="off" spellcheck="false"><button type="submit" id="check-answer">Sprawdź</button><label for="reasoning">Dlaczego uważasz, że to ta struktura? (opcjonalnie)</label><textarea id="reasoning" maxlength="4000" rows="3" placeholder="Punkty orientacyjne, przebieg, przyczepy, sąsiednie struktury…"></textarea></form><button id="reveal-answer" class="text-button">Pokaż odpowiedź</button><div id="answer-result" aria-live="polite"></div><div id="self-grade" class="button-row" hidden></div></div><button id="random-pin" class="primary wide"><i data-lucide="shuffle"></i> Losuj szpilkę</button><button id="end-session" class="text-button">Zakończ sesję</button><p id="quiz-pool-note" class="fineprint"></p><p class="fineprint">Zasłaniające siatki są odsuwane z drogi szpilki. Nie podświetlamy odpowiedzi. Możesz obracać model.</p></section></aside></div></main></div>
<section id="photos-view" class="other-view" hidden></section><section id="progress-view" class="other-view" hidden></section>
<dialog id="help-dialog"><div class="dialog-header"><h2>Pracownia anatomii</h2><button id="close-help" aria-label="Zamknij">×</button></div><div class="help-content"><p>Model obracasz myszą lub palcem. Kółko myszy przybliża, prawy przycisk przesuwa. Na telefonie użyj dwóch palców do przesunięcia i przybliżenia. Lista struktur zapewnia wybór również bez trafiania w siatkę.</p><h3>Źródła modeli</h3><p>Model: <a href="https://www.z-anatomy.com/" target="_blank" rel="noreferrer">Z-Anatomy</a>, pochodzący z BodyParts3D / DBCLS, CC BY-SA 4.0. Konwersja siatek i metadane: Anatria3D. <a href="./anatomy/NOTICE" target="_blank">Pełne autorstwo i opis zmian</a> · <a href="./anatomy/LICENSE" target="_blank">Licencje</a>.</p><h3>Rzeczywisty zakres</h3><p>Atlas Z-Anatomy zawiera model męski całego ciała, w tym drobne nerwy i więzadła.</p><p>Nie wszystkie guzki, bruzdy, otwory i powierzchnie na kościach są osobnymi strukturami 3D. Nazwy źródłowe to łacina i angielski; wybrane struktury mają polskie tłumaczenia. Lista i karta mówią wprost, gdy polskiej nazwy nie ma.</p><h3>Twoja nauka</h3><p>Postępy, ustawienia atlasu i sesje zapisują się w localStorage tej przeglądarki. Możesz odświeżyć stronę i kontynuować pytanie. „Moja nauka” umożliwia eksport oraz import pliku JSON. Wyczyszczenie danych przeglądarki usuwa zapis. Nierozpoznany synonim możesz ocenić ręcznie po odsłonięciu odpowiedzi.</p><p>To pomoc do nauki anatomii. Nazewnictwo warto sprawdzić z prowadzącym zajęcia.</p></div></dialog>
<div class="toast" id="toast" role="status" hidden></div>`;
createIcons({ icons, attrs: { "stroke-width": 1.65 } });

let toastTimeout: number | undefined;
function notify(message: string): void {
  const toast = get("#toast", HTMLDivElement);
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.hidden = true;
  }, 6000);
}
let study: StudyData;
try {
  study = readStudy();
} catch (error) {
  console.error(error);
  study = emptyStudy();
  notify(
    "Nie udało się odczytać postępów. Poprzedni zapis nie zostanie zastąpiony do pierwszej zmiany.",
  );
}
const sex = "male";
let region: Region = "exam";
let manifest: Manifest;
let viewer: AnatomyViewer | null = null;
let layers = new Map<System, Layer>();
let selection: Structure | null = null;
let quiz = false;
let revealed = false;
let graded = false;
let question: Structure | null = null;
let questionCount = 0;

let timer: number | undefined;
let remaining = 0;
let listLimit = 60;
let generation = 0;
let loading = 0;
let switching = false;
let currentView = "atlas";
const manifests = new Map<Sex, Manifest>();
const modelHost = get("#model-host", HTMLDivElement),
  pin = get("#pin", HTMLDivElement);
let saveFailed = false;
function saveQuietly(): void {
  try {
    saveStudy(study);
    saveFailed = false;
  } catch (error) {
    console.error(error);
    if (!saveFailed)
      notify(
        "Nie udało się zapisać danych. Wyeksportuj postępy przed zamknięciem strony.",
      );
    saveFailed = true;
  }
}
function capturePreferences(): Preferences {
  const depth = get("#muscle-depth", HTMLSelectElement).value;
  const quizSystems = systems.filter((system) => {
    const control = document.querySelector<HTMLInputElement>(
      `[data-quiz-system="${system}"]`,
    );
    return control?.checked === true;
  });
  return {
    sex,
    region,
    layers: [...layers].map(([system, layer]) => ({ system, ...layer })),
    depth: depth === "deep" || depth === "superficial" ? depth : "all",
    quizSystems,
    timed: get("#timed", HTMLInputElement).checked,
    onlyMistakes: get("#only-mistakes", HTMLInputElement).checked,
    earlyReview: get("#early-review", HTMLInputElement).checked,
  };
}
function persist(): void {
  study.preferences = capturePreferences();
  const session = activeSession(study);
  if (session?.source === "3d") {
    session.updatedAt = Date.now();
    session.settings = study.preferences;
    if (question) {
      session.questionId = question.id;
      session.questionCount = questionCount;
      const input = get("#answer", HTMLInputElement);
      saveQuestionDraft(
        session,
        input.dataset.questionId,
        input.value,
        get("#reasoning", HTMLTextAreaElement).value,
      );
      session.revealed = revealed;
      session.graded = graded;
    }
  }
  saveQuietly();
  updateScore();
}
function finishSession(): void {
  if (question) persist();
  endSession(study);
  saveQuietly();
  updateScore();
}
function startTimer(deadline: number | null): void {
  clearTimer();
  if (deadline === null || revealed || graded) return;
  const tick = (): void => {
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    get("#quiz-timer", HTMLSpanElement).textContent =
      `00:${String(remaining).padStart(2, "0")}`;
    if (remaining <= 0) {
      revealAnswer();
      const note = document.createElement("p");
      note.textContent =
        getLanguage() === "pl"
          ? "Czas minął. Porównaj odpowiedź i wybierz ocenę 1–4."
          : "Time is up. Compare the answer and choose a rating from 1 to 4.";
      get("#answer-result", HTMLDivElement).prepend(note);
    }
  };
  timer = window.setInterval(tick, 250);
  tick();
}
function restoreQuestion(): void {
  const session = activeSession(study);
  if (!session || session.source !== "3d") return;
  modeQuiz(true);
  questionCount = session.questionCount;
  updateScore();
  if (!session.questionId) return;
  const structure = viewer?.structures.get(session.questionId);
  if (!structure || !viewer?.prepareQuestion(structure.id)) {
    notify(
      "Zapisana sesja jest dostępna w historii. Wylosuj nowe pytanie w tym zakresie.",
    );
    return;
  }
  question = structure;
  revealed = session.revealed;
  graded = session.graded;
  get("#question-area", HTMLDivElement).hidden = false;
  get("#question-number", HTMLParagraphElement).textContent =
    `Szpilka ${questionCount}`;
  const answer = get("#answer", HTMLInputElement);
  answer.dataset.questionId = structure.id;
  answer.value = session.draft;
  get("#reasoning", HTMLTextAreaElement).value = session.reasoning;
  get("#reasoning", HTMLTextAreaElement).disabled = revealed;
  answer.disabled = revealed;
  get("#check-answer", HTMLButtonElement).disabled = revealed;
  get("#reveal-answer", HTMLButtonElement).hidden = revealed;
  get("#self-grade", HTMLDivElement).hidden = true;
  get("#answer-result", HTMLDivElement).replaceChildren();
  get("#random-pin", HTMLButtonElement).textContent = "Następna szpilka →";
  if (revealed) revealAnswer();
  else startTimer(session.deadline);
  notify("Przywrócono zapisaną sesję.");
}
function isRegion(value: string): value is Region {
  return ["all", "exam", "upper", "lower", "trunk", "head"].includes(value);
}
function setStatus(text: string | null, error = false): void {
  const status = get("#viewer-status", HTMLDivElement);
  status.hidden = text === null;
  if (text) {
    status.innerHTML = `${error ? "" : '<span class="spinner"></span>'}<strong>${escapeHtml(text)}</strong>${error ? '<button id="retry-model">Spróbuj ponownie</button>' : "<span>Siatki pozostają dostępne lokalnie po pobraniu.</span>"}`;
    if (error)
      get("#retry-model", HTMLButtonElement).onclick = () => {
        void loadAtlas();
      };
  }
}
function statusCounts(): void {
  if (!viewer) return;
  const count = viewer.visible().length;
  get("#visible-count", HTMLSpanElement).textContent =
    `${count.toLocaleString(getLanguage() === "pl" ? "pl-PL" : "en-GB")} widocznych struktur`;
  get("#structure-count", HTMLSpanElement).textContent = count.toLocaleString(
    getLanguage() === "pl" ? "pl-PL" : "en-GB",
  );
  get("#quiz-pool-note", HTMLParagraphElement).textContent =
    `${candidatePool().length.toLocaleString(getLanguage() === "pl" ? "pl-PL" : "en-GB")} struktur w aktualnie widocznych warstwach i zakresie.`;
}
function applyLayers(): void {
  if (!viewer) return;
  const depth = get("#muscle-depth", HTMLSelectElement).value;
  viewer.setLayers(
    layers,
    region,
    depth === "deep" || depth === "superficial" ? depth : "all",
  );
  statusCounts();
  renderList();
  if (!switching) persist();
}
function layerControls(): void {
  const container = get("#layers", HTMLDivElement);
  container.replaceChildren();
  const available = systems.filter((s) =>
    manifest.organs.some((o) => o.system === s),
  );
  for (const s of available) {
    const layer = layers.get(s) ?? { visible: false, opacity: 1 };
    layers.set(s, layer);
    const row = document.createElement("div");
    row.className = "layer-row";
    row.innerHTML = `<label class="layer-label"><input type="checkbox" data-system="${s}" ${layer.visible ? "checked" : ""}><span class="swatch" style="--swatch:${systemColors[s]}"></span><span>${systemNames[s]}</span><span class="layer-count">${manifest.organs.filter((o) => o.system === s).length}</span></label><div class="layer-opacity"><input type="range" min="5" max="100" value="${Math.round(layer.opacity * 100)}" aria-label="Przezroczystość: ${systemNames[s]}"><output>${Math.round(layer.opacity * 100)}%</output></div>`;
    row.dataset.visible = String(layer.visible);
    container.append(row);
    const checkbox = row.querySelector("input[type=checkbox]"),
      range = row.querySelector("input[type=range]"),
      output = row.querySelector("output");
    if (checkbox instanceof HTMLInputElement)
      checkbox.onchange = () => {
        finishSession();
        layer.visible = checkbox.checked;
        get("#layer-preset", HTMLSelectElement).value = "custom";
        row.dataset.visible = String(layer.visible);
        stopQuestion();
        void ensureVisible();
      };
    if (range instanceof HTMLInputElement)
      range.oninput = () => {
        layer.opacity = Number(range.value) / 100;
        if (output) output.textContent = `${range.value}%`;
        applyLayers();
      };
  }
}
async function ensureVisible(): Promise<void> {
  const instance = viewer;
  if (!instance) return;
  const ownGeneration = generation;
  loading++;
  get("#random-pin", HTMLButtonElement).disabled = true;
  try {
    for (const [system, layer] of layers) {
      if (layer.visible) {
        setStatus(`Wczytuję: ${systemNames[system].toLowerCase()}…`);
        await instance.load(system);
        if (ownGeneration !== generation) return;
      }
    }
    applyLayers();
    setStatus(null);
  } catch (error) {
    console.error(error);
    setStatus("Nie udało się wczytać warstwy.", true);
  } finally {
    loading--;
    if (ownGeneration === generation)
      get("#random-pin", HTMLButtonElement).disabled = false;
  }
}
async function loadAtlas(restore = false): Promise<void> {
  if (switching) return;
  switching = true;
  if (!restore && activeSession(study)?.source === "3d") {
    endSession(study);
    saveQuietly();
  }
  const ownGeneration = ++generation;
  stopQuestion();
  viewer?.dispose();
  viewer = null;
  selection = null;
  detail(null);
  setStatus("Przygotowuję model…");
  get("#coverage-note", HTMLParagraphElement).textContent =
    "Model całego ciała · Z-Anatomy";
  get("#model-caption", HTMLSpanElement).textContent =
    "Z-Anatomy · model męski";
  try {
    let nextManifest = manifests.get(sex);
    if (!nextManifest) {
      const response = await fetch(
        `${import.meta.env.BASE_URL}anatomy/manifest.json`,
      );
      if (!response.ok) throw new Error(`Manifest: HTTP ${response.status}`);
      const raw: unknown = await response.json();
      nextManifest = manifestSchema.parse(raw);
      manifests.set(sex, nextManifest);
    }
    if (ownGeneration !== generation) return;
    manifest = nextManifest;
    layers = new Map(
      systems.map((s) => [
        s,
        {
          visible: s === "skeletal" || s === "muscular",
          opacity: 1,
        },
      ]),
    );
    get("#layer-preset", HTMLSelectElement).value = "muscles";
    get("#region-title", HTMLElement).textContent = regionNames[region];
    viewer = new AnatomyViewer(modelHost, pin, manifest);
    viewer.onSelect = (s, point) => {
      if (quiz) return;
      selection = s;
      viewer?.select(s.id, point);
      detail(s);
    };
    viewer.onHover = (s) => {
      const tooltip = get("#hover-label", HTMLDivElement);
      tooltip.hidden = !s || quiz;
      if (s && !quiz) tooltip.textContent = displayName(s.organ);
    };
    if (restore) {
      const saved = study.preferences;
      region = saved.region;
      get("#region", HTMLSelectElement).value = region;
      get("#region-title", HTMLElement).textContent = regionNames[region];
      if (saved.layers.length)
        layers = new Map(
          saved.layers.map((l) => [
            l.system,
            { visible: l.visible, opacity: l.opacity },
          ]),
        );
      get("#muscle-depth", HTMLSelectElement).value = saved.depth;
      get("#layer-preset", HTMLSelectElement).value = "custom";
      get("#timed", HTMLInputElement).checked = saved.timed;
      get("#only-mistakes", HTMLInputElement).checked = saved.onlyMistakes;
      get("#early-review", HTMLInputElement).checked = saved.earlyReview;
      document
        .querySelectorAll<HTMLInputElement>("[data-quiz-system]")
        .forEach((input) => {
          input.checked = saved.quizSystems.some(
            (s) => s === input.dataset.quizSystem,
          );
        });
    }
    layerControls();
    await ensureVisible();
    viewer?.fit();
    if (restore) {
      if (activeSession(study)?.source === "photo") showView("photos");
      else restoreQuestion();
    } else persist();
  } catch (error) {
    console.error(error);
    setStatus(
      "Nie udało się uruchomić modelu 3D. Sprawdź WebGL i spróbuj ponownie.",
      true,
    );
  } finally {
    switching = false;
  }
}
function renderList(): void {
  if (!manifest) return;
  const container = get("#structures", HTMLDivElement);
  container.replaceChildren();
  get("#structure-search", HTMLInputElement).disabled = quiz;
  get("#more-structures", HTMLButtonElement).hidden = true;
  if (quiz) {
    const p = document.createElement("p");
    p.className = "fineprint";
    p.textContent = "Nazwy są ukryte podczas treningu.";
    container.append(p);
    return;
  }
  const query = get("#structure-search", HTMLInputElement)
    .value.trim()
    .toLocaleLowerCase("pl");
  const visibleIds = new Set(viewer?.visible().map((s) => s.id));
  const organs = manifest.organs.filter((o) =>
    query
      ? [displayName(o), o.ta2_latin, o.name_en].some((n) =>
          n.toLocaleLowerCase("pl").includes(query),
        )
      : visibleIds.has(o.organ_id),
  );
  organs.sort((a, b) => displayName(a).localeCompare(displayName(b), "pl"));
  for (const o of organs.slice(0, listLimit)) {
    const button = document.createElement("button");
    button.className = "structure-row";
    button.classList.toggle("selected", selection?.id === o.organ_id);
    button.innerHTML = `<span class="structure-dot" style="--swatch:${systemColors[o.system]}"></span><span><strong>${escapeHtml(displayName(o))}</strong><small>${escapeHtml(polishName(o) ? o.ta2_latin : o.name_en)}</small></span>`;
    button.onclick = () => {
      void selectFromList(o.organ_id);
    };
    container.append(button);
  }
  if (organs.length === 0)
    container.innerHTML =
      '<p class="fineprint">Brak struktur. Zmień zakres, włącz warstwę lub wpisz inną nazwę.</p>';
  const more = get("#more-structures", HTMLButtonElement);
  more.hidden = organs.length <= listLimit;
  more.textContent = `Pokaż kolejne ${Math.min(60, organs.length - listLimit)} z ${organs.length}`;
}
async function selectFromList(id: string): Promise<void> {
  const o = manifest.organs.find((o) => o.organ_id === id);
  if (!o || !viewer || quiz) return;
  const layer = layers.get(o.system);
  if (!layer) return;
  layer.visible = true;
  layerControls();
  await ensureVisible();
  const s = viewer.structures.get(id);
  if (!s) return;
  if (!inRegion(o, region, s.center.y)) {
    region = "all";
    get("#region", HTMLSelectElement).value = region;
    get("#region-title", HTMLElement).textContent = regionNames[region];
  }
  selection = s;
  applyLayers();
  viewer.select(id);
  viewer.focus(id);
  detail(s);
}
function detail(s: Structure | null): void {
  const panel = get("#structure-detail", HTMLDivElement);
  get("#detail-empty", HTMLDivElement).hidden = Boolean(s);
  panel.hidden = !s;
  if (!s) {
    panel.replaceChildren();
    return;
  }
  panel.innerHTML = `<div class="structure-type"><span class="swatch" style="--swatch:${systemColors[s.organ.system]}"></span>${systemNames[s.organ.system]}</div><h2>${escapeHtml(displayName(s.organ))}</h2><p class="latin-name" lang="la">${escapeHtml(s.organ.ta2_latin)}</p><p class="english-name" lang="en">${escapeHtml(s.organ.name_en)}</p>${getLanguage() === "en" || polishName(s.organ) ? "" : '<p class="fineprint">Brak zweryfikowanego tłumaczenia PL — wyświetlamy nazwę źródłową.</p>'}<dl class="structure-meta"><dt>Okolica</dt><dd>${escapeHtml(regionNames[viewer?.regionOf(s) === "upper" ? "upper" : viewer?.regionOf(s) === "lower" ? "lower" : viewer?.regionOf(s) === "head" ? "head" : "trunk"])}</dd><dt>Położenie</dt><dd>${/_l$/.test(s.id) ? "Strona lewa" : /_r$/.test(s.id) ? "Strona prawa" : "Struktura nieparzysta / część zbioru"}</dd></dl><details class="hierarchy"><summary>Położenie w atlasie</summary><p>${s.organ.path.map(escapeHtml).join(" → ")}</p></details><div class="detail-actions"><button id="focus-structure"><i data-lucide="focus"></i> Przybliż</button><button id="isolate-structure"><i data-lucide="scan"></i> Wyizoluj</button><button id="hide-structure"><i data-lucide="eye-off"></i> Ukryj strukturę</button><button id="restore-detail"><i data-lucide="layers"></i> Pokaż otoczenie</button></div><p class="fineprint">Z-Anatomy / BodyParts3D · CC BY-SA 4.0</p>`;
  createIcons({ icons, attrs: { "stroke-width": 1.65 } });
  get("#focus-structure", HTMLButtonElement).onclick = () =>
    viewer?.focus(s.id);
  get("#isolate-structure", HTMLButtonElement).onclick = () => {
    viewer?.isolate(s.id);
    statusCounts();
  };
  get("#hide-structure", HTMLButtonElement).onclick = () => {
    viewer?.hide(s.id);
    selection = null;
    detail(null);
    statusCounts();
    renderList();
  };
  get("#restore-detail", HTMLButtonElement).onclick = () => {
    viewer?.restore();
    applyLayers();
  };
}
function candidatePool(): Structure[] {
  if (!viewer) return [];
  const selected = new Set<System>();
  document
    .querySelectorAll<HTMLInputElement>("[data-quiz-system]")
    .forEach((input) => {
      const sys = systems.find((s) => s === input.dataset.quizSystem);
      if (input.checked && sys) selected.add(sys);
    });
  return viewer.candidates(selected);
}
function clearTimer(): void {
  clearInterval(timer);
  timer = undefined;
  get("#quiz-timer", HTMLSpanElement).textContent = "";
}
function stopQuestion(): void {
  clearTimer();
  question = null;
  revealed = false;
  graded = false;
  viewer?.setQuiz(quiz);
  viewer?.select(null);
  get("#question-area", HTMLDivElement).hidden = true;
}
function modeQuiz(value: boolean): void {
  if (question) persist();
  quiz = value;
  stopQuestion();
  selection = null;
  detail(null);
  get("#explore-panel", HTMLElement).hidden = value;
  get("#quiz-panel", HTMLElement).hidden = !value;
  get("#explore-tab", HTMLButtonElement).classList.toggle("active", !value);
  get("#quiz-tab", HTMLButtonElement).classList.toggle("active", value);
  get("#hover-label", HTMLDivElement).hidden = true;
  renderList();
  statusCounts();
}
async function randomQuestion(): Promise<void> {
  if (!viewer || loading || switching) return;
  if (activeSession(study)?.source === "photo") endSession(study);
  const session = startSession(study, capturePreferences());
  const previous = question?.id ?? null;
  viewer.setQuiz(true);
  viewer.select(null);
  applyLayers();
  const eligible = candidatePool().map((structure) => ({
    id: `${sex}:${structure.id}`,
    structure,
  }));
  const mistaken = new Set(latestMistakes(study.reviews));
  const onlyMistakes = get("#only-mistakes", HTMLInputElement).checked;
  const queue = reviewQueue(
    onlyMistakes ? eligible.filter((item) => mistaken.has(item.id)) : eligible,
    study.schedules,
    Date.now(),
    get("#early-review", HTMLInputElement).checked,
  );
  if (!queue.items.length && queue.nextDue !== null) {
    notify(
      `Teraz nie ma kart do powtórki. Najbliższa: ${new Date(queue.nextDue).toLocaleString(getLanguage() === "pl" ? "pl-PL" : "en-GB")}. Możesz włączyć ćwiczenie przed terminem.`,
    );
    return;
  }
  const candidate = nextQuestion(
    queue.items,
    previous ? `${sex}:${previous}` : null,
    study.reviews,
    onlyMistakes,
  );
  const s = candidate?.structure;
  if (!s) {
    notify(
      "Brak pytań w tym zakresie. Włącz odpowiednie warstwy lub zmień filtr błędów.",
    );
    stopQuestion();
    return;
  }
  if (!viewer.prepareQuestion(s.id)) {
    notify("Nie udało się umieścić szpilki na tej siatce. Wylosuj kolejną.");
    return;
  }
  clearTimer();
  question = s;
  questionCount = session.questionCount + 1;
  revealed = false;
  graded = false;
  get("#question-area", HTMLDivElement).hidden = false;
  get("#question-number", HTMLParagraphElement).textContent =
    `Szpilka ${questionCount}`;
  const answer = get("#answer", HTMLInputElement);
  answer.dataset.questionId = s.id;
  answer.value = "";
  get("#reasoning", HTMLTextAreaElement).value = "";
  get("#reasoning", HTMLTextAreaElement).disabled = false;
  answer.disabled = false;
  get("#check-answer", HTMLButtonElement).disabled = false;
  get("#reveal-answer", HTMLButtonElement).hidden = false;
  get("#self-grade", HTMLDivElement).hidden = true;
  get("#answer-result", HTMLDivElement).replaceChildren();
  get("#random-pin", HTMLButtonElement).innerHTML = "Następna szpilka →";
  answer.focus();
  session.deadline = get("#timed", HTMLInputElement).checked
    ? Date.now() + 30000
    : null;
  startTimer(session.deadline);
  persist();
}
function revealAnswer(): void {
  if (!question) return;
  clearTimer();
  revealed = true;
  get("#answer", HTMLInputElement).disabled = true;
  get("#reasoning", HTMLTextAreaElement).disabled = true;
  get("#check-answer", HTMLButtonElement).disabled = true;
  get("#reveal-answer", HTMLButtonElement).hidden = true;
  get("#answer-result", HTMLDivElement).innerHTML =
    `<div class="revealed-answer"><span>Wskazana struktura</span><strong>${escapeHtml(displayName(question.organ))}</strong><em lang="la">${escapeHtml(question.organ.ta2_latin)}</em><small lang="en">${escapeHtml(question.organ.name_en)}</small></div>`;
  const ratings = get("#self-grade", HTMLDivElement);
  ratings.hidden = graded;
  ratings.innerHTML = ratingButtons(
    study.schedules[`${sex}:${question.id}`],
    getLanguage(),
  );
  ratings
    .querySelectorAll<HTMLButtonElement>("[data-review-rating]")
    .forEach(
      (button) =>
        (button.onclick = () =>
          grade(ratingSchema.parse(Number(button.dataset.reviewRating)))),
    );
  persist();
}
function grade(rating: StudyRating): void {
  if (!question || graded) return;
  persist();
  const id = `${sex}:${question.id}`;
  try {
    recordRatedReview(
      study,
      id,
      rating,
      activeSession(study)?.id ?? "unassigned",
      get("#reasoning", HTMLTextAreaElement).value,
    );
  } catch (error) {
    console.error(error);
    notify(
      "Nie udało się zapisać postępów. Wyeksportuj je przed zamknięciem strony.",
    );
    revealAnswer();
    return;
  }
  graded = true;
  revealAnswer();
  persist();
  const card = study.schedules[id];
  const status = document.createElement("p");
  status.className = rating === 1 ? "grade-wrong" : "grade-correct";
  status.textContent =
    getLanguage() === "pl"
      ? `Ocena ${rating}/4 · kolejna powtórka za ${intervalLabel(card?.due ?? Date.now(), Date.now(), "pl")}.`
      : `Rating ${rating}/4 · next review in ${intervalLabel(card?.due ?? Date.now(), Date.now(), "en")}.`;
  get("#answer-result", HTMLDivElement).prepend(status);
  updateScore();
}
function updateScore(): void {
  const sessionId = activeSession(study)?.id;
  const sessionReviews = study.reviews.filter(
    (r) => r.sessionId === sessionId && sessionId !== undefined,
  );
  get("#session-score", HTMLElement).textContent =
    `${sessionReviews.filter((r) => r.correct).length} / ${sessionReviews.length}`;
}
function showView(view: string): void {
  if (!["atlas", "photos", "progress"].includes(view)) return;
  currentView = view;
  clearTimer();
  if (view === "atlas" && quiz && question && !revealed)
    startTimer(activeSession(study)?.deadline ?? null);
  get("#atlas-view", HTMLDivElement).hidden = view !== "atlas";
  get("#progress-view", HTMLElement).hidden = view !== "progress";
  get("#photos-view", HTMLElement).hidden = view !== "photos";
  document
    .querySelectorAll<HTMLButtonElement>("[data-view]")
    .forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  if (view === "progress") renderProgress();
  if (view === "photos") photos.activate();
  if (view === "atlas") window.dispatchEvent(new Event("resize"));
}
const photos = new PhotoPractice(
  get("#photos-view", HTMLElement),
  () => study,
  notify,
  async (photo) => {
    if (!photo.modelId) return;
    showView("atlas");
    if (!viewer) await loadAtlas();
    modeQuiz(false);
    region = photo.region;
    get("#region", HTMLSelectElement).value = region;
    const system = photo.system;
    for (const [name, layer] of layers) {
      layer.visible = name === system || name === "skeletal";
      layer.opacity = system !== "skeletal" && name === "skeletal" ? 0.22 : 1;
    }
    layerControls();
    await ensureVisible();
    await selectFromList(photo.modelId);
  },
);
function photoNameForReview(id: string): string {
  const autoName = autoReviewName(id, getLanguage());
  if (autoName) return autoName;
  const bookName = bookReviewName(id, getLanguage());
  if (bookName) return bookName;
  const pin = photos.pins.find(
    (pin) => `photo:${pin.atlasId}:${pin.id}` === id,
  );
  return pin
    ? "kind" in pin
      ? questionName(pin, getLanguage())
      : photoName(pin, getLanguage())
    : id;
}
function renderProgress(): void {
  const reviews = study.reviews;
  const correct = reviews.filter((r) => r.correct).length;
  const wrong = latestMistakes(reviews);
  const root = get("#progress-view", HTMLElement);
  root.innerHTML = `<div class="progress-header"><div><h1>Moja nauka</h1><p>Twoje postępy i sesje, zapisane w localStorage tej przeglądarki.</p></div><div class="button-row"><button id="export-study">Eksportuj postępy</button><label class="button" for="import-study">Importuj postępy</label><input id="import-study" type="file" accept="application/json" hidden></div></div><div class="progress-strip"><div><span>Wszystkie odpowiedzi</span><strong>${reviews.length}</strong></div><div><span>Poprawne odpowiedzi</span><strong>${correct}<small> / ${reviews.length}</small></strong></div><div><span>Struktury do powtórki</span><strong>${wrong.length}</strong></div><div><span>Zapisane sesje</span><strong>${study.sessions.length}</strong></div></div><section class="sessions-section"><h2>Powtórki FSRS</h2><p><span>Do powtórki teraz</span>: <strong>${Object.values(study.schedules).filter((card) => card.due <= Date.now()).length}</strong></p><p class="fineprint">Nowa fiszka otrzyma termin dopiero po wybraniu oceny 1–4.</p><div id="schedule-list"></div></section><section class="sessions-section"><h2>Historia sesji</h2><div id="sessions-list"></div></section><div class="progress-content"><section><h2>Do powtórki</h2><p class="muted">Ostatnia ocena każdej struktury decyduje, czy wróci na tę listę.</p><div id="mistakes-list"></div></section><section><h2>Ostatnie odpowiedzi</h2><div id="history-list"></div></section></div><p class="fineprint">Eksport JSON zawiera historię ocen, sesje oraz ustawienia. Import łączy postępy bez usuwania istniejących danych.</p>`;
  const sessionsList = get("#sessions-list", HTMLDivElement);
  sessionsList.innerHTML = study.sessions.length
    ? study.sessions
        .slice()
        .reverse()
        .map((session) => {
          const attempts = reviews.filter((r) => r.sessionId === session.id);
          const correctCount = attempts.filter((r) => r.correct).length;
          return `<div class="session-row"><div><strong>${session.source === "photo" ? (getLanguage() === "en" ? "Atlas photographs" : "Preparaty z atlasu") : escapeHtml(regionNames[session.settings.region])}</strong><small>${new Date(session.startedAt).toLocaleString(getLanguage() === "pl" ? "pl-PL" : "en-GB")} · ${session.source === "photo" ? "PDF" : session.settings.sex === "male" ? "Model męski" : "Model kobiecy"} · ${session.endedAt === null ? "W toku" : "Zakończona"}</small></div><span class="session-result">${correctCount} / ${attempts.length}<small>poprawnych</small></span>${session.id === study.activeSessionId ? '<button id="resume-session">Kontynuuj sesję</button>' : ""}</div>`;
        })
        .join("")
    : '<p class="empty-progress">Nie masz jeszcze zapisanych sesji. Rozpocznij ćwiczenie w atlasie 3D.</p>';
  const resume = document.querySelector("#resume-session");
  if (resume instanceof HTMLButtonElement)
    resume.onclick = () => {
      if (activeSession(study)?.source === "photo") {
        showView("photos");
        void photos.restoreSession();
      } else {
        showView("atlas");
        restoreQuestion();
      }
    };
  const nameFor = (id: string): string => {
    const [model, organId] = id.includes(":") ? id.split(":") : [null, id];
    const organ = (
      model === "male" || model === "female"
        ? (manifests.get(model)?.organs ?? [])
        : [...manifests.values()].flatMap((m) => m.organs)
    ).find((o) => o.organ_id === organId);
    return organ ? displayName(organ) : photoNameForReview(id);
  };
  get("#schedule-list", HTMLDivElement).innerHTML = Object.entries(
    study.schedules,
  )
    .sort((a, b) => a[1].due - b[1].due)
    .slice(0, 30)
    .map(
      ([id, card]) =>
        `<div class="review-row"><span>${escapeHtml(nameFor(id))}</span><span>${new Date(card.due).toLocaleString(getLanguage() === "pl" ? "pl-PL" : "en-GB")}</span></div>`,
    )
    .join("");
  get("#mistakes-list", HTMLDivElement).innerHTML = wrong.length
    ? wrong
        .map(
          (id) =>
            `<div class="review-row"><span>${escapeHtml(nameFor(id))}</span><span class="grade-wrong">Do powtórki</span></div>`,
        )
        .join("")
    : '<p class="empty-progress">Nie ma jeszcze struktur do powtórki. Rozpocznij trening w atlasie 3D.</p>';
  get("#history-list", HTMLDivElement).innerHTML = reviews.length
    ? reviews
        .slice(-30)
        .reverse()
        .map(
          (r) =>
            `<div class="review-row"><span>${escapeHtml(nameFor(r.id))}<small>${new Date(r.at).toLocaleString(getLanguage() === "pl" ? "pl-PL" : "en-GB")}</small>${r.reasoning ? `<details><summary>${getLanguage() === "pl" ? "Moje uzasadnienie" : "My reasoning"}</summary><p>${escapeHtml(r.reasoning)}</p></details>` : ""}</span><span class="${r.correct ? "grade-correct" : "grade-wrong"}">${r.rating ? `${r.rating}/4` : r.correct ? "Poprawnie" : "Do powtórki"}</span></div>`,
        )
        .join("")
    : '<p class="empty-progress">Historia pojawi się po pierwszej ocenionej odpowiedzi.</p>';
  get("#export-study", HTMLButtonElement).onclick = () => exportStudy(study);
  get("#import-study", HTMLInputElement).onchange = (event) => {
    if (event.target instanceof HTMLInputElement) {
      const f = event.target.files?.[0];
      if (f) void importProgress(f);
    }
  };
}
async function importProgress(file: File): Promise<void> {
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error("File too large");
    const raw: unknown = JSON.parse(await file.text());
    const incoming = parseStudy(raw);
    const merged = mergeStudy(study, incoming);
    saveStudy(merged);
    study = merged;
    renderProgress();
    updateScore();
    notify("Postępy i historia sesji zostały połączone.");
  } catch (error) {
    console.error(error);
    notify(
      "Nie udało się zaimportować danych. Wybierz poprawny eksport aplikacji Szpilki.",
    );
  }
}
document
  .querySelectorAll<HTMLButtonElement>("[data-view]")
  .forEach((b) => (b.onclick = () => showView(b.dataset.view ?? "atlas")));
get("#region", HTMLSelectElement).onchange = () => {
  const selected = get("#region", HTMLSelectElement).value;
  const r = Object.keys(regionNames).find((r) => r === selected);
  if (r && isRegion(selected)) {
    finishSession();
    region = selected;
    stopQuestion();
    get("#region-title", HTMLElement).textContent = regionNames[region];
    viewer?.restore();
    applyLayers();
    viewer?.fit();
  }
};
get("#layer-preset", HTMLSelectElement).onchange = () => {
  finishSession();
  const preset = get("#layer-preset", HTMLSelectElement).value;
  const selected =
    preset === "bones"
      ? ["skeletal"]
      : preset === "joints"
        ? ["skeletal", "articular"]
        : preset === "nerves"
          ? ["skeletal", "nervous"]
          : preset === "exam"
            ? ["skeletal", "articular", "nervous", "muscular"]
            : preset === "all"
              ? systems
              : ["skeletal", "muscular"];
  stopQuestion();
  viewer?.restore();
  for (const [s, l] of layers) l.visible = selected.includes(s);
  layerControls();
  void ensureVisible();
};
get("#muscle-depth", HTMLSelectElement).onchange = () => {
  finishSession();
  stopQuestion();
  applyLayers();
};
get("#structure-search", HTMLInputElement).oninput = () => {
  listLimit = 60;
  renderList();
};
get("#more-structures", HTMLButtonElement).onclick = () => {
  listLimit += 60;
  renderList();
};
get("#restore", HTMLButtonElement).onclick = () => {
  stopQuestion();
  viewer?.restore();
  selection = null;
  detail(null);
  applyLayers();
};
get("#zoom-in", HTMLButtonElement).onclick = () => viewer?.zoom(0.8);
get("#zoom-out", HTMLButtonElement).onclick = () => viewer?.zoom(1.25);
get("#fit", HTMLButtonElement).onclick = () => viewer?.fit();
document.querySelectorAll<HTMLButtonElement>("[data-direction]").forEach(
  (b) =>
    (b.onclick = () => {
      const d = b.dataset.direction;
      if (d === "front" || d === "back" || d === "left" || d === "right") {
        viewer?.view(d);
        document
          .querySelectorAll("[data-direction]")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        get("#view-label", HTMLSpanElement).textContent = b.textContent ?? "";
      }
    }),
);
get("#fullscreen", HTMLButtonElement).onclick = () => {
  const sheet = get(".work-sheet", HTMLElement);
  if (document.fullscreenElement) void document.exitFullscreen();
  else
    void sheet
      .requestFullscreen()
      .catch(() => notify("Ta przeglądarka nie obsługuje pełnego ekranu."));
};
get("#start-quiz", HTMLButtonElement).onclick = () => {
  if (
    activeSession(study)?.source === "3d" &&
    activeSession(study)?.questionId
  ) {
    restoreQuestion();
  } else {
    modeQuiz(true);
    void randomQuestion();
  }
};
get("#quiz-tab", HTMLButtonElement).onclick = () => {
  if (activeSession(study)?.source === "3d" && activeSession(study)?.questionId)
    restoreQuestion();
  else modeQuiz(true);
};
get("#explore-tab", HTMLButtonElement).onclick = () => modeQuiz(false);
get("#end-session", HTMLButtonElement).onclick = () => {
  finishSession();
  modeQuiz(false);
  notify("Sesja zapisana w historii nauki.");
};
get("#answer", HTMLInputElement).addEventListener("input", persist);
get("#random-pin", HTMLButtonElement).onclick = () => {
  void randomQuestion();
};
get("#answer-form", HTMLFormElement).onsubmit = (event) => {
  event.preventDefault();
  if (!question || revealed) return;
  const result = answerFeedback(
    get("#answer", HTMLInputElement).value,
    acceptedNames(question.organ),
  );
  revealAnswer();
  const note = document.createElement("p");
  const lang = getLanguage();
  note.textContent =
    result === "exact"
      ? lang === "pl"
        ? "Nazwa jest zgodna. Oceń, jak dobrze ją pamiętasz."
        : "Name matches. Rate your recall."
      : result === "typo"
        ? lang === "pl"
          ? "Możliwa literówka. Porównaj odpowiedź i wybierz ocenę; nie zapisano błędu."
          : "Possible typo. Compare and rate; no failure has been recorded."
        : lang === "pl"
          ? "Porównaj odpowiedź i wybierz ocenę od 1 do 4."
          : "Compare your answer and choose a rating from 1 to 4.";
  get("#answer-result", HTMLDivElement).prepend(note);
};
get("#reveal-answer", HTMLButtonElement).onclick = revealAnswer;
get("#reasoning", HTMLTextAreaElement).addEventListener("input", persist);
document
  .querySelectorAll<HTMLInputElement>(
    "[data-quiz-system],#only-mistakes,#timed,#early-review",
  )
  .forEach(
    (input) =>
      (input.onchange = () => {
        finishSession();
        stopQuestion();
        statusCounts();
        persist();
      }),
  );
const help = get("#help-dialog", HTMLDialogElement);
get("#help", HTMLButtonElement).onclick = () => help.showModal();
get("#sources-link", HTMLButtonElement).onclick = () => help.showModal();
get("#close-help", HTMLButtonElement).onclick = () => help.close();
help.addEventListener("click", (e) => {
  if (e.target === help) help.close();
});
window.addEventListener("pagehide", () => {
  persist();
  viewer?.dispose();
  clearTimer();
});
window.addEventListener("keydown", (event) => {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement ||
    event.target instanceof HTMLTextAreaElement ||
    help.open ||
    currentView !== "atlas"
  )
    return;
  if (event.code === "Space" && quiz) {
    event.preventDefault();
    if (question && !revealed) revealAnswer();
    else void randomQuestion();
  }
  if (event.key === "Escape" && quiz) modeQuiz(false);
});
get("#open-controls", HTMLButtonElement).onclick = () =>
  get(".sidebar", HTMLElement).classList.toggle("open");
get("#close-controls", HTMLButtonElement).onclick = () =>
  get(".sidebar", HTMLElement).classList.remove("open");
void loadAtlas(true);

get("#language", HTMLSelectElement).value = getLanguage();
get("#language", HTMLSelectElement).onchange = () => {
  const value = get("#language", HTMLSelectElement).value;
  if (value !== "en" && value !== "pl") return;
  setLanguage(value);
  photos.refreshLanguage();
  renderList();
  if (selection && !quiz) detail(selection);
  if (question && revealed) revealAnswer();
  if (currentView === "progress") renderProgress();
  statusCounts();
  translateUi(root);
};
observeTranslations(root);

export type Language = "en" | "pl";
export function languageFromPreference(value: string | null): Language {
  return value === "en" ? "en" : "pl";
}
let language: Language = "pl";
try {
  language = languageFromPreference(localStorage.getItem("szpilki-language"));
} catch (error) {
  console.warn("Language preference is unavailable.", error);
}
export function getLanguage(): Language {
  return language;
}
export function setLanguage(value: Language): void {
  language = value;
  document.documentElement.lang = value;
  try {
    localStorage.setItem("szpilki-language", value);
  } catch (error) {
    console.warn("Could not save language preference.", error);
  }
}
// The Polish source strings are stable message keys. Atlas nomenclature is handled separately.
const english: Record<string, string> = {
  "Tryb aplikacji": "Application mode",
  "Atlas 3D": "3D atlas",
  "Preparaty z atlasu": "Atlas photographs",
  "Moja nauka": "My learning",
  "Pomoc i źródła": "Help and sources",
  "Szpilki, atlas anatomii": "Szpilki anatomy atlas",
  "Atlas anatomii": "Anatomy atlas",
  "Odkrywaj. Odsłaniaj. Zapamiętuj.": "Explore. Uncover. Remember.",
  "Model anatomiczny": "Anatomical model",
  Mężczyzna: "Male",
  Kobieta: "Female",
  "Model całego ciała · Z-Anatomy": "Whole-body model · Z-Anatomy",
  "Tułów i miednica · HRA. Bez pełnych kończyn, mięśni i nerwów.":
    "Torso and pelvis · HRA. No complete limbs, muscles or nerves.",
  "Zakres nauki": "Study scope",
  "Całe ciało": "Whole body",
  "Kolokwium · od szyi w dół": "Exam · below the neck",
  "Kończyna górna": "Upper limb",
  "Kończyna dolna": "Lower limb",
  "Tułów i miednica": "Trunk and pelvis",
  "Głowa i szyja": "Head and neck",
  "Ćwiczenia 1–8: kości, stawy, mięśnie i nerwy.":
    "Classes 1–8: bones, joints, muscles and nerves.",
  "Warstwy i układy": "Layers and systems",
  "Przywróć ukryte struktury": "Restore hidden structures",
  "Zestaw warstw": "Layer preset",
  "Kości + mięśnie": "Bones + muscles",
  "Sam kościec": "Skeleton only",
  "Kości + stawy": "Bones + joints",
  "Kości + nerwy": "Bones + nerves",
  "Wszystkie 4 układy egzaminacyjne": "All 4 exam systems",
  "Wszystkie dostępne układy": "All available systems",
  "Własny zestaw": "Custom preset",
  Kości: "Bones",
  Mięśnie: "Muscles",
  "Stawy i więzadła": "Joints and ligaments",
  Nerwy: "Nerves",
  Naczynia: "Blood vessels",
  "Układ oddechowy": "Respiratory system",
  "Układ pokarmowy": "Digestive system",
  "Układ moczowy": "Urinary system",
  "Układ rozrodczy": "Reproductive system",
  "Układ chłonny": "Lymphatic system",
  Gruczoły: "Glands",
  "Okolice ciała": "Body regions",
  Powłoki: "Integumentary system",
  "Grupy mięśni": "Muscle groups",
  "Wszystkie grupy": "All groups",
  "Grupy oznaczone jako głębokie": "Groups labelled as deep",
  "Pozostałe grupy": "Other groups",
  "Podział według hierarchii atlasu; nie jest to symulacja kolejnych cięć preparatu. Przyczepy jako osobne siatki są pomijane.":
    "Groups follow the atlas hierarchy, rather than a dissection sequence. Separate muscle attachment meshes are excluded.",
  Struktury: "Structures",
  "Szukaj: femur, nerw…": "Search: femur, nerve…",
  "Szukaj struktury po polsku, łacinie lub angielsku":
    "Search structures in Polish, Latin or English",
  "Brak struktur. Zmień zakres, włącz warstwę lub wpisz inną nazwę.":
    "No structures found. Change the scope, enable a layer or try another name.",
  "Nazwy są ukryte podczas treningu.": "Names are hidden during practice.",
  "Bez konta. Postępy na urządzeniu.":
    "No account. Progress stays on your device.",
  "Źródła i zakres atlasu ↗": "Sources and coverage ↗",
  Pracownia: "Workspace",
  "Ładowanie modelu…": "Loading model…",
  "Pełny ekran modelu": "Full-screen model",
  "Model 3D": "3D model",
  "Z-Anatomy · model męski": "Z-Anatomy · male model",
  "Human Reference Atlas · model kobiecy":
    "Human Reference Atlas · female model",
  "Widok przedni": "Anterior view",
  Przód: "Front",
  Tył: "Back",
  "Lewy bok": "Left side",
  "Prawy bok": "Right side",
  Powiększ: "Zoom in",
  Pomniejsz: "Zoom out",
  "Dopasuj model": "Fit model",
  "Kierunek widoku": "View direction",
  "Przeciągnij, aby obrócić · przewiń, aby zbliżyć":
    "Drag to rotate · scroll to zoom",
  "Geometria 3D · rzeczywiste struktury":
    "3D geometry · real anatomical structures",
  "Przygotowuję preparat…": "Preparing the model…",
  "Wczytuję rzeczywiste siatki anatomiczne.": "Loading anatomical meshes.",
  "Przygotowuję model…": "Preparing the model…",
  "Siatki pozostają dostępne lokalnie po pobraniu.":
    "Anatomical meshes are loading from the application.",
  "Spróbuj ponownie": "Try again",
  "Nie udało się wczytać warstwy.": "Could not load this layer.",
  "Nie udało się uruchomić modelu 3D. Sprawdź WebGL i spróbuj ponownie.":
    "Could not start the 3D viewer. Check WebGL support and try again.",
  Odkrywaj: "Explore",
  "Ćwicz szpilki": "Pin practice",
  "Każda struktura": "Every structure",
  "ma swoje miejsce.": "has its place.",
  "Kliknij model lub wybierz strukturę z listy. Odsłoń otoczenie i sprawdź, co znajduje się pod spodem.":
    "Click the model or choose a structure from the list. Uncover its surroundings and explore what lies beneath.",
  "Jak na szpilkach": "Like the practical exam",
  "Wybierz zakres. Wylosuj strukturę. Rozpoznaj ją po położeniu — bez podpisów.":
    "Choose a scope. Draw a pin. Identify the structure by its position, without labels.",
  "Rozpocznij ćwiczenie": "Start practice",
  "Twój najbliższy zakres": "Your exam scope",
  "Od kości po sploty nerwowe": "From bones to nerve plexuses",
  "Kościec osiowy i kończyn, artrologia, mięśnie tułowia i kończyn, nerwy rdzeniowe i sploty.":
    "Axial and appendicular skeleton, joints, trunk and limb muscles, spinal nerves and plexuses.",
  "Brak zweryfikowanego tłumaczenia PL — wyświetlamy nazwę źródłową.":
    "No verified Polish translation; the source name is shown.",
  Okolica: "Region",
  Położenie: "Position",
  "Strona lewa": "Left side",
  "Strona prawa": "Right side",
  "Struktura nieparzysta / część zbioru":
    "Unpaired structure / dataset component",
  "Położenie w atlasie": "Atlas hierarchy",
  Przybliż: "Focus",
  Wyizoluj: "Isolate",
  "Ukryj strukturę": "Hide structure",
  "Pokaż otoczenie": "Show context",
  "Trening praktyczny": "Practical training",
  "Rozpoznaj strukturę": "Identify the structure",
  "Końcówka szpilki wskazuje powierzchnię struktury.":
    "The pin tip marks the surface of the structure.",
  "Losuj z układów": "Include in practice",
  "Tylko moje błędy": "Only my mistakes",
  "Limit 30 sekund": "30-second timer",
  "W tej sesji": "This session",
  "Co wskazuje szpilka?": "What does the pin indicate?",
  "Nazwa polska, łacińska lub angielska": "Polish, Latin or English name",
  "Wpisz nazwę struktury": "Type the structure name",
  Sprawdź: "Check answer",
  "Pokaż odpowiedź": "Reveal answer",
  "Do powtórki": "Review again",
  Umiem: "I knew it",
  "Losuj szpilkę": "Draw a pin",
  "Następna szpilka →": "Next pin →",
  "Zakończ sesję": "Finish session",
  "Zasłaniające siatki są odsuwane z drogi szpilki. Nie podświetlamy odpowiedzi. Możesz obracać model.":
    "Obstructing meshes are hidden along the pin line. The answer is not highlighted. You can rotate the model.",
  "Wskazana struktura": "Pinned structure",
  "Dobra odpowiedź.": "Correct answer.",
  "Ta struktura wróci do powtórki.": "This structure will return for review.",
  "Uznaj mój synonim za poprawny": "Accept my synonym as correct",
  "Odpowiedź uznana ręcznie.": "Answer accepted manually.",
  "Czas minął.": "Time is up.",
  "Przywrócono zapisaną sesję.": "Your saved session has been restored.",
  "Sesja zapisana w historii nauki.": "Session saved to your learning history.",
  "Brak pytań w tym zakresie. Włącz odpowiednie warstwy lub zmień filtr błędów.":
    "No questions in this scope. Enable more layers or change the mistakes filter.",
  "Nie udało się umieścić szpilki na tej siatce. Wylosuj kolejną.":
    "Could not place a pin on this mesh. Draw another question.",
  "Zapisana sesja jest dostępna w historii. Wylosuj nowe pytanie w tym zakresie.":
    "Your saved session remains in history. Draw a new question in this scope.",
  "Twoje postępy i sesje, zapisane w localStorage tej przeglądarki.":
    "Your progress and sessions, saved in this browser.",
  "Eksportuj postępy": "Export progress",
  "Importuj postępy": "Import progress",
  "Wszystkie odpowiedzi": "All attempts",
  "Poprawne odpowiedzi": "Correct answers",
  "Struktury do powtórki": "Structures to review",
  "Zapisane sesje": "Saved sessions",
  "Historia sesji": "Session history",
  "Nie masz jeszcze zapisanych sesji. Rozpocznij ćwiczenie w atlasie 3D.":
    "No saved sessions yet. Start practising in the 3D atlas.",
  "Kontynuuj sesję": "Resume session",
  poprawnych: "correct",
  "Ostatnia ocena każdej struktury decyduje, czy wróci na tę listę.":
    "The latest result for each structure determines whether it needs another review.",
  "Ostatnie odpowiedzi": "Recent answers",
  "Nie ma jeszcze struktur do powtórki. Rozpocznij trening w atlasie 3D.":
    "No structures to review yet. Start practising in the 3D atlas.",
  "Historia pojawi się po pierwszej ocenionej odpowiedzi.":
    "Your history will appear after the first graded answer.",
  Poprawnie: "Correct",
  "Eksport JSON zawiera historię ocen, sesje oraz ustawienia. Import łączy postępy bez usuwania istniejących danych.":
    "The JSON export includes answers, sessions and settings. Import merges progress without deleting existing data.",
  "Postępy i historia sesji zostały połączone.":
    "Progress and session history have been merged.",
  "Nie udało się zaimportować danych. Wybierz poprawny eksport aplikacji Szpilki.":
    "Import failed. Choose a valid Szpilki export.",
  "Zakres i warstwy": "Scope and layers",
  "Zamknij zakres i warstwy": "Close scope and layers",
  Zamknij: "Close",
  "Pracownia anatomii": "Anatomy workspace",
  "Źródła modeli": "Model sources",
  "Rzeczywisty zakres": "Actual coverage",
  "Twoja nauka": "Your learning",
  "Nie udało się zapisać danych. Wyeksportuj postępy przed zamknięciem strony.":
    "Could not save your data. Export progress before closing this page.",
  "Nie udało się zapisać postępów. Wyeksportuj je przed zamknięciem strony.":
    "Could not save progress. Export it before closing this page.",
  "Nie udało się zapisać korekty.": "Could not save the correction.",
  "Ta przeglądarka nie obsługuje pełnego ekranu.":
    "This browser does not support full-screen mode.",
};
Object.assign(english, {
  "Interaktywny model anatomiczny. Obracaj przeciągając, powiększaj kółkiem myszy. Struktury możesz też wybierać z listy.":
    "Interactive anatomy model. Drag to rotate and scroll to zoom. You can also select structures from the list.",
  "Model obracasz myszą lub palcem. Kółko myszy przybliża, prawy przycisk przesuwa. Na telefonie użyj dwóch palców do przesunięcia i przybliżenia. Lista struktur zapewnia wybór również bez trafiania w siatkę.":
    "Rotate with the mouse or a finger. Scroll to zoom and right-drag to pan. On mobile, use two fingers to pan and zoom. The structure list also lets you select small structures without clicking their mesh.",
  "Model:": "Model:",
  ", pochodzący z BodyParts3D / DBCLS, CC BY-SA 4.0. Konwersja siatek i metadane: Anatria3D.":
    ", derived from BodyParts3D / DBCLS, CC BY-SA 4.0. Mesh conversion and metadata: Anatria3D.",
  ", CC BY 4.0. Konwersja siatek i metadane: Anatria3D.":
    ", CC BY 4.0. Mesh conversion and metadata: Anatria3D.",
  "Pełne autorstwo i opis zmian": "Full credits and modifications",
  Licencje: "Licences",
  "Atlas Z-Anatomy zawiera model męski całego ciała, w tym drobne nerwy i więzadła.":
    "The Z-Anatomy atlas includes a male whole-body model, including small nerves and ligaments.",
  "Nie wszystkie guzki, bruzdy, otwory i powierzchnie na kościach są osobnymi strukturami 3D. Nazwy źródłowe to łacina i angielski; wybrane struktury mają polskie tłumaczenia. Lista i karta mówią wprost, gdy polskiej nazwy nie ma.":
    "Not every tubercle, groove, foramen or bone surface is a separately labelled 3D structure. Source nomenclature is Latin and English, with Polish translations for selected structures. Missing Polish labels are identified explicitly.",
  "Postępy, ustawienia atlasu i sesje zapisują się w localStorage tej przeglądarki. Możesz odświeżyć stronę i kontynuować pytanie. „Moja nauka” umożliwia eksport oraz import pliku JSON. Wyczyszczenie danych przeglądarki usuwa zapis. Nierozpoznany synonim możesz ocenić ręcznie po odsłonięciu odpowiedzi.":
    "Progress, atlas settings and sessions are saved in localStorage. Refreshing the page restores your question. My learning supports JSON export and import. Clearing browser data removes these records. You can manually accept an unrecognised synonym after revealing the answer.",
  "To pomoc do nauki anatomii. Nazewnictwo warto sprawdzić z prowadzącym zajęcia.":
    "This is an anatomy learning aid. Check the terminology expected by your instructor.",
  "Nie udało się odczytać postępów. Poprzedni zapis nie zostanie zastąpiony do pierwszej zmiany.":
    "Could not read saved progress. The previous record will remain until your next change.",
});
export function translate(text: string): string {
  if (language === "pl") return text;
  const direct = english[text];
  if (direct) return direct;
  const patterns: readonly (readonly [
    RegExp,
    (match: RegExpMatchArray) => string,
  ])[] = [
    [/^(\S+) widocznych struktur$/, (m) => `${m[1]} visible structures`],
    [
      /^(\S+) struktur w aktualnie widocznych warstwach i zakresie\.$/,
      (m) => `${m[1]} structures in the current layers and scope.`,
    ],
    [/^Szpilka (\d+)$/, (m) => `Pin ${m[1]}`],
    [/^Pokaż kolejne (\d+) z (\d+)$/, (m) => `Show ${m[1]} more of ${m[2]}`],
    [/^Przezroczystość: (.+)$/, (m) => `Opacity: ${translate(m[1] ?? "")}`],
    [
      /^Wczytuję: (.+)…$/,
      (m) => {
        const key = Object.keys(english).find((k) => k.toLowerCase() === m[1]);
        return `Loading ${key ? english[key] : m[1]}…`;
      },
    ],
    [
      /^(.+) · Model (męski|kobiecy) · (W toku|Zakończona)$/,
      (m) =>
        `${m[1]} · ${m[2] === "męski" ? "Male" : "Female"} model · ${m[3] === "W toku" ? "In progress" : "Completed"}`,
    ],
  ];
  const photoStatus = text.match(/^(.+) · PDF · (W toku|Zakończona)$/);
  if (photoStatus)
    return `${photoStatus[1]} · PDF · ${photoStatus[2] === "W toku" ? "In progress" : "Completed"}`;
  for (const [pattern, render] of patterns) {
    const match = text.match(pattern);
    if (match) return render(match);
  }
  return text;
}
interface TextRecord {
  source: string;
  output: string;
}
const textRecords = new WeakMap<Text, TextRecord>();
const attributeRecords = new WeakMap<Element, Map<string, TextRecord>>();
export function translateUi(root: HTMLElement): void {
  document.documentElement.lang = language;
  document.title =
    language === "en"
      ? "Szpilki — anatomy practice"
      : "Szpilki — pracownia anatomii";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (
      !(current instanceof Text) ||
      current.parentElement?.closest("[data-no-translate],script,style")
    )
      continue;
    const previous = textRecords.get(current);
    const source =
      previous && current.data === previous.output
        ? previous.source
        : current.data;
    const trimmed = source.trim();
    const output = trimmed
      ? source.replace(trimmed, translate(trimmed))
      : source;
    if (output !== current.data) current.data = output;
    textRecords.set(current, { source, output });
  }
  for (const element of root.querySelectorAll<HTMLElement>(
    "[placeholder],[title],[aria-label]",
  )) {
    let records = attributeRecords.get(element);
    if (!records) {
      records = new Map();
      attributeRecords.set(element, records);
    }
    for (const name of ["placeholder", "title", "aria-label"]) {
      const value = element.getAttribute(name);
      if (value === null) continue;
      const previous = records.get(name);
      const source =
        previous && value === previous.output ? previous.source : value;
      const output = translate(source);
      if (value !== output) element.setAttribute(name, output);
      records.set(name, { source, output });
    }
  }
}
export function observeTranslations(root: HTMLElement): MutationObserver {
  translateUi(root);
  const observer = new MutationObserver(() => translateUi(root));
  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "title", "aria-label"],
  });
  return observer;
}

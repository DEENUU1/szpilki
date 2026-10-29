import type { PhotoPin } from "./photo-data";

type Notes = PhotoPin["theory"];
type Content = Pick<PhotoPin, "pl" | "en" | "latin" | "system" | "theory"> & {
  model: string;
};
const notes = (en: string, pl: string): Notes => ({ en, pl });
const item = (
  pl: string,
  en: string,
  latin: string,
  system: PhotoPin["system"],
  model: string,
  theory: Notes,
): Content => ({ pl, en, latin, system, model, theory });

// Coordinates are individually placed on photographs in the supplied scan.
// Tendon questions explicitly link to the parent muscle when no tendon mesh exists.
const content = {
  median: item(
    "Nerw pośrodkowy",
    "Median nerve",
    "Nervus medianus",
    "nervous",
    "median_nerve",
    notes(
      "Passes through the carpal tunnel with nine flexor tendons. Distally it gives thenar motor and digital sensory branches and supplies the first two lumbricals. Its palmar cutaneous branch travels superficial to the flexor retinaculum instead.",
      "Przechodzi przez kanał nadgarstka z dziewięcioma ścięgnami zginaczy. Dalej oddaje gałęzie ruchowe kłębu i czuciowe palców oraz unerwia dwa pierwsze glistowate. Jego gałąź dłoniowa skórna biegnie powierzchownie od troczka zginaczy.",
    ),
  ),
  ulnar: item(
    "Nerw łokciowy",
    "Ulnar nerve",
    "Nervus ulnaris",
    "nervous",
    "ulnar_nerve",
    notes(
      "Reaches the hand superficial to the flexor retinaculum in Guyon's canal, near the pisiform and ulnar artery. It divides into a mainly sensory superficial branch and a mainly motor deep branch; it does not pass through the carpal tunnel.",
      "Dochodzi do ręki powierzchownie od troczka zginaczy w kanale Guyona, przy grochowatej i tętnicy łokciowej. Dzieli się na głównie czuciową gałąź powierzchowną i głównie ruchową głęboką. Nie przechodzi przez kanał nadgarstka.",
    ),
  ),
  deepUlnar: item(
    "Gałąź głęboka nerwu łokciowego",
    "Deep branch of ulnar nerve",
    "Ramus profundus nervi ulnaris",
    "nervous",
    "deep_branch_of_ulnar_nerve",
    notes(
      "Turns deeply into the hypothenar region and crosses the palm with the deep palmar arch. It supplies hypothenar muscles, interossei, medial two lumbricals, adductor pollicis and usually the deep head of flexor pollicis brevis.",
      "Skręca w głąb kłębika i przecina dłoń z łukiem dłoniowym głębokim. Unerwia mięśnie kłębika, międzykostne, dwa przyśrodkowe glistowate, przywodziciel kciuka i zwykle głowę głęboką zginacza krótkiego kciuka.",
    ),
  ),
  recurrentMedian: item(
    "Gałąź wsteczna nerwu pośrodkowego",
    "Recurrent branch of median nerve",
    "Ramus recurrens nervi mediani",
    "nervous",
    "median_nerve",
    notes(
      "Turns back towards the thenar muscles after the median nerve leaves the carpal tunnel. It supplies abductor pollicis brevis, opponens pollicis and usually the superficial head of flexor pollicis brevis. Its exact course varies. The 3D link selects the parent median nerve.",
      "Zawraca do mięśni kłębu po wyjściu pośrodkowego z kanału nadgarstka. Unerwia odwodziciel krótki, przeciwstawiacz i zwykle głowę powierzchowną zginacza krótkiego kciuka. Jej dokładny przebieg jest zmienny. Link 3D wybiera macierzysty nerw pośrodkowy.",
    ),
  ),
  lumbrical1: item(
    "Mięsień glistowaty pierwszy ręki",
    "First lumbrical of hand",
    "Musculus lumbricalis primus manus",
    "muscular",
    "lumbrical_muscles_of_hand",
    notes(
      "Arises from the radial side of the index FDP tendon and inserts into the radial extensor expansion of the index. Median-nerve supply. It flexes the MCP and extends the interphalangeal joints. The 3D atlas groups the hand lumbricals together.",
      "Od promieniowej strony ścięgna zginacza głębokiego wskaziciela do promieniowej części jego rozcięgna grzbietowego. Nerw pośrodkowy. Zgina staw śródręczno-paliczkowy i prostuje międzypaliczkowe. Atlas 3D łączy glistowate ręki w jedną grupę.",
    ),
  ),
  lumbrical2: item(
    "Mięsień glistowaty drugi ręki",
    "Second lumbrical of hand",
    "Musculus lumbricalis secundus manus",
    "muscular",
    "lumbrical_muscles_of_hand",
    notes(
      "Arises from the radial side of the middle-finger FDP tendon and joins that finger's radial extensor expansion. Usually median-nerve supply. Like the first lumbrical it has tendinous, not bony, attachments. The 3D link shows the grouped hand lumbricals.",
      "Od promieniowej strony ścięgna zginacza głębokiego palca środkowego do promieniowej części jego rozcięgna grzbietowego. Zwykle nerw pośrodkowy. Tak jak pierwszy ma przyczepy ścięgniste, nie kostne. Link 3D pokazuje grupę glistowatych ręki.",
    ),
  ),
  apb: item(
    "Mięsień odwodziciel krótki kciuka",
    "Abductor pollicis brevis",
    "Musculus abductor pollicis brevis",
    "muscular",
    "abductor_pollicis_brevis",
    notes(
      "A superficial thenar muscle from the flexor retinaculum and radial carpal tubercles to the radial base of the thumb proximal phalanx. Usually supplied by the recurrent median branch; it abducts the thumb perpendicular to the palm.",
      "Powierzchowny mięsień kłębu od troczka i promieniowych guzków nadgarstka do promieniowej podstawy paliczka bliższego kciuka. Zwykle gałąź wsteczna pośrodkowego. Odwodzi kciuk prostopadle do płaszczyzny dłoni.",
    ),
  ),
  fpb: item(
    "Mięsień zginacz krótki kciuka",
    "Flexor pollicis brevis",
    "Musculus flexor pollicis brevis",
    "muscular",
    "superficial_head_of_flexor_pollicis_brevis",
    notes(
      "Inserts with the radial sesamoid at the thumb proximal phalanx and flexes its MCP joint. The superficial head usually receives median supply and the deep head ulnar supply; variants occur. The 3D link selects the superficial head.",
      "Kończy się przy promieniowej trzeszczce u podstawy paliczka bliższego kciuka i zgina jego staw śródręczno-paliczkowy. Głowa powierzchowna zwykle otrzymuje pośrodkowy, głęboka łokciowy; występują odmiany. Link 3D wybiera głowę powierzchowną.",
    ),
  ),
  adm: item(
    "Mięsień odwodziciel palca małego ręki",
    "Abductor digiti minimi of hand",
    "Musculus abductor digiti minimi manus",
    "muscular",
    "abductor_digiti_minimi_of_hand",
    notes(
      "From the pisiform region to the ulnar base of the fifth proximal phalanx and extensor expansion. It abducts the little finger from the middle-finger axis and receives the deep ulnar branch.",
      "Od okolicy kości grochowatej do łokciowej podstawy paliczka bliższego V i rozcięgna grzbietowego. Odwodzi palec mały od osi palca środkowego. Unerwia go gałąź głęboka łokciowego.",
    ),
  ),
  fdm: item(
    "Mięsień zginacz krótki palca małego ręki",
    "Flexor digiti minimi brevis of hand",
    "Musculus flexor digiti minimi brevis manus",
    "muscular",
    "flexor_digiti_minimi_of_hand",
    notes(
      "From the hook of hamate and flexor retinaculum to the fifth proximal phalanx. Supplied by the deep ulnar branch, it flexes the little finger's MCP joint; opponens lies deeper and attaches to the metacarpal instead.",
      "Od haczyka kości haczykowatej i troczka zginaczy do paliczka bliższego V. Gałąź głęboka łokciowego. Zgina staw śródręczno-paliczkowy małego; przeciwstawiacz leży głębiej i kończy się na kości śródręcza.",
    ),
  ),
  fplTendon: item(
    "Ścięgno mięśnia zginacza długiego kciuka",
    "Flexor pollicis longus tendon",
    "Tendo musculi flexoris pollicis longi",
    "muscular",
    "flexor_pollicis_longus",
    notes(
      "Travels through the carpal tunnel and between the thenar components to the base of the thumb distal phalanx. It flexes the thumb IP joint; its muscle receives the anterior interosseous branch of median. The 3D link shows the parent muscle.",
      "Przechodzi przez kanał nadgarstka i między częściami kłębu do podstawy paliczka dalszego kciuka. Zgina staw międzypaliczkowy kciuka; mięsień unerwia międzykostny przedni od pośrodkowego. Link 3D pokazuje cały mięsień.",
    ),
  ),
  fcrTendon: item(
    "Ścięgno mięśnia zginacza promieniowego nadgarstka",
    "Flexor carpi radialis tendon",
    "Tendo musculi flexoris carpi radialis",
    "muscular",
    "flexor_carpi_radialis",
    notes(
      "Passes through a separate compartment at the trapezium, rather than the main carpal tunnel, and reaches mainly the second metacarpal base. The median-supplied muscle flexes and radially deviates the wrist. The 3D link shows the parent muscle.",
      "Przechodzi w osobnym przedziale przy kości czworobocznej większej, poza głównym kanałem nadgarstka, głównie do podstawy II śródręcza. Mięsień unerwiony przez pośrodkowy zgina i odwodzi promieniowo nadgarstek. Link 3D pokazuje cały mięsień.",
    ),
  ),
  fdpTendon: item(
    "Ścięgno mięśnia zginacza głębokiego palców",
    "Flexor digitorum profundus tendon",
    "Tendo musculi flexoris digitorum profundi",
    "muscular",
    "flexor_digitorum_profundus",
    notes(
      "The four FDP tendons pass through the carpal tunnel and through the splits of FDS tendons to distal phalanges 2–5. Lumbricals arise from them. The muscle has median/anterior-interosseous and ulnar supply. The 3D link shows the parent muscle.",
      "Cztery ścięgna przechodzą przez kanał nadgarstka i rozdwojenia zginacza powierzchownego do paliczków dalszych II–V. Od nich odchodzą glistowate. Mięsień ma unerwienie od pośrodkowego przez międzykostny przedni oraz od łokciowego. 3D pokazuje cały mięsień.",
    ),
  ),
  fdsTendon: item(
    "Ścięgno mięśnia zginacza powierzchownego palców",
    "Flexor digitorum superficialis tendon",
    "Tendo musculi flexoris digitorum superficialis",
    "muscular",
    "humero_ulnar_head_of_flexor_digitorum_superficialis",
    notes(
      "Each tendon splits to let FDP pass, then attaches to the middle phalanx. The four tendons share the carpal tunnel with FDP and FPL. The median-supplied muscle primarily flexes the PIP joints. The 3D link shows the humero-ulnar head.",
      "Każde ścięgno rozdwaja się, przepuszcza zginacz głęboki i kończy na paliczku środkowym. Cztery ścięgna współdzielą kanał nadgarstka z głębokimi i zginaczem długim kciuka. Mięsień unerwiony przez pośrodkowy zgina głównie stawy międzypaliczkowe bliższe. 3D pokazuje głowę ramienno-łokciową.",
    ),
  ),
  wristFlexorRet: item(
    "Troczek zginaczy nadgarstka",
    "Flexor retinaculum of wrist",
    "Retinaculum flexorum manus",
    "muscular",
    "flexor_retinaculum_of_wrist",
    notes(
      "Bridges the radial carpal tubercles and the pisiform/hamate-hook side, forming the carpal tunnel roof. Median and nine long flexor tendons pass deep to it; ulnar nerve and artery pass superficial to it. It has been partly divided in this dissection.",
      "Łączy promieniowe guzki nadgarstka ze stroną grochowatej i haczyka haczykowatej, tworząc dach kanału nadgarstka. Pośrodkowy i dziewięć długich ścięgien zginaczy leżą pod nim, łokciowy i tętnica łokciowa nad nim. W tym preparacie jest częściowo przecięty.",
    ),
  ),
  adductorTransverse: item(
    "Głowa poprzeczna mięśnia przywodziciela kciuka",
    "Transverse head of adductor pollicis",
    "Caput transversum musculi adductoris pollicis",
    "muscular",
    "transverse_head_of_adductor_pollicis",
    notes(
      "From the third metacarpal shaft towards the ulnar side of the thumb proximal phalanx. The deep ulnar branch supplies it. It adducts the thumb; the deep palmar arch and nerve pass between the transverse and oblique heads in this dissection.",
      "Od trzonu III śródręcza ku łokciowej stronie paliczka bliższego kciuka. Gałąź głęboka łokciowego. Przywodzi kciuk. Przy rozdzielaniu głów poprzecznej i skośnej szukaj gałęzi głębokiej nerwu oraz łuku dłoniowego głębokiego.",
    ),
  ),
  adductorOblique: item(
    "Głowa skośna mięśnia przywodziciela kciuka",
    "Oblique head of adductor pollicis",
    "Caput obliquum musculi adductoris pollicis",
    "muscular",
    "oblique_head_of_adductor_pollicis",
    notes(
      "Arises around the capitate and bases of the second and third metacarpals, converging on the thumb's ulnar proximal phalangeal base. Deep ulnar-branch supply; it adducts the thumb during a firm pinch.",
      "Rozpoczyna się przy główkowatej i podstawach II–III śródręcza, zbiegając do łokciowej podstawy paliczka bliższego kciuka. Gałąź głęboka łokciowego. Przywodzi kciuk podczas silnego chwytu szczypcowego.",
    ),
  ),
  opponensPollicis: item(
    "Mięsień przeciwstawiacz kciuka",
    "Opponens pollicis",
    "Musculus opponens pollicis",
    "muscular",
    "opponens_pollicis_muscle",
    notes(
      "Deep in the thenar eminence, from the trapezium and flexor retinaculum to the radial shaft of the first metacarpal. Usually recurrent median supply. It flexes and rotates the first metacarpal to oppose the thumb to the fingers.",
      "Głęboko w kłębie, od czworobocznej większej i troczka do promieniowego trzonu I śródręcza. Zwykle gałąź wsteczna pośrodkowego. Zgina i obraca I śródręcze, przeciwstawiając kciuk pozostałym palcom.",
    ),
  ),
  opponensMinimi: item(
    "Mięsień przeciwstawiacz palca małego ręki",
    "Opponens digiti minimi of hand",
    "Musculus opponens digiti minimi manus",
    "muscular",
    "opponens_digiti_minimi_muscle_of_hand",
    notes(
      "From the hamate hook and flexor retinaculum to the fifth metacarpal shaft. Supplied by the deep ulnar branch, it draws and rotates that metacarpal forwards to cup the palm. Its metacarpal insertion distinguishes it from the adjacent little-finger flexor.",
      "Od haczyka haczykowatej i troczka do trzonu V śródręcza. Gałąź głęboka łokciowego. Pociąga i obraca V śródręcze do przodu, pogłębiając sklepienie dłoni. Przyczep śródręczny odróżnia go od sąsiedniego zginacza małego palca.",
    ),
  ),
  pronatorQuadratus: item(
    "Mięsień nawrotny czworoboczny",
    "Pronator quadratus",
    "Musculus pronator quadratus",
    "muscular",
    "pronator_quadratus",
    notes(
      "A deep transverse sheet from distal anterior ulna to distal anterior radius, covered by the long flexor tendons. Anterior interosseous-nerve supply from median. It pronates the forearm and stabilises the distal radioulnar joint.",
      "Głęboka poprzeczna blaszka od dalszej przedniej łokciowej do dalszej przedniej promieniowej, pod długimi ścięgnami zginaczy. Międzykostny przedni od pośrodkowego. Nawraca przedramię i stabilizuje dalszy staw promieniowo-łokciowy.",
    ),
  ),
  edmTendon: item(
    "Ścięgno mięśnia prostownika palca małego",
    "Extensor digiti minimi tendon",
    "Tendo musculi extensoris digiti minimi",
    "muscular",
    "extensor_digiti_minimi",
    notes(
      "Runs through the fifth dorsal wrist compartment and reaches the fifth extensor expansion, often as two slips. The muscle receives posterior interosseous supply and extends the little finger. The 3D link selects the parent muscle.",
      "Biegnie przez V przedział grzbietowy nadgarstka do rozcięgna grzbietowego małego palca, często dwoma pasmami. Mięsień otrzymuje międzykostny tylny i prostuje palec mały. Link 3D wybiera cały mięsień.",
    ),
  ),
  edTendon: item(
    "Ścięgno mięśnia prostownika palców",
    "Extensor digitorum tendon",
    "Tendo musculi extensoris digitorum",
    "muscular",
    "extensor_digitorum",
    notes(
      "The finger tendons pass in the fourth dorsal wrist compartment with extensor indicis. On the hand, intertendinous connections link neighbouring slips. The posterior-interosseous-supplied muscle extends digits 2–5. The 3D link shows the parent muscle.",
      "Ścięgna przechodzą w IV przedziale grzbietowym z prostownikiem wskaziciela. Na ręce połączenia międzyścięgniste łączą sąsiednie pasma. Mięsień unerwiony przez międzykostny tylny prostuje palce II–V. Link 3D pokazuje cały mięsień.",
    ),
  ),
  eplTendon: item(
    "Ścięgno mięśnia prostownika długiego kciuka",
    "Extensor pollicis longus tendon",
    "Tendo musculi extensoris pollicis longi",
    "muscular",
    "extensor_pollicis_longus",
    notes(
      "Turns around the dorsal radial tubercle in the third dorsal compartment and reaches the thumb distal phalanx. It forms the ulnar border of the anatomical snuffbox. Posterior interosseous supply; the 3D link shows the parent muscle.",
      "Zagina się przy guzku grzbietowym promieniowej w III przedziale grzbietowym i dochodzi do paliczka dalszego kciuka. Tworzy łokciowy brzeg tabakierki anatomicznej. Międzykostny tylny; link 3D pokazuje cały mięsień.",
    ),
  ),
  epbTendon: item(
    "Ścięgno mięśnia prostownika krótkiego kciuka",
    "Extensor pollicis brevis tendon",
    "Tendo musculi extensoris pollicis brevis",
    "muscular",
    "extensor_pollicis_brevis",
    notes(
      "Shares the first dorsal compartment with abductor pollicis longus and reaches the thumb proximal phalanx. With APL it forms the radial border of the anatomical snuffbox. Posterior interosseous supply; the 3D link shows the parent muscle.",
      "Współdzieli I przedział grzbietowy z odwodzicielem długim kciuka i dochodzi do paliczka bliższego kciuka. Z nim tworzy promieniowy brzeg tabakierki. Międzykostny tylny; link 3D pokazuje cały mięsień.",
    ),
  ),
  eiTendon: item(
    "Ścięgno mięśnia prostownika wskaziciela",
    "Extensor indicis tendon",
    "Tendo musculi extensoris indicis",
    "muscular",
    "extensor_indicis",
    notes(
      "Passes with extensor digitorum through the fourth dorsal compartment and joins the index extensor expansion, usually on its ulnar side. It permits more independent index extension. Posterior interosseous supply; 3D shows the parent muscle.",
      "Przechodzi z prostownikiem palców przez IV przedział grzbietowy i dołącza do rozcięgna wskaziciela, zwykle po stronie łokciowej. Umożliwia bardziej niezależne prostowanie wskaziciela. Międzykostny tylny; 3D pokazuje cały mięsień.",
    ),
  ),
  ecrlTendon: item(
    "Ścięgno mięśnia prostownika promieniowego długiego nadgarstka",
    "Extensor carpi radialis longus tendon",
    "Tendo musculi extensoris carpi radialis longi",
    "muscular",
    "extensor_carpi_radialis_longus",
    notes(
      "Passes through the second dorsal compartment to the dorsal base of the second metacarpal, alongside ECRB to the third. Radial-nerve supply. The muscle extends and radially deviates the wrist; 3D shows the parent muscle.",
      "Przechodzi przez II przedział grzbietowy do grzbietowej podstawy II śródręcza, obok krótkiego dochodzącego do III. Nerw promieniowy. Mięsień prostuje i odwodzi promieniowo nadgarstek; 3D pokazuje cały mięsień.",
    ),
  ),
  ecrbTendon: item(
    "Ścięgno mięśnia prostownika promieniowego krótkiego nadgarstka",
    "Extensor carpi radialis brevis tendon",
    "Tendo musculi extensoris carpi radialis brevis",
    "muscular",
    "extensor_carpi_radialis_brevis",
    notes(
      "Shares the second dorsal compartment with ECRL but ends on the third metacarpal base. Usually supplied by the deep radial branch. It extends the wrist and contributes to radial deviation; 3D shows the parent muscle.",
      "Współdzieli II przedział grzbietowy z długim, lecz kończy się na podstawie III kości śródręcza. Zwykle gałąź głęboka promieniowego. Prostuje nadgarstek i wspomaga odwodzenie promieniowe; 3D pokazuje cały mięsień.",
    ),
  ),
  aplTendon: item(
    "Ścięgno mięśnia odwodziciela długiego kciuka",
    "Abductor pollicis longus tendon",
    "Tendo musculi abductoris pollicis longi",
    "muscular",
    "abductor_pollicis_longus",
    notes(
      "In the first dorsal compartment with EPB, it reaches the first metacarpal base, more proximally than EPB's phalangeal insertion. It abducts the thumb at the carpometacarpal joint. Posterior interosseous supply; 3D shows the parent muscle.",
      "W I przedziale grzbietowym z prostownikiem krótkim dochodzi do podstawy I śródręcza, bardziej proksymalnie niż paliczkowy przyczep prostownika. Odwodzi kciuk w stawie nadgarstkowo-śródręcznym. Międzykostny tylny; 3D pokazuje cały mięsień.",
    ),
  ),
  wristExtensorRet: item(
    "Troczek prostowników nadgarstka",
    "Extensor retinaculum of wrist",
    "Retinaculum extensorum manus",
    "muscular",
    "extensor_retinaculum_of_wrist",
    notes(
      "A transverse fascial thickening on the dorsal wrist that restrains extensor tendons. Septa form six compartments. From radial to ulnar: APL/EPB, ECRL/ECRB, EPL, EDC/EI, EDM and ECU.",
      "Poprzeczne zgrubienie powięzi grzbietu nadgarstka utrzymujące ścięgna prostowników. Przegrody tworzą sześć przedziałów. Od promieniowego: odwodziciel długi i prostownik krótki kciuka; prostowniki promieniowe; prostownik długi kciuka; prostowniki palców i wskaziciela; prostownik małego; prostownik łokciowy nadgarstka.",
    ),
  ),
  interosseous1: item(
    "Mięsień międzykostny grzbietowy pierwszy ręki",
    "First dorsal interosseous of hand",
    "Musculus interosseus dorsalis primus manus",
    "muscular",
    "dorsal_interossei_muscles_of_hand",
    notes(
      "Occupies the first metacarpal interval and reaches the radial side of the index proximal phalanx/extensor expansion. Deep ulnar supply. It abducts the index away from the middle finger and assists MCP flexion. The 3D link shows the grouped dorsal interossei.",
      "Zajmuje I przestrzeń międzyśródręczną i dochodzi do promieniowej strony paliczka bliższego oraz rozcięgna wskaziciela. Gałąź głęboka łokciowego. Odwodzi wskaziciel od środkowego i wspomaga zginanie stawu śródręczno-paliczkowego. 3D pokazuje grupę międzykostnych grzbietowych.",
    ),
  ),
  interosseous2: item(
    "Mięsień międzykostny grzbietowy drugi ręki",
    "Second dorsal interosseous of hand",
    "Musculus interosseus dorsalis secundus manus",
    "muscular",
    "dorsal_interossei_muscles_of_hand",
    notes(
      "Between the second and third metacarpals, it reaches the radial side of the middle proximal phalanx/extensor expansion. Deep ulnar supply. It abducts the middle finger radially and assists the intrinsic flexion/extension pattern. 3D groups the dorsal interossei.",
      "Między II i III śródręczem dochodzi do promieniowej strony paliczka bliższego oraz rozcięgna palca środkowego. Gałąź głęboka łokciowego. Odwodzi palec środkowy promieniowo i wspomaga zginanie u nasady z prostowaniem dalszych stawów. 3D łączy międzykostne grzbietowe w grupę.",
    ),
  ),
  sural: item(
    "Nerw łydkowy",
    "Sural nerve",
    "Nervus suralis",
    "nervous",
    "sural_nerve",
    notes(
      "A sensory nerve descending near the small saphenous vein, behind the lateral malleolus, then along the lateral foot. It contrasts with the superficial fibular branches crossing the anterior ankle towards most of the dorsal foot.",
      "Czuciowy nerw schodzący przy żyle odstrzałkowej, za kostką boczną, potem wzdłuż bocznego brzegu stopy. Odróżniaj go od gałęzi strzałkowego powierzchownego, przechodzących przed stawem skokowym do większości grzbietu stopy.",
    ),
  ),
  achilles: item(
    "Ścięgno piętowe",
    "Calcaneal tendon",
    "Tendo calcaneus",
    "muscular",
    "calcaneal_tendon",
    notes(
      "The common distal tendon of gastrocnemius and soleus attaches to the posterior calcaneus and transmits plantarflexion force. Plantaris has a separate slender tendon nearby; do not identify every pale posterior-ankle cord as Achilles.",
      "Wspólne dalsze ścięgno brzuchatego i płaszczkowatego kończy się na tylnej kości piętowej i przenosi siłę zginania podeszwowego. Podeszwowy ma osobne cienkie ścięgno w sąsiedztwie; nie każdy jasny sznur z tyłu kostki to ścięgno Achillesa.",
    ),
  ),
  edb: item(
    "Mięsień prostownik krótki palców",
    "Extensor digitorum brevis",
    "Musculus extensor digitorum brevis",
    "muscular",
    "extensor_digitorum_brevis",
    notes(
      "A fleshy dorsal-foot muscle from the superior-lateral calcaneus, whose slips join the long extensor tendons for toes 2–4. Supplied by the deep fibular nerve. Its belly lies deep to the long tendons rather than continuing into the leg.",
      "Mięsisty mięsień grzbietu stopy od górno-bocznej piętowej, którego pasma dołączają do długich prostowników palców II–IV. Nerw strzałkowy głęboki. Brzusiec leży pod długimi ścięgnami, nie przechodzi w podudzie.",
    ),
  ),
  fibularisBrevisTendon: item(
    "Ścięgno mięśnia strzałkowego krótkiego",
    "Fibularis brevis tendon",
    "Tendo musculi fibularis brevis",
    "muscular",
    "fibularis_brevis_muscle",
    notes(
      "Passes behind the lateral malleolus anterior to the fibularis-longus tendon and reaches the fifth metatarsal tuberosity. The superficial-fibular-supplied muscle everts the foot. The longus tendon instead turns across the sole. 3D shows the parent muscle.",
      "Przechodzi za kostką boczną przed ścięgnem strzałkowego długiego i dochodzi do guzowatości V śródstopia. Mięsień unerwiony przez strzałkowy powierzchowny nawraca stopę. Długi skręca przez podeszwę. 3D pokazuje cały mięsień.",
    ),
  ),
  inferiorExtRet: item(
    "Troczek dolny prostowników stopy",
    "Inferior extensor retinaculum of ankle",
    "Retinaculum musculorum extensorum inferius",
    "muscular",
    "inferior_extensor_retinaculum_of_ankle",
    notes(
      "A branching fascial thickening across the anterior ankle/dorsal hindfoot. It restrains the long extensor tendons; deep fibular nerve and anterior tibial/dorsalis pedis vessels pass beneath it. Its lateral stem attaches near the calcaneus.",
      "Rozgałęziające się zgrubienie powięzi przed stawem skokowym i na grzbiecie tyłostopia. Utrzymuje długie ścięgna prostowników; pod nim biegną strzałkowy głęboki i naczynia piszczelowe przednie przechodzące w grzbietowe stopy. Boczna nasada przyczepia się przy piętowej.",
    ),
  ),
  superiorFibRet: item(
    "Troczek górny mięśni strzałkowych",
    "Superior fibular retinaculum",
    "Retinaculum musculorum fibularium superius",
    "muscular",
    "superior_fibular_retinaculum",
    notes(
      "Spans from the posterior lateral malleolar region towards the calcaneus, retaining the fibularis-longus and brevis tendons behind the malleolus. Brevis is anterior to longus in this retromalleolar course.",
      "Rozpięty od tylnej okolicy kostki bocznej ku piętowej, utrzymuje ścięgna strzałkowych długiego i krótkiego za kostką. W tym przebiegu krótkie leży przed długim.",
    ),
  ),
  inferiorFibRet: item(
    "Troczek dolny mięśni strzałkowych",
    "Inferior fibular retinaculum",
    "Retinaculum musculorum fibularium inferius",
    "muscular",
    "inferior_fibular_retinaculum",
    notes(
      "Retains the fibular tendons on the lateral calcaneus near the fibular trochlea. The brevis tendon passes above the trochlea towards the fifth metatarsal, while longus passes below it and then across the sole.",
      "Utrzymuje ścięgna strzałkowych na bocznej piętowej przy bloczku strzałkowym. Krótkie biegnie nad bloczkiem ku V śródstopiu, długie pod nim, a potem przez podeszwę.",
    ),
  ),
  tibial: item(
    "Nerw piszczelowy",
    "Tibial nerve",
    "Nervus tibialis",
    "nervous",
    "tibial_nerve",
    notes(
      "Behind the medial malleolus it lies in the tarsal tunnel, posterior to the posterior tibial vessels and anterior to FHL. It divides into medial and lateral plantar nerves; calcaneal branches arise variably. Use the pale nerve texture, not the colour of a neighbouring vessel.",
      "Za kostką przyśrodkową leży w kanale kostki, za naczyniami piszczelowymi tylnymi i przed zginaczem długim palucha. Dzieli się na nerwy podeszwowe przyśrodkowy i boczny; gałęzie piętowe odchodzą zmiennie. Rozpoznawaj jasną strukturę nerwu, nie barwę sąsiedniego naczynia.",
    ),
  ),
  medialPlantar: item(
    "Nerw podeszwowy przyśrodkowy",
    "Medial plantar nerve",
    "Nervus plantaris medialis",
    "nervous",
    "medial_plantar_nerve",
    notes(
      "A terminal tibial branch passing deep to abductor hallucis. It supplies medial sole skin and the plantar medial three-and-a-half toes, plus abductor hallucis, flexor digitorum brevis, flexor hallucis brevis and the first lumbrical.",
      "Gałąź końcowa piszczelowego biegnąca pod odwodzicielem palucha. Zaopatruje skórę przyśrodkowej podeszwy i podeszwowe powierzchnie przyśrodkowych trzech i pół palca oraz odwodziciel palucha, zginacze krótkie palców i palucha oraz pierwszy glistowaty.",
    ),
  ),
  lateralPlantar: item(
    "Nerw podeszwowy boczny",
    "Lateral plantar nerve",
    "Nervus plantaris lateralis",
    "nervous",
    "lateral_plantar_nerve",
    notes(
      "The other terminal tibial branch crosses the sole towards its lateral side and divides into superficial and deep branches. It supplies the lateral sole/toes and most intrinsic plantar muscles not supplied by medial plantar, including the interossei and adductor hallucis.",
      "Druga końcowa gałąź piszczelowego przecina podeszwę ku stronie bocznej i dzieli się na gałęzie powierzchowną oraz głęboką. Zaopatruje boczną podeszwę i palce oraz większość mięśni podeszwy poza zaopatrywanymi przez przyśrodkowy, m.in. międzykostne i przywodziciel palucha.",
    ),
  ),
  tpTendon: item(
    "Ścięgno mięśnia piszczelowego tylnego",
    "Tibialis posterior tendon",
    "Tendo musculi tibialis posterioris",
    "muscular",
    "tibialis_posterior_muscle",
    notes(
      "Immediately behind the medial malleolus, it lies anterior to FDL, the tibial vessels, tibial nerve and FHL. Its principal insertion is the navicular tuberosity with further tarsal/metatarsal expansions. Tibial supply; it inverts and supports the foot arch. 3D shows the muscle.",
      "Tuż za kostką przyśrodkową leży przed zginaczem długim palców, naczyniami piszczelowymi, nerwem i zginaczem długim palucha. Główny przyczep: guzowatość łódkowatej, z dalszymi pasmami do stępu i śródstopia. Nerw piszczelowy; odwraca i podpiera łuk stopy. 3D pokazuje mięsień.",
    ),
  ),
  fdlTendon: item(
    "Ścięgno mięśnia zginacza długiego palców",
    "Flexor digitorum longus tendon",
    "Tendo musculi flexoris digitorum longi",
    "muscular",
    "flexor_digitorum_longus",
    notes(
      "Behind the medial malleolus it follows tibialis posterior, then crosses FHL in the sole and divides for distal phalanges 2–5. Lumbricals and quadratus plantae relate to its distal tendons. Tibial supply; the 3D link shows the parent muscle.",
      "Za kostką przyśrodkową biegnie za piszczelowym tylnym, potem krzyżuje zginacz długi palucha na podeszwie i dzieli się do paliczków dalszych II–V. Z dalszymi ścięgnami związane są glistowate i czworoboczny podeszwy. Nerw piszczelowy; link 3D pokazuje mięsień.",
    ),
  ),
  fhlTendon: item(
    "Ścięgno mięśnia zginacza długiego palucha",
    "Flexor hallucis longus tendon",
    "Tendo musculi flexoris hallucis longi",
    "muscular",
    "flexor_hallucis_longus",
    notes(
      "The posterior tendon behind the medial ankle passes in a groove behind the talus, under the sustentaculum tali, then to the hallux distal phalanx. It flexes the hallux IP joint and receives tibial supply. The 3D link shows the parent muscle.",
      "Tylne ścięgno za przyśrodkowym stawem skokowym przechodzi w bruździe za skokową, pod podpórką skokową, a dalej do paliczka dalszego palucha. Zgina staw międzypaliczkowy palucha; nerw piszczelowy. Link 3D pokazuje cały mięsień.",
    ),
  ),
  abductorHallucis: item(
    "Mięsień odwodziciel palucha",
    "Abductor hallucis",
    "Musculus abductor hallucis",
    "muscular",
    "abductor_hallucis",
    notes(
      "Runs along the medial sole from the calcaneal region to the medial base of the hallux proximal phalanx. Medial plantar supply. It abducts and assists flexion of the hallux. Most of it is removed here to expose the plantar nerves and long flexor tendons.",
      "Biegnie przy przyśrodkowym brzegu podeszwy od okolicy piętowej do przyśrodkowej podstawy paliczka bliższego palucha. Nerw podeszwowy przyśrodkowy. Odwodzi i wspomaga zginanie palucha. Większość usunięto tu dla odsłonięcia nerwów podeszwowych i długich zginaczy.",
    ),
  ),
  plantarAponeurosis: item(
    "Rozcięgno podeszwowe",
    "Plantar aponeurosis",
    "Aponeurosis plantaris",
    "muscular",
    "plantar_aponeurosis",
    notes(
      "A strong superficial plantar sheet extending from the calcaneal tuberosity towards the toes, covering flexor digitorum brevis. It supports the longitudinal arch and tightens with toe extension. The plantar nerves and long flexor tendons lie deep to it.",
      "Mocna powierzchowna blaszka podeszwy od guza piętowego ku palcom, przykrywająca zginacz krótki palców. Podpiera łuk podłużny i napina się przy prostowaniu palców. Głębokie nerwy i ścięgna zginaczy leżą głębiej od niej.",
    ),
  ),
  deltoid: item(
    "Więzadło przyśrodkowe stawu skokowo-goleniowego",
    "Deltoid ligament of ankle",
    "Ligamentum mediale articulationis talocruralis",
    "articular",
    "tibiocalcaneal_ligament",
    notes(
      "A fan-shaped medial ankle complex from the medial malleolus to the talus, calcaneus and navicular region. It resists eversion. The probe separates superficial and deep parts here. The 3D link selects the tibiocalcaneal component, not the entire complex.",
      "Wachlarzowaty przyśrodkowy kompleks od kostki przyśrodkowej do skokowej, piętowej i okolicy łódkowatej. Przeciwdziała nawracaniu stopy. Zgłębnik rozdziela tu części powierzchowną i głęboką. Link 3D wybiera część piszczelowo-piętową, nie cały kompleks.",
    ),
  ),
  spring: item(
    "Więzadło piętowo-łódkowe podeszwowe",
    "Plantar calcaneonavicular ligament",
    "Ligamentum calcaneonaviculare plantare",
    "articular",
    "plantar_calcaneonavicular_ligament",
    notes(
      "From the sustentaculum tali to the navicular, it supports the talar head and medial longitudinal arch. It is plantar to the talonavicular region and differs from the dorsal calcaneonavicular limb of the bifurcate ligament.",
      "Od podpórki skokowej do łódkowatej podpiera głowę skokowej i przyśrodkowy łuk podłużny. Leży podeszwowo od okolicy stawu skokowo-łódkowego. Odróżniaj je od grzbietowej części piętowo-łódkowej więzadła rozdwojonego.",
    ),
  ),
  shortPlantar: item(
    "Więzadło piętowo-sześcienne podeszwowe",
    "Plantar calcaneocuboid ligament",
    "Ligamentum calcaneocuboideum plantare",
    "articular",
    "plantar_calcaneocuboid_ligament",
    notes(
      "The short plantar ligament connects the anterior plantar calcaneus to the plantar cuboid, deep to the long plantar ligament. It reinforces the calcaneocuboid joint; the long ligament extends farther towards metatarsal bases.",
      "Krótkie więzadło podeszwowe łączy przednią podeszwową piętową z podeszwową sześcienną, głęboko od podeszwowego długiego. Wzmacnia staw piętowo-sześcienny. Długie biegnie dalej ku podstawom śródstopia.",
    ),
  ),
  longPlantar: item(
    "Więzadło podeszwowe długie",
    "Long plantar ligament",
    "Ligamentum plantare longum",
    "articular",
    "long_plantar_ligament",
    notes(
      "Extends from the plantar calcaneus to the cuboid and bases of lateral metatarsals. It helps support the longitudinal arch and bridges the fibularis-longus groove on the cuboid, forming a tunnel for that tendon.",
      "Od podeszwowej piętowej do sześciennej i podstaw bocznych kości śródstopia. Wspiera łuk podłużny i przerzuca się nad bruzdą strzałkowego długiego na sześciennej, tworząc kanał dla jego ścięgna.",
    ),
  ),
  atfl: item(
    "Więzadło skokowo-strzałkowe przednie",
    "Anterior talofibular ligament",
    "Ligamentum talofibulare anterius",
    "articular",
    "anterior_talofibular_ligament",
    notes(
      "A short band from the anterior lateral malleolus to the talar neck, lying more horizontally than the calcaneofibular ligament. It limits anterior talar translation relative to the ankle mortise and forms part of the lateral ankle complex.",
      "Krótkie pasmo od przedniej kostki bocznej do szyjki skokowej, biegnące bardziej poziomo niż piętowo-strzałkowe. Ogranicza przesuwanie skokowej do przodu względem widełek kostek. Część bocznego kompleksu więzadłowego.",
    ),
  ),
  cfl: item(
    "Więzadło piętowo-strzałkowe",
    "Calcaneofibular ligament",
    "Ligamentum calcaneofibulare",
    "articular",
    "calcaneofibular_ligament",
    notes(
      "Descends from the lateral malleolus to the lateral calcaneus, deep to the fibular tendons. It crosses the ankle and subtalar region and resists inversion; its oblique downward direction distinguishes it from ATFL.",
      "Schodzi od kostki bocznej do bocznej piętowej, pod ścięgnami strzałkowych. Przekracza okolicę stawu skokowego górnego i skokowo-piętowego, przeciwdziałając odwracaniu. Skośny przebieg w dół odróżnia je od przedniego skokowo-strzałkowego.",
    ),
  ),
  ptfl: item(
    "Więzadło skokowo-strzałkowe tylne",
    "Posterior talofibular ligament",
    "Ligamentum talofibulare posterius",
    "articular",
    "posterior_talofibular_ligament",
    notes(
      "Runs from the malleolar fossa on the fibula towards the posterior talus, nearly transversely in the posterior view. It belongs to the lateral ankle complex; do not confuse it with the higher posterior tibiofibular syndesmotic ligament.",
      "Biegnie od dołu kostki bocznej strzałki ku tylnej skokowej, niemal poprzecznie w widoku tylnym. Należy do bocznego kompleksu stawu. Odróżniaj je od wyżej położonego tylnego więzadła piszczelowo-strzałkowego więzozrostu.",
    ),
  ),
} satisfies Record<string, Content>;

type View = {
  page: number;
  printed: number;
  figure: string;
  region: "upper" | "lower";
  side: "l" | "r";
  crop: PhotoPin["crop"];
  masks?: PhotoPin["masks"];
};
type Position = readonly [
  keyof typeof content,
  number,
  number,
  number,
  string,
  string,
];
export function makeDistalPins(atlasId: string): PhotoPin[] {
  const pins: PhotoPin[] = [];
  const plate = (view: View, rows: readonly Position[]): void => {
    for (const [key, label, x, y, en, pl] of rows) {
      const { model, ...definition } = content[key];
      pins.push({
        ...definition,
        atlasId,
        id: `mcminn-${view.page}-${view.figure}-${label}`,
        page: view.page,
        x: x / 1274,
        y: y / 1800,
        crop: view.crop,
        ...(view.masks ? { masks: view.masks } : {}),
        region: view.region,
        exercise:
          definition.system === "nervous"
            ? view.region === "upper"
              ? 7
              : 8
            : definition.system === "articular"
              ? 3
              : view.region === "upper"
                ? 5
                : 6,
        recognize: notes(en, pl),
        modelId: `${model}_${view.side}`,
        source: `McMinn, Fotograficzny atlas anatomii człowieka · PDF ${view.page} · ${view.printed} · ${view.figure}, ${label}`,
      });
    }
  };
  plate(
    {
      page: 165,
      printed: 162,
      figure: "A",
      region: "upper",
      side: "l",
      crop: { x: 0.08, y: 0.075, w: 0.43, h: 0.645 },
    },
    [
      [
        "median",
        23,
        309,
        779,
        "Left palm: the large central pale nerve emerges from beneath the cut retinaculum and fans into digital branches.",
        "Lewa dłoń: duży centralny jasny nerw wychodzi spod przeciętego troczka i rozdziela się wachlarzowato na gałęzie palcowe.",
      ],
      [
        "ulnar",
        22,
        359,
        842,
        "At the ulnar wrist margin, find the nerve alongside the ulnar artery, superficial to the retinacular plane and medial to the central median nerve.",
        "Przy łokciowym brzegu nadgarstka znajdź nerw obok tętnicy łokciowej, powierzchownie od płaszczyzny troczka i przyśrodkowo od centralnego pośrodkowego.",
      ],
      [
        "deepUlnar",
        3,
        382,
        745,
        "The branch turns from the ulnar wrist into the deep palm, beneath the hypothenar muscles, rather than fanning superficially towards the fingers.",
        "Gałąź skręca od łokciowego nadgarstka do głębi dłoni pod mięśnie kłębika, zamiast rozchodzić się powierzchownie ku palcom.",
      ],
      [
        "recurrentMedian",
        4,
        246,
        608,
        "A short motor twig turns radially back from the median bundle into the thenar muscles, unlike the long digital branches heading towards the fingertips.",
        "Krótka gałązka ruchowa zawraca promieniowo od pęczka pośrodkowego do kłębu, inaczej niż długie gałęzie palcowe biegnące ku opuszkom.",
      ],
      [
        "lumbrical1",
        8,
        271,
        410,
        "The narrow fleshy slip follows the radial side of the index deep-flexor tendon, distal to the thenar region. Count the finger before naming the lumbrical.",
        "Wąskie mięsiste pasmo biegnie po promieniowej stronie ścięgna głębokiego zginacza wskaziciela, dystalnie od kłębu. Ustal palec, zanim nazwiesz glistowaty.",
      ],
      [
        "lumbrical2",
        7,
        340,
        475,
        "The second slender belly lies beside the deep-flexor tendon leading to the middle finger, ulnar to the first lumbrical.",
        "Drugi smukły brzusiec leży przy ścięgnie głębokim prowadzącym do palca środkowego, po stronie łokciowej od pierwszego glistowatego.",
      ],
      [
        "apb",
        11,
        213,
        651,
        "The superficial thenar belly lies along the radial palm border, lateral to the exposed thumb flexor tendon and recurrent nerve twig.",
        "Powierzchowny brzusiec kłębu leży przy promieniowym brzegu dłoni, bocznie od odsłoniętego ścięgna zginacza kciuka i gałązki wstecznej.",
      ],
      [
        "fpb",
        16,
        198,
        566,
        "The short thenar flexor lies near the proximal thumb and its sesamoid region, beside the long flexor tendon rather than extending proximally into the forearm.",
        "Krótki zginacz kłębu leży przy bliższym kciuku i okolicy trzeszczek, obok ścięgna długiego zginacza, zamiast przechodzić proksymalnie w przedramię.",
      ],
      [
        "adm",
        12,
        518,
        629,
        "The superficial elongated muscle follows the ulnar hand border towards the little finger, forming the outer hypothenar contour.",
        "Powierzchowny podłużny mięsień biegnie przy łokciowym brzegu ręki ku palcowi małemu i tworzy zewnętrzny obrys kłębika.",
      ],
      [
        "fdm",
        17,
        453,
        630,
        "The shorter hypothenar flexor lies radial to abductor digiti minimi and alongside the little-finger flexor tendons.",
        "Krótszy zginacz kłębika leży promieniowo od odwodziciela małego i przy ścięgnach zginaczy palca małego.",
      ],
      [
        "fplTendon",
        15,
        275,
        808,
        "At the radial wrist, trace the single thumb flexor tendon into the thenar interval; it does not join the four long-finger tendon bundles.",
        "Przy promieniowym nadgarstku prześledź pojedyncze ścięgno zginacza kciuka do szczeliny kłębu. Nie dołącza do czterech pęczków długich palców.",
      ],
      [
        "fcrTendon",
        19,
        244,
        1111,
        "The radial forearm tendon runs along the radial side of the wrist, separate from the central finger-flexor bundle and the more medial median nerve.",
        "Promieniowe ścięgno przedramienia biegnie przy promieniowej stronie nadgarstka, osobno od centralnego pęczka zginaczy palców i bardziej przyśrodkowego pośrodkowego.",
      ],
      [
        "fdpTendon",
        20,
        356,
        919,
        "The deep flexor tendon bundle is exposed under the more superficial tendons at the wrist and continues towards the lumbrical origins in the palm.",
        "Głęboki pęczek ścięgien zginaczy jest odsłonięty pod bardziej powierzchownymi ścięgnami przy nadgarstku i biegnie ku początkom glistowatych na dłoni.",
      ],
      [
        "fdsTendon",
        21,
        287,
        967,
        "The superficial long-finger flexor bundle lies in front of the deep tendons near the distal forearm. Trace it into the common carpal-tunnel pathway.",
        "Powierzchowny pęczek zginaczy długich palców leży przed ścięgnami głębokimi przy dalszym przedramieniu. Prześledź wejście do wspólnego przebiegu kanału nadgarstka.",
      ],
      [
        "wristFlexorRet",
        28,
        283,
        719,
        "The retained pale edge spans the carpal region just proximal to the median nerve's palmar fan. Part of the roof has been divided to expose the contents.",
        "Zachowany jasny brzeg przebiega przez okolicę nadgarstka tuż proksymalnie od wachlarza pośrodkowego. Część dachu przecięto dla odsłonięcia zawartości.",
      ],
    ],
  );
  plate(
    {
      page: 169,
      printed: 166,
      figure: "A",
      region: "upper",
      side: "r",
      crop: { x: 0.035, y: 0.047, w: 0.41, h: 0.325 },
    },
    [
      [
        "deepUlnar",
        2,
        207,
        495,
        "In the right palm, follow the pale branch ascending from the ulnar wrist then turning deeply across the palm towards the adductor-pollicis interval.",
        "Na prawej dłoni prześledź jasną gałąź od łokciowego nadgarstka, skręcającą w głąb w poprzek dłoni do szczeliny przywodziciela kciuka.",
      ],
      [
        "adductorTransverse",
        4,
        351,
        289,
        "The broad proximal-thumb muscle fibres run transversely across the metacarpal region, above the oblique adductor head in this view.",
        "Szerokie włókna mięśnia przy bliższym kciuku biegną poprzecznie przez okolicę śródręcza, nad głową skośną przywodziciela w tym widoku.",
      ],
      [
        "adductorOblique",
        5,
        313,
        382,
        "The more oblique central fibres converge towards the thumb from the carpal/metacarpal-base region, below the transverse head.",
        "Bardziej skośne centralne włókna zbiegają ku kciukowi od okolicy nadgarstka i podstaw śródręcza, poniżej głowy poprzecznej.",
      ],
      [
        "opponensPollicis",
        12,
        395,
        474,
        "The deep thenar belly follows the first metacarpal, exposed after superficial thenar tissue is moved; it ends on the metacarpal rather than a thumb phalanx.",
        "Głęboki brzusiec kłębu biegnie wzdłuż I śródręcza, odsłonięty po przesunięciu powierzchownych tkanek. Kończy się na śródręczu, nie na paliczku kciuka.",
      ],
      [
        "opponensMinimi",
        13,
        181,
        484,
        "The deep hypothenar fibres lie close to the fifth metacarpal, beneath the more superficial little-finger muscles and beside the deep ulnar branch.",
        "Głębokie włókna kłębika leżą przy V śródręczu pod powierzchownymi mięśniami małego palca, obok gałęzi głębokiej łokciowego.",
      ],
      [
        "apb",
        10,
        487,
        418,
        "The retained superficial thenar strip lies at the radial edge of this right palm, superficial to the exposed opponens-pollicis belly.",
        "Zachowane powierzchowne pasmo kłębu leży przy promieniowym brzegu prawej dłoni, nad odsłoniętym brzuścem przeciwstawiacza kciuka.",
      ],
    ],
  );
  plate(
    {
      page: 169,
      printed: 166,
      figure: "B",
      region: "upper",
      side: "r",
      crop: { x: 0.06, y: 0.54, w: 0.34, h: 0.44 },
    },
    [
      [
        "pronatorQuadratus",
        5,
        233,
        1558,
        "The broad transverse muscle covers the distal anterior radius and ulna beneath the removed long flexor tendons, proximal to the divided carpal retinaculum.",
        "Szeroki poprzeczny mięsień przykrywa dalszą przednią promieniową i łokciową pod usuniętymi długimi zginaczami, proksymalnie od przeciętego troczka.",
      ],
    ],
  );
  plate(
    {
      page: 171,
      printed: 168,
      figure: "A",
      region: "upper",
      side: "l",
      crop: { x: 0.035, y: 0.043, w: 0.45, h: 0.472 },
    },
    [
      [
        "edmTendon",
        11,
        177,
        476,
        "On the dorsal left hand, the tendon on the ulnar side of the extensor fan heads towards the little finger; this specimen shows the characteristic paired slips.",
        "Na grzbiecie lewej ręki ścięgno po łokciowej stronie wachlarza prostowników zmierza do palca małego. Preparat pokazuje charakterystyczne podwójne pasma.",
      ],
      [
        "edTendon",
        12,
        268,
        466,
        "Follow a central long tendon from the fourth wrist compartment towards a long finger, noting the transverse connections to neighbouring slips.",
        "Prześledź centralne długie ścięgno od IV przedziału nadgarstka ku długiemu palcowi, zwracając uwagę na poprzeczne połączenia z sąsiednimi pasmami.",
      ],
      [
        "eplTendon",
        8,
        410,
        731,
        "The tendon turns obliquely from the central dorsal wrist towards the thumb, forming the ulnar margin of the snuffbox rather than following a straight radial course.",
        "Ścięgno skręca skośnie od środkowego grzbietu nadgarstka do kciuka, tworząc łokciowy brzeg tabakierki, zamiast biec prosto po stronie promieniowej.",
      ],
      [
        "epbTendon",
        9,
        453,
        742,
        "The shorter thumb extensor travels along the radial snuffbox border beside APL, heading to the proximal thumb phalanx rather than crossing from the central wrist.",
        "Krótszy prostownik kciuka biegnie przy promieniowym brzegu tabakierki obok odwodziciela długiego, ku paliczkowi bliższemu, zamiast przecinać grzbiet od środka nadgarstka.",
      ],
      [
        "eiTendon",
        16,
        394,
        410,
        "The additional slender tendon accompanies the index extensor tendon on its ulnar side. Trace the digit first to distinguish it from slips to the middle and ring fingers.",
        "Dodatkowe smukłe ścięgno towarzyszy prostownikowi wskaziciela po stronie łokciowej. Najpierw ustal palec, aby nie pomylić go z pasmami do środkowego i obrączkowego.",
      ],
      [
        "ecrlTendon",
        14,
        426,
        683,
        "On the radial dorsal wrist, the more radial of the two carpal-extensor tendons runs towards the second metacarpal base, deep to the crossing thumb tendon.",
        "Na promieniowym grzbiecie nadgarstka bardziej promieniowe z dwóch ścięgien prostowników nadgarstka biegnie do podstawy II śródręcza, pod krzyżującym ścięgnem kciuka.",
      ],
      [
        "ecrbTendon",
        15,
        385,
        718,
        "The neighbouring more ulnar carpal-extensor tendon leads to the third metacarpal base. Compare its insertion path with the longer radial extensor beside it.",
        "Sąsiednie bardziej łokciowe ścięgno prostownika nadgarstka prowadzi do podstawy III śródręcza. Porównaj drogę przyczepu z leżącym obok prostownikiem promieniowym długim.",
      ],
      [
        "aplTendon",
        6,
        462,
        714,
        "The arrow points to the radial thumb tendon approaching the first metacarpal base, beside EPB at the first dorsal compartment.",
        "Strzałka wskazuje promieniowe ścięgno kciuka dochodzące do podstawy I śródręcza, obok prostownika krótkiego przy I przedziale grzbietowym.",
      ],
      [
        "wristExtensorRet",
        17,
        319,
        785,
        "The broad pale transverse band crosses the dorsal wrist and holds the long tendons down; identify the band itself rather than one of the longitudinal tendons beneath it.",
        "Szerokie jasne poprzeczne pasmo przecina grzbiet nadgarstka, przytrzymując długie ścięgna. Rozpoznaj samo pasmo, a nie jedno z podłużnych ścięgien pod nim.",
      ],
      [
        "interosseous1",
        4,
        497,
        492,
        "The fleshy first web-space muscle lies between the thumb and index metacarpals, deep to the long tendons.",
        "Mięsisty mięsień pierwszej przestrzeni leży między śródręczem kciuka i wskaziciela, pod długimi ścięgnami.",
      ],
      [
        "interosseous2",
        3,
        371,
        397,
        "The dorsal muscle belly occupies the interval between the index and middle metacarpals, distinct from the white longitudinal extensor tendons over it.",
        "Grzbietowy brzusiec wypełnia przestrzeń między śródręczem wskaziciela i środkowego, odróżniając się od przebiegających nad nim białych podłużnych ścięgien.",
      ],
    ],
  );
  plate(
    {
      page: 346,
      printed: 345,
      figure: "C",
      region: "lower",
      side: "r",
      crop: { x: 0.05, y: 0.1, w: 0.235, h: 0.35 },
    },
    [
      [
        "sural",
        11,
        94,
        460,
        "Lateral right ankle: the slender nerve descends on the posterior side of the lateral malleolus, outside the fibular tendon sheaths.",
        "Boczna prawa kostka: smukły nerw schodzi po tylnej stronie kostki bocznej, poza pochewkami ścięgien strzałkowych.",
      ],
      [
        "achilles",
        16,
        135,
        600,
        "The broad posterior tendon leads straight to the posterior heel, behind the fibular tendons and the lateral malleolus.",
        "Szerokie tylne ścięgno prowadzi prosto do tyłu pięty, za ścięgnami strzałkowych i kostką boczną.",
      ],
      [
        "superiorFibRet",
        20,
        264,
        682,
        "The short band directly behind the lateral malleolus holds the two fibular tendons against their retromalleolar groove.",
        "Krótkie pasmo bezpośrednio za kostką boczną utrzymuje dwa ścięgna strzałkowych przy ich bruździe zakostkowej.",
      ],
    ],
  );
  plate(
    {
      page: 346,
      printed: 345,
      figure: "C",
      region: "lower",
      side: "r",
      crop: { x: 0.14, y: 0.3, w: 0.795, h: 0.245 },
      masks: [{ x: 0.43, y: 0.3, w: 0.57, h: 0.065 }],
    },
    [
      [
        "edb",
        7,
        530,
        740,
        "The fleshy belly is on the dorsolateral foot, under the long extensor tendons and distal to the extensor retinaculum.",
        "Mięsisty brzusiec leży na grzbietowo-bocznej stopie, pod długimi prostownikami i dystalnie od ich troczka.",
      ],
      [
        "fibularisBrevisTendon",
        9,
        484,
        832,
        "Below the lateral calcaneal retinaculum, follow the upper fibular tendon forwards towards the fifth metatarsal tuberosity; longus takes a lower plantar route.",
        "Pod bocznym troczkiem piętowej prześledź górne ścięgno strzałkowe do przodu ku guzowatości V śródstopia. Długie obiera niższą drogę podeszwową.",
      ],
      [
        "inferiorExtRet",
        17,
        460,
        666,
        "The pale oblique band crosses the anterior ankle towards the dorsal foot, in front of the lateral malleolus and over the long extensor tendons.",
        "Jasne skośne pasmo przecina przedni staw skokowy ku grzbietowi stopy, przed kostką boczną i nad długimi ścięgnami prostowników.",
      ],
      [
        "inferiorFibRet",
        18,
        369,
        781,
        "The lower retinacular band lies on the lateral calcaneus, distal to the retromalleolar band, where the two fibular tendons take separate paths.",
        "Dolne pasmo troczka leży na bocznej piętowej, dystalnie od pasma zakostkowego, w miejscu rozchodzenia się dwóch ścięgien strzałkowych.",
      ],
    ],
  );
  plate(
    {
      page: 347,
      printed: 346,
      figure: "B",
      region: "lower",
      side: "r",
      crop: { x: 0.465, y: 0.168, w: 0.53, h: 0.38 },
      masks: [{ x: 0.34, y: 0.168, w: 0.3, h: 0.18 }],
    },
    [
      [
        "tibial",
        9,
        1043,
        445,
        "Medial right ankle: the pale cord is posterior to the tibial vessels and between the long-flexor tendons, before dividing into plantar branches.",
        "Przyśrodkowa prawa kostka: jasny sznur leży za naczyniami piszczelowymi i między długimi ścięgnami zginaczy, przed podziałem na gałęzie podeszwowe.",
      ],
      [
        "medialPlantar",
        11,
        967,
        785,
        "The larger plantar branch follows the medial sole distally alongside its artery, after the tibial nerve divides beneath the exposed medial ankle.",
        "Większa gałąź podeszwowa biegnie dystalnie przy przyśrodkowej podeszwie z tętnicą, po podziale piszczelowego pod odsłoniętą kostką przyśrodkową.",
      ],
      [
        "lateralPlantar",
        10,
        1075,
        600,
        "The other branch leaves the tibial division towards the deeper lateral sole, rather than continuing along the long medial path beside the medial plantar artery.",
        "Druga gałąź odchodzi od podziału piszczelowego ku głębszej bocznej podeszwie, zamiast kontynuować długą przyśrodkową drogę przy tętnicy podeszwowej przyśrodkowej.",
      ],
      [
        "tpTendon",
        6,
        977,
        450,
        "Immediately behind the medial malleolus, the anterior-most thick tendon turns towards the navicular tuberosity.",
        "Bezpośrednio za kostką przyśrodkową najbardziej przednie grube ścięgno skręca ku guzowatości łódkowatej.",
      ],
      [
        "fdlTendon",
        7,
        994,
        474,
        "The next long tendon posterior to tibialis posterior runs down towards the sole, anterior to the neurovascular bundle at the ankle.",
        "Następne długie ścięgno za piszczelowym tylnym schodzi ku podeszwie, przed pęczkiem naczyniowo-nerwowym przy kostce.",
      ],
      [
        "fhlTendon",
        8,
        1050,
        365,
        "The posterior long-flexor tendon lies deep and behind the tibial neurovascular structures, then passes towards the hallux under the medial foot.",
        "Tylne długie ścięgno zginacza leży głęboko za strukturami naczyniowo-nerwowymi piszczelowymi i biegnie ku paluchowi pod przyśrodkową stopą.",
      ],
      [
        "abductorHallucis",
        4,
        691,
        952,
        "The retained cut muscle at the distal medial edge marks the superficial layer removed to expose the deeper plantar tendons and nerve branches.",
        "Zachowany przecięty mięsień przy dalszym przyśrodkowym brzegu wskazuje usuniętą powierzchowną warstwę, pod którą odsłonięto głębsze ścięgna i gałęzie nerwowe.",
      ],
      [
        "plantarAponeurosis",
        12,
        1080,
        788,
        "The broad white fibrous sheet forms the superficial plantar boundary below the exposed neurovascular and long-flexor structures.",
        "Szeroka biała włóknista blaszka tworzy powierzchowną podeszwową granicę poniżej odsłoniętych struktur naczyniowo-nerwowych i długich zginaczy.",
      ],
    ],
  );
  plate(
    {
      page: 350,
      printed: 349,
      figure: "C",
      region: "lower",
      side: "l",
      crop: { x: 0.035, y: 0.098, w: 0.304, h: 0.182 },
    },
    [
      [
        "deltoid",
        22,
        165,
        310,
        "Medial left ankle: the fan-shaped band descends from the medial malleolus. The transverse probe separates its superficial and deep portions.",
        "Przyśrodkowy lewy staw skokowy: wachlarzowate pasmo schodzi od kostki przyśrodkowej. Poprzeczny zgłębnik oddziela jego części powierzchowną i głęboką.",
      ],
      [
        "spring",
        15,
        243,
        408,
        "The short band beneath the talar-head/navicular region lies above the probe and above the lower plantar ligaments.",
        "Krótkie pasmo pod okolicą głowy skokowej i łódkowatej leży nad zgłębnikiem i nad niższymi więzadłami podeszwowymi.",
      ],
      [
        "shortPlantar",
        18,
        265,
        448,
        "The deeper short plantar band lies below the probe, spanning the anterior calcaneal region towards the cuboid, above the long plantar sheet.",
        "Głębsze krótkie pasmo podeszwowe leży pod zgłębnikiem, od przedniej piętowej ku sześciennej, nad długą blaszką podeszwową.",
      ],
      [
        "longPlantar",
        20,
        260,
        478,
        "The lowest broad band runs along the plantar calcaneal surface and continues forwards, superficial to the shorter calcaneocuboid ligament.",
        "Najniższe szerokie pasmo biegnie przy podeszwowej powierzchni piętowej do przodu, powierzchownie od krótszego piętowo-sześciennego.",
      ],
    ],
  );
  plate(
    {
      page: 350,
      printed: 349,
      figure: "D",
      region: "lower",
      side: "l",
      crop: { x: 0.023, y: 0.3, w: 0.329, h: 0.163 },
    },
    [
      [
        "atfl",
        23,
        217,
        618,
        "Lateral left ankle: the short nearly horizontal band connects the anterior edge of the lateral malleolus with the talar neck, above the sinus tarsi.",
        "Boczny lewy staw skokowy: krótkie niemal poziome pasmo łączy przedni brzeg kostki bocznej z szyjką skokowej, nad zatoką stępu.",
      ],
      [
        "cfl",
        16,
        290,
        650,
        "The oblique cord descends backwards from the lateral malleolus towards the lateral calcaneus, posterior to the sinus-tarsi region.",
        "Skośny sznur schodzi ku tyłowi od kostki bocznej do bocznej piętowej, za okolicą zatoki stępu.",
      ],
    ],
  );
  plate(
    {
      page: 350,
      printed: 349,
      figure: "E",
      region: "lower",
      side: "l",
      crop: { x: 0.428, y: 0.263, w: 0.227, h: 0.219 },
    },
    [
      [
        "ptfl",
        24,
        662,
        632,
        "Posterior left ankle: the lower transverse band joins the fibular malleolar fossa to the posterior talus, below the tibiofibular syndesmotic bands.",
        "Tył lewego stawu skokowego: dolne poprzeczne pasmo łączy dół kostki bocznej z tylną skokową, poniżej pasm więzozrostu piszczelowo-strzałkowego.",
      ],
    ],
  );
  return pins;
}

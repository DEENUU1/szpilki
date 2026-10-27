import type { PhotoPin } from "./photo-data";

type Content = Pick<
  PhotoPin,
  "pl" | "en" | "latin" | "system" | "theory" | "modelId"
>;
type Notes = { en: string; pl: string };
const notes = (en: string, pl: string): Notes => ({ en, pl });
const structure = (
  pl: string,
  en: string,
  latin: string,
  system: PhotoPin["system"],
  modelId: string | null,
  theory: Notes,
): Content => ({ pl, en, latin, system, modelId, theory });

// Original teaching notes. Plate identifiers and coordinates refer to the supplied
// Polish McMinn scan, not to other editions. No textbook images are bundled here.
const content = {
  median: structure(
    "Nerw pośrodkowy",
    "Median nerve",
    "Nervus medianus",
    "nervous",
    "median_nerve_r",
    notes(
      "The lateral and medial cords contribute its two roots. In the arm it accompanies the brachial artery; distally its anterior interosseous branch supplies deep forearm muscles and its terminal branches supply much of the thenar region and lateral digits.",
      "Powstaje z korzeni od pęczków bocznego i przyśrodkowego. W ramieniu towarzyszy tętnicy ramiennej. Dalej oddaje nerw międzykostny przedni do głębokich mięśni przedramienia oraz gałęzie końcowe do części kłębu i palców po stronie promieniowej.",
    ),
  ),
  ulnar: structure(
    "Nerw łokciowy",
    "Ulnar nerve",
    "Nervus ulnaris",
    "nervous",
    "ulnar_nerve_r",
    notes(
      "A terminal branch of the medial cord. It passes behind the medial epicondyle, supplies flexor carpi ulnaris and the medial part of flexor digitorum profundus, then most intrinsic hand muscles through its deep branch.",
      "Gałąź końcowa pęczka przyśrodkowego. Przechodzi za nadkłykciem przyśrodkowym, unerwia zginacz łokciowy nadgarstka i przyśrodkową część zginacza głębokiego palców, a przez gałąź głęboką większość mięśni własnych ręki.",
    ),
  ),
  musculocutaneous: structure(
    "Nerw mięśniowo-skórny",
    "Musculocutaneous nerve",
    "Nervus musculocutaneus",
    "nervous",
    "musculocutaneous_nerve_r",
    notes(
      "A lateral-cord branch that pierces coracobrachialis and runs between biceps and brachialis. It supplies these anterior arm muscles and continues beyond the elbow as the lateral antebrachial cutaneous nerve.",
      "Odchodzi od pęczka bocznego, przebija kruczo-ramienny i biegnie między dwugłowym a ramiennym. Unerwia te mięśnie przedniej grupy ramienia, a za łokciem przechodzi w nerw skórny boczny przedramienia.",
    ),
  ),
  axillary: structure(
    "Nerw pachowy",
    "Axillary nerve",
    "Nervus axillaris",
    "nervous",
    "axillary_nerve_r",
    notes(
      "From the posterior cord, chiefly C5–C6. It crosses the quadrangular space with the posterior circumflex humeral vessels, winds around the surgical neck and supplies deltoid and teres minor; a cutaneous branch reaches the upper lateral arm.",
      "Od pęczka tylnego, głównie C5–C6. Przechodzi przez otwór pachowy boczny z naczyniami okalającymi ramię tylnymi, otacza szyjkę chirurgiczną i unerwia naramienny oraz obły mniejszy. Gałąź skórna dochodzi do górnej bocznej części ramienia.",
    ),
  ),
  radial: structure(
    "Nerw promieniowy",
    "Radial nerve",
    "Nervus radialis",
    "nervous",
    "radial_nerve_r",
    notes(
      "A posterior-cord continuation. It accompanies the profunda brachii artery in the radial groove, supplies the posterior arm and divides near the lateral elbow into superficial sensory and deep motor branches.",
      "Przedłużenie pęczka tylnego. Z tętnicą głęboką ramienia biegnie w bruździe nerwu promieniowego, unerwia tylną grupę ramienia, a przy bocznej stronie łokcia dzieli się na powierzchowną gałąź czuciową i głęboką ruchową.",
    ),
  ),
  thoracodorsal: structure(
    "Nerw piersiowo-grzbietowy",
    "Thoracodorsal nerve",
    "Nervus thoracodorsalis",
    "nervous",
    "thoracodorsal_nerve_r",
    notes(
      "A posterior-cord branch, usually C6–C8, descending on the posterior axillary wall with thoracodorsal vessels. It supplies latissimus dorsi; distinguish it from subscapular branches that end in nearby muscles.",
      "Gałąź pęczka tylnego, zwykle C6–C8. Zstępuje po tylnej ścianie pachy z naczyniami piersiowo-grzbietowymi. Unerwia najszerszy grzbietu; odróżniaj ją od gałęzi podłopatkowych kończących się w sąsiednich mięśniach.",
    ),
  ),
  medialForearm: structure(
    "Nerw skórny przyśrodkowy przedramienia",
    "Medial antebrachial cutaneous nerve",
    "Nervus cutaneus antebrachii medialis",
    "nervous",
    "medial_antebrachial_cutaneous_nerve_r",
    notes(
      "A sensory branch of the medial cord. It travels down the medial arm and divides into anterior and posterior branches supplying the medial forearm; it does not supply the forearm flexor muscles.",
      "Czuciowa gałąź pęczka przyśrodkowego. Schodzi po przyśrodkowej stronie ramienia i dzieli się na gałęzie przednią i tylną do skóry przyśrodkowej części przedramienia. Nie unerwia mięśni zginaczy.",
    ),
  ),
  medialArm: structure(
    "Nerw skórny przyśrodkowy ramienia",
    "Medial brachial cutaneous nerve",
    "Nervus cutaneus brachii medialis",
    "nervous",
    "medial_brachial_cutaneous_nerve_r",
    notes(
      "A small sensory branch of the medial cord for medial arm skin. It may communicate with the intercostobrachial nerve, which comes from an intercostal nerve rather than the brachial plexus.",
      "Drobna gałąź czuciowa pęczka przyśrodkowego do skóry przyśrodkowej części ramienia. Może łączyć się z nerwem międzyżebrowo-ramiennym, pochodzącym z nerwu międzyżebrowego, a nie ze splotu ramiennego.",
    ),
  ),
  coracobrachialis: structure(
    "Mięsień kruczo-ramienny",
    "Coracobrachialis",
    "Musculus coracobrachialis",
    "muscular",
    "coracobrachialis_muscle_r",
    notes(
      "Runs from the coracoid process to the medial humeral shaft. It flexes and adducts the arm. The musculocutaneous nerve usually pierces its belly, a useful distinction from the adjacent short head of biceps.",
      "Biegnie od wyrostka kruczego do przyśrodkowej powierzchni trzonu kości ramiennej. Zgina i przywodzi ramię. Nerw mięśniowo-skórny zwykle przebija jego brzusiec — to wskazówka odróżniająca go od sąsiedniej głowy krótkiej dwugłowego.",
    ),
  ),
  subscapularis: structure(
    "Mięsień podłopatkowy",
    "Subscapularis",
    "Musculus subscapularis",
    "muscular",
    "subscapularis_muscle_r",
    notes(
      "From the subscapular fossa to the lesser humeral tubercle. This rotator-cuff muscle medially rotates the arm and stabilises the humeral head. Upper and lower subscapular nerves supply it.",
      "Od dołu podłopatkowego do guzka mniejszego kości ramiennej. Należy do stożka rotatorów, obraca ramię do wewnątrz i stabilizuje głowę kości ramiennej. Unerwiają go nerwy podłopatkowe górny i dolny.",
    ),
  ),
  teresMajor: structure(
    "Mięsień obły większy",
    "Teres major",
    "Musculus teres major",
    "muscular",
    "teres_major_muscle_r",
    notes(
      "From the inferior scapular region to the medial lip of the intertubercular sulcus. It adducts and medially rotates the arm, is supplied by the lower subscapular nerve and is not a rotator-cuff muscle.",
      "Od dolnej okolicy łopatki do grzebienia guzka mniejszego. Przywodzi i obraca ramię do wewnątrz, unerwia go nerw podłopatkowy dolny. Nie należy do stożka rotatorów.",
    ),
  ),
  teresMinor: structure(
    "Mięsień obły mniejszy",
    "Teres minor",
    "Musculus teres minor",
    "muscular",
    "teres_minor_muscle_r",
    notes(
      "From the lateral scapular border to the inferior facet of the greater tubercle. An axillary-nerve muscle of the rotator cuff, it laterally rotates the arm and forms the upper border of the quadrangular space.",
      "Od brzegu bocznego łopatki do dolnego pola guzka większego. Mięsień stożka rotatorów unerwiony przez nerw pachowy. Obraca ramię na zewnątrz i tworzy górne ograniczenie otworu pachowego bocznego.",
    ),
  ),
  tricepsMedial: structure(
    "Głowa przyśrodkowa mięśnia trójgłowego ramienia",
    "Medial head of triceps brachii",
    "Caput mediale musculi tricipitis brachii",
    "muscular",
    "medial_head_of_triceps_brachii_r",
    notes(
      "Arises from the posterior humerus below the radial groove and joins the common insertion on the olecranon. Supplied by the radial nerve, it extends the elbow and lies deep to the other two heads proximally.",
      "Rozpoczyna się na tylnej powierzchni kości ramiennej poniżej bruzdy nerwu promieniowego i dochodzi do wspólnego przyczepu na wyrostku łokciowym. Unerwiona przez nerw promieniowy, prostuje łokieć; bliżej barku leży głęboko względem pozostałych głów.",
    ),
  ),
  tricepsLong: structure(
    "Głowa długa mięśnia trójgłowego ramienia",
    "Long head of triceps brachii",
    "Caput longum musculi tricipitis brachii",
    "muscular",
    "long_head_of_triceps_brachii_r",
    notes(
      "Arises from the infraglenoid tubercle and inserts with the other heads on the olecranon. Radial-nerve supply. It crosses the shoulder as well as the elbow and separates the triangular and quadrangular spaces.",
      "Rozpoczyna się na guzku podpanewkowym i wraz z innymi głowami kończy na wyrostku łokciowym. Unerwia ją nerw promieniowy. Przekracza stawy ramienny i łokciowy oraz oddziela otwory pachowe przyśrodkowy i boczny.",
    ),
  ),
  tricepsLateral: structure(
    "Głowa boczna mięśnia trójgłowego ramienia",
    "Lateral head of triceps brachii",
    "Caput laterale musculi tricipitis brachii",
    "muscular",
    "lateral_head_of_triceps_brachii_r",
    notes(
      "Arises from posterior humerus above the radial groove and joins the olecranon tendon. The radial nerve supplies it and passes deep to it with profunda brachii vessels; its principal action is elbow extension.",
      "Rozpoczyna się na kości ramiennej powyżej bruzdy nerwu promieniowego i łączy ze ścięgnem do wyrostka łokciowego. Unerwia ją nerw promieniowy, biegnący pod nią z naczyniami głębokimi ramienia. Główna czynność: prostowanie łokcia.",
    ),
  ),
  latTendon: structure(
    "Ścięgno mięśnia najszerszego grzbietu",
    "Latissimus dorsi tendon",
    "Tendo musculi latissimi dorsi",
    "muscular",
    "latissimus_dorsi_muscle_r",
    notes(
      "The tendon reaches the floor of the intertubercular sulcus, between the insertions of pectoralis major and teres major. Thoracodorsal-nerve supply; the muscle extends, adducts and medially rotates the arm. The 3D link shows the muscle as a whole.",
      "Ścięgno dochodzi do dna bruzdy międzyguzkowej, między przyczepami piersiowego większego i obłego większego. Unerwienie: nerw piersiowo-grzbietowy. Mięsień prostuje, przywodzi i obraca ramię do wewnątrz. Link 3D pokazuje cały mięsień.",
    ),
  ),
  latissimus: structure(
    "Mięsień najszerszy grzbietu",
    "Latissimus dorsi",
    "Musculus latissimus dorsi",
    "muscular",
    "latissimus_dorsi_muscle_r",
    notes(
      "A broad superficial back muscle converging on the intertubercular sulcus. It forms the posterior axillary fold with teres major, extends and adducts the arm, and is supplied by the thoracodorsal nerve.",
      "Szeroki powierzchowny mięsień grzbietu zbiegający do bruzdy międzyguzkowej. Z obłym większym tworzy tylny fałd pachowy, prostuje i przywodzi ramię. Unerwia go nerw piersiowo-grzbietowy.",
    ),
  ),
  infraspinatus: structure(
    "Mięsień podgrzebieniowy",
    "Infraspinatus",
    "Musculus infraspinatus",
    "muscular",
    "infraspinatus_muscle_r",
    notes(
      "From the infraspinous fossa to the middle facet of the greater tubercle. Supplied by the suprascapular nerve, it laterally rotates the arm and stabilises the shoulder as part of the rotator cuff.",
      "Od dołu podgrzebieniowego do środkowego pola guzka większego. Unerwiony przez nerw nadłopatkowy, obraca ramię na zewnątrz i stabilizuje staw ramienny jako część stożka rotatorów.",
    ),
  ),
  deltoidPosterior: structure(
    "Część grzebieniowa mięśnia naramiennego",
    "Spinal part of deltoid",
    "Pars spinalis musculi deltoidei",
    "muscular",
    "scapular_spinal_part_of_deltoid_muscle_r",
    notes(
      "Its posterior fibres run from the scapular spine towards the deltoid tuberosity. They extend and laterally rotate the arm. Like the other deltoid parts, they receive axillary-nerve supply.",
      "Tylne włókna biegną od grzebienia łopatki ku guzowatości naramiennej. Prostują i obracają ramię na zewnątrz. Tak jak pozostałe części naramiennego są unerwione przez nerw pachowy.",
    ),
  ),
  trapezius: structure(
    "Część poprzeczna mięśnia czworobocznego",
    "Transverse part of trapezius",
    "Pars transversa musculi trapezii",
    "muscular",
    "transverse_part_of_trapezius_muscle_r",
    notes(
      "Transverse fibres attach to the acromion and scapular spine and retract the scapula. The accessory nerve supplies motor fibres; cervical spinal nerves carry proprioceptive input. Rhomboids lie deeper along the medial scapular border.",
      "Włókna poprzeczne dochodzą do wyrostka barkowego i grzebienia łopatki, cofając łopatkę. Ruchowo unerwia je nerw dodatkowy, a czucie głębokie przewodzą nerwy szyjne. Głębiej przy brzegu przyśrodkowym leżą mięśnie równoległoboczne.",
    ),
  ),
  rhomboid: structure(
    "Mięsień równoległoboczny większy",
    "Rhomboid major",
    "Musculus rhomboideus major",
    "muscular",
    "rhomboid_major_muscle_r",
    notes(
      "From upper thoracic spinous processes to the medial scapular border below the spine. The dorsal scapular nerve supplies it. It retracts and downwardly rotates the scapula and lies deep to trapezius.",
      "Od wyrostków kolczystych górnych kręgów piersiowych do brzegu przyśrodkowego łopatki poniżej grzebienia. Unerwia go nerw grzbietowy łopatki. Cofa i obraca łopatkę kątem dolnym przyśrodkowo; leży pod czworobocznym.",
    ),
  ),
  pecMinor: structure(
    "Mięsień piersiowy mniejszy",
    "Pectoralis minor",
    "Musculus pectoralis minor",
    "muscular",
    "pectoralis_minor_muscle_r",
    notes(
      "From ribs 3–5 towards the coracoid process, deep to pectoralis major. It draws the scapula anteriorly and inferiorly. The medial pectoral nerve commonly pierces it; it divides the axillary artery into three topographic parts.",
      "Od żeber III–V do wyrostka kruczego, głęboko względem piersiowego większego. Przesuwa łopatkę do przodu i w dół. Często przebija go nerw piersiowy przyśrodkowy. Dzieli przebieg tętnicy pachowej na trzy odcinki topograficzne.",
    ),
  ),
  subclavius: structure(
    "Mięsień podobojczykowy",
    "Subclavius",
    "Musculus subclavius",
    "muscular",
    "subclavius_muscle_r",
    notes(
      "Runs from the first rib and its cartilage to the inferior clavicle. It anchors and depresses the clavicle, and is supplied by the nerve to subclavius from the upper trunk of the brachial plexus.",
      "Biegnie od I żebra i jego chrząstki do dolnej powierzchni obojczyka. Ustala i obniża obojczyk. Unerwia go nerw podobojczykowy od pnia górnego splotu ramiennego.",
    ),
  ),
  serratus: structure(
    "Mięsień zębaty przedni",
    "Serratus anterior",
    "Musculus serratus anterior",
    "muscular",
    "serratus_anterior_muscle_r",
    notes(
      "From the lateral upper ribs to the costal surface of the medial scapular border. Supplied by the long thoracic nerve, it holds the scapula against the thorax and contributes to protraction and upward rotation.",
      "Od bocznych powierzchni górnych żeber do żebrowej powierzchni brzegu przyśrodkowego łopatki. Unerwia go nerw piersiowy długi. Dociska łopatkę do klatki, wysuwa ją i uczestniczy w obracaniu panewki ku górze.",
    ),
  ),
  radialLeft: structure(
    "Nerw promieniowy",
    "Radial nerve",
    "Nervus radialis",
    "nervous",
    "radial_nerve_l",
    notes(
      "At the lateral elbow it lies between brachialis and brachioradialis and divides into superficial and deep branches. The deep branch enters supinator; the superficial branch continues under brachioradialis towards the dorsolateral hand.",
      "Przy bocznej stronie łokcia leży między ramiennym a ramienno-promieniowym i dzieli się na gałęzie powierzchowną i głęboką. Głęboka wchodzi do odwracacza, powierzchowna biegnie pod ramienno-promieniowym ku grzbietowo-bocznej części ręki.",
    ),
  ),
  radialSuperficial: structure(
    "Gałąź powierzchowna nerwu promieniowego",
    "Superficial branch of radial nerve",
    "Ramus superficialis nervi radialis",
    "nervous",
    "superficial_branch_of_radial_nerve_l",
    notes(
      "A sensory terminal branch. It descends under brachioradialis near the radial artery before reaching the dorsal radial hand. The neighbouring deep branch instead enters supinator and supplies the extensor compartment.",
      "Końcowa gałąź czuciowa. Zstępuje pod ramienno-promieniowym w pobliżu tętnicy promieniowej, po czym dochodzi do grzbietu ręki po stronie promieniowej. Sąsiednia gałąź głęboka wchodzi do odwracacza i zaopatruje prostowniki.",
    ),
  ),
  radialDeep: structure(
    "Gałąź głęboka nerwu promieniowego",
    "Deep branch of radial nerve",
    "Ramus profundus nervi radialis",
    "nervous",
    "deep_branch_of_radial_nerve_l",
    notes(
      "The motor branch turns around the proximal radius between supinator layers. After leaving supinator it continues as the posterior interosseous nerve to the deep and superficial extensors. The pin is at the proximal entry, before that distal course.",
      "Gałąź ruchowa okrąża bliższą część kości promieniowej między warstwami odwracacza. Po wyjściu z niego biegnie jako nerw międzykostny tylny do prostowników. Szpilka wskazuje odcinek przy wejściu do mięśnia, przed dalszym przebiegiem.",
    ),
  ),
  posteriorInterosseous: structure(
    "Nerw międzykostny tylny",
    "Posterior interosseous nerve",
    "Nervus interosseus posterior",
    "nervous",
    "posterior_interosseous_nerve_of_forearm_l",
    notes(
      "The continuation of the deep radial branch after supinator. It runs in the posterior forearm and supplies most extensors of the fingers and thumb. It is chiefly motor and has no cutaneous sensory territory.",
      "Przedłużenie gałęzi głębokiej nerwu promieniowego po wyjściu z odwracacza. Biegnie w tylnej części przedramienia i zaopatruje większość prostowników palców oraz kciuka. Jest głównie ruchowy i nie ma skórnego pola czuciowego.",
    ),
  ),
  lateralForearm: structure(
    "Nerw skórny boczny przedramienia",
    "Lateral antebrachial cutaneous nerve",
    "Nervus cutaneus antebrachii lateralis",
    "nervous",
    "lateral_antebrachial_cutaneous_nerve_l",
    notes(
      "The sensory continuation of musculocutaneous after its arm motor branches. It emerges lateral to the biceps tendon near the elbow and divides to supply lateral forearm skin.",
      "Czuciowe przedłużenie nerwu mięśniowo-skórnego po oddaniu gałęzi ruchowych na ramieniu. Wychodzi bocznie od ścięgna dwugłowego przy łokciu i dzieli się do skóry bocznej części przedramienia.",
    ),
  ),
  supinator: structure(
    "Mięsień odwracacz",
    "Supinator",
    "Musculus supinator",
    "muscular",
    "supinator_l",
    notes(
      "Wraps around the proximal radius, attaching also to the lateral epicondyle and proximal ulna. It supinates the forearm and receives the deep radial branch, which passes between its layers.",
      "Obejmuje bliższy odcinek kości promieniowej; ma też przyczepy przy nadkłykciu bocznym i bliższej części kości łokciowej. Odwraca przedramię. Unerwia go gałąź głęboka nerwu promieniowego przechodząca między jego warstwami.",
    ),
  ),
  pronator: structure(
    "Mięsień nawrotny obły",
    "Pronator teres",
    "Musculus pronator teres",
    "muscular",
    "superficial_head_of_pronator_teres_l",
    notes(
      "Its humeral and ulnar heads converge on the lateral mid-radius. It pronates the forearm, assists elbow flexion and receives the median nerve, which usually passes between its heads. The 3D link selects the humeral head.",
      "Głowy ramienna i łokciowa zbiegają do bocznej powierzchni środkowej części kości promieniowej. Nawraca przedramię i wspomaga zginanie łokcia. Unerwia go nerw pośrodkowy, zwykle biegnący między głowami. Link 3D wybiera głowę ramienną.",
    ),
  ),
  brachialis: structure(
    "Mięsień ramienny",
    "Brachialis",
    "Musculus brachialis",
    "muscular",
    "brachialis_muscle_l",
    notes(
      "Deep to biceps, from distal anterior humerus to the ulnar tuberosity and coronoid process. It flexes the elbow in either forearm position. Mainly musculocutaneous supply, with a radial contribution to its lateral part.",
      "Pod dwugłowym, od dalszej przedniej powierzchni kości ramiennej do guzowatości i wyrostka dziobiastego kości łokciowej. Zgina łokieć niezależnie od ustawienia przedramienia. Głównie nerw mięśniowo-skórny; boczna część otrzymuje też włókna promieniowego.",
    ),
  ),
  annular: structure(
    "Więzadło pierścieniowate kości promieniowej",
    "Annular ligament of radius",
    "Ligamentum anulare radii",
    "articular",
    "annular_ligament_of_radius_l",
    notes(
      "Attaches to the anterior and posterior margins of the radial notch of the ulna and encircles the radial head. It holds the head against the notch while allowing rotation at the proximal radioulnar joint.",
      "Przyczepia się do przedniego i tylnego brzegu wcięcia promieniowego kości łokciowej i obejmuje głowę kości promieniowej. Utrzymuje ją przy wcięciu, umożliwiając obrót w stawie promieniowo-łokciowym bliższym.",
    ),
  ),
  radialCollateral: structure(
    "Więzadło poboczne promieniowe",
    "Radial collateral ligament",
    "Ligamentum collaterale radiale",
    "articular",
    "radial_collateral_ligament_l",
    notes(
      "From the lateral humeral epicondyle, its fibres blend with the annular ligament. It supports the lateral elbow. Unlike the knee's fibular collateral ligament, it belongs to the elbow ligament complex.",
      "Od nadkłykcia bocznego kości ramiennej jego włókna łączą się z więzadłem pierścieniowatym. Wzmacnia boczną stronę łokcia. To element aparatu więzadłowego łokcia — warto zawsze podawać staw przy nazwie więzadła pobocznego.",
    ),
  ),
} satisfies Record<string, Content>;
const lowerContent = {
  gluteusMaximus: structure(
    "Mięsień pośladkowy wielki",
    "Gluteus maximus",
    "Musculus gluteus maximus",
    "muscular",
    "gluteus_maximus_muscle_r",
    notes(
      "The superficial buttock muscle inserts into the iliotibial tract and gluteal tuberosity. Supplied by the inferior gluteal nerve, it strongly extends and laterally rotates the hip. Most of it has been removed in this specimen.",
      "Powierzchowny mięsień pośladka kończy się w paśmie biodrowo-piszczelowym i na guzowatości pośladkowej. Unerwia go nerw pośladkowy dolny. Silnie prostuje i obraca udo na zewnątrz. Na preparacie usunięto większość mięśnia.",
    ),
  ),
  gluteusMedius: structure(
    "Mięsień pośladkowy średni",
    "Gluteus medius",
    "Musculus gluteus medius",
    "muscular",
    "gluteus_medius_muscle_r",
    notes(
      "From the external ilium to the greater trochanter. The superior gluteal nerve supplies it. It abducts the hip and stabilises the pelvis during single-leg stance; gluteus minimus lies deep to it.",
      "Od zewnętrznej powierzchni kości biodrowej do krętarza większego. Unerwia go nerw pośladkowy górny. Odwodzi udo i stabilizuje miednicę podczas stania na jednej nodze. Głęboko pod nim leży pośladkowy mały.",
    ),
  ),
  gluteusMinimus: structure(
    "Mięsień pośladkowy mały",
    "Gluteus minimus",
    "Musculus gluteus minimus",
    "muscular",
    "gluteus_minimus_muscle_r",
    notes(
      "Deep to gluteus medius, from the external ilium to the anterior greater trochanter. It receives superior gluteal-nerve supply and assists hip abduction, medial rotation and pelvic stabilisation.",
      "Pod pośladkowym średnim, od zewnętrznej powierzchni kości biodrowej do przedniej części krętarza większego. Unerwiony przez nerw pośladkowy górny, wspomaga odwodzenie, obrót do wewnątrz i stabilizację miednicy.",
    ),
  ),
  piriformis: structure(
    "Mięsień gruszkowaty",
    "Piriformis",
    "Musculus piriformis",
    "muscular",
    "piriformis_muscle_r",
    notes(
      "From the pelvic sacrum through the greater sciatic foramen to the greater trochanter. It laterally rotates the extended hip. Superior gluteal structures leave above it; the sciatic nerve usually leaves below. This specimen shows an early sciatic division.",
      "Od miednicznej powierzchni kości krzyżowej przez otwór kulszowy większy do krętarza większego. Obraca wyprostowane udo na zewnątrz. Nad nim wychodzą struktury pośladkowe górne, pod nim zwykle nerw kulszowy. Tu widoczny jest jego wysoki podział.",
    ),
  ),
  gemellusSuperior: structure(
    "Mięsień bliźniaczy górny",
    "Superior gemellus",
    "Musculus gemellus superior",
    "muscular",
    "superior_gemellus_muscle_r",
    notes(
      "From the ischial spine, it joins the upper edge of the obturator internus tendon on the way to the greater trochanter. Supplied by the nerve to obturator internus; it assists lateral rotation of the hip.",
      "Od kolca kulszowego łączy się z górnym brzegiem ścięgna zasłaniacza wewnętrznego w drodze do krętarza większego. Unerwia go nerw mięśnia zasłaniacza wewnętrznego. Wspomaga obrót uda na zewnątrz.",
    ),
  ),
  gemellusInferior: structure(
    "Mięsień bliźniaczy dolny",
    "Inferior gemellus",
    "Musculus gemellus inferior",
    "muscular",
    "inferior_gemellus_muscle_r",
    notes(
      "From the ischial tuberosity to the lower edge of the obturator internus tendon. It lies above quadratus femoris, assists lateral rotation and is supplied by the nerve to quadratus femoris.",
      "Od guza kulszowego do dolnego brzegu ścięgna zasłaniacza wewnętrznego. Leży nad czworobocznym uda, wspomaga obrót na zewnątrz i otrzymuje unerwienie od nerwu mięśnia czworobocznego uda.",
    ),
  ),
  obturatorTendon: structure(
    "Ścięgno mięśnia zasłaniacza wewnętrznego",
    "Obturator internus tendon",
    "Tendo musculi obturatorii interni",
    "muscular",
    "obturator_internus_r",
    notes(
      "The tendon turns around the lesser sciatic notch, leaves through the lesser sciatic foramen and runs between the gemelli to the medial greater trochanter. The muscle is a lateral rotator supplied by the nerve to obturator internus. 3D shows the whole muscle.",
      "Ścięgno zagina się na wcięciu kulszowym mniejszym, wychodzi przez otwór kulszowy mniejszy i między bliźniaczymi biegnie do przyśrodkowej powierzchni krętarza większego. Mięsień obraca udo na zewnątrz; unerwia go nerw zasłaniacza wewnętrznego. 3D pokazuje cały mięsień.",
    ),
  ),
  quadratus: structure(
    "Mięsień czworoboczny uda",
    "Quadratus femoris",
    "Musculus quadratus femoris",
    "muscular",
    "quadratus_femoris_muscle_r",
    notes(
      "A short rectangular muscle from the lateral ischial tuberosity to the quadrate tubercle on the intertrochanteric crest. It laterally rotates and adducts the hip and receives the nerve to quadratus femoris.",
      "Krótki prostokątny mięsień od bocznej części guza kulszowego do guzka czworobocznego na grzebieniu międzykrętarzowym. Obraca udo na zewnątrz i przywodzi je. Unerwia go nerw mięśnia czworobocznego uda.",
    ),
  ),
  tibial: structure(
    "Nerw piszczelowy",
    "Tibial nerve",
    "Nervus tibialis",
    "nervous",
    "tibial_nerve_r",
    notes(
      "The larger terminal division of sciatic. It supplies most hamstrings and the posterior leg, then divides into medial and lateral plantar nerves behind the medial ankle. Here it is already separate in the buttock: an early division, not the usual popliteal-level split.",
      "Większa gałąź końcowa kulszowego. Zaopatruje większość grupy kulszowo-goleniowej i tylną grupę podudzia, potem dzieli się na nerwy podeszwowe za kostką przyśrodkową. Tu jest osobny już w pośladku: to wysoki podział, nie typowy podział przy dole podkolanowym.",
    ),
  ),
  commonFibular: structure(
    "Nerw strzałkowy wspólny",
    "Common fibular nerve",
    "Nervus fibularis communis",
    "nervous",
    "common_fibular_nerve_r",
    notes(
      "A terminal sciatic division. It follows the lateral popliteal boundary, winds around the fibular neck and divides into superficial and deep fibular nerves. In the gluteal specimen it is separate unusually high, alongside the larger tibial division.",
      "Gałąź końcowa kulszowego. Biegnie przy bocznym ograniczeniu dołu podkolanowego, okrąża szyjkę strzałki i dzieli się na nerwy strzałkowe powierzchowny oraz głęboki. Na preparacie pośladkowym jest oddzielny wyjątkowo wysoko, obok większego nerwu piszczelowego.",
    ),
  ),
  superiorGluteal: structure(
    "Nerw pośladkowy górny",
    "Superior gluteal nerve",
    "Nervus gluteus superior",
    "nervous",
    "superior_gluteal_nerve_r",
    notes(
      "From the sacral plexus, L4–S1. It leaves above piriformis, travels between gluteus medius and minimus and supplies both plus tensor fasciae latae. It is distinct from the inferior gluteal nerve to gluteus maximus.",
      "Ze splotu krzyżowego, L4–S1. Wychodzi nad gruszkowatym, biegnie między pośladkowymi średnim i małym, unerwiając oba oraz naprężacz powięzi szerokiej. Odróżniaj go od nerwu pośladkowego dolnego do pośladkowego wielkiego.",
    ),
  ),
  posteriorFemoral: structure(
    "Nerw skórny tylny uda",
    "Posterior femoral cutaneous nerve",
    "Nervus cutaneus femoris posterior",
    "nervous",
    "posterior_femoral_cutaneous_nerve_r",
    notes(
      "A sensory sacral-plexus nerve, usually S1–S3. It emerges below piriformis and descends superficial to the hamstrings. Its inferior cluneal and perineal branches also supply the lower buttock and part of the perineum.",
      "Czuciowy nerw splotu krzyżowego, zwykle S1–S3. Wychodzi pod gruszkowatym i schodzi powierzchownie względem mięśni kulszowo-goleniowych. Gałęzie pośladkowe dolne i kroczowe docierają też do dolnej części pośladka i części krocza.",
    ),
  ),
  femoral: structure(
    "Nerw udowy",
    "Femoral nerve",
    "Nervus femoralis",
    "nervous",
    "femoral_nerve_r",
    notes(
      "From the lumbar plexus, L2–L4, it passes beneath the inguinal ligament lateral to the femoral artery and outside the femoral sheath. It supplies quadriceps and other anterior thigh muscles; its long sensory continuation is the saphenous nerve.",
      "Ze splotu lędźwiowego, L2–L4. Przechodzi pod więzadłem pachwinowym bocznie od tętnicy udowej, poza pochewką udową. Unerwia czworogłowy i inne mięśnie przedniego uda. Długą gałęzią czuciową jest nerw udowo-goleniowy.",
    ),
  ),
  lateralFemoral: structure(
    "Nerw skórny boczny uda",
    "Lateral femoral cutaneous nerve",
    "Nervus cutaneus femoris lateralis",
    "nervous",
    "lateral_femoral_cutaneous_nerve_r",
    notes(
      "A sensory lumbar-plexus nerve, chiefly L2–L3. It crosses iliacus towards the anterior superior iliac spine and passes near the lateral end of the inguinal ligament to the lateral thigh skin; it has no motor supply to thigh muscles.",
      "Czuciowy nerw splotu lędźwiowego, głównie L2–L3. Przechodzi po biodrowym ku kolcowi biodrowemu przedniemu górnemu i przy bocznym końcu więzadła pachwinowego dochodzi do skóry bocznej części uda. Nie unerwia ruchowo mięśni uda.",
    ),
  ),
  saphenous: structure(
    "Nerw udowo-goleniowy",
    "Saphenous nerve",
    "Nervus saphenus",
    "nervous",
    "saphenous_nerve_r",
    notes(
      "A sensory branch of femoral, chiefly L3–L4. It accompanies femoral vessels in the adductor canal but leaves before the adductor hiatus. Its infrapatellar branch supplies the medial knee; the main nerve follows the medial leg towards the foot.",
      "Czuciowa gałąź udowego, głównie L3–L4. Towarzyszy naczyniom udowym w kanale przywodzicieli, ale opuszcza go przed rozworem przywodzicieli. Gałąź podrzepkowa dochodzi do przyśrodkowego kolana, główny pień biegnie wzdłuż przyśrodkowego podudzia ku stopie.",
    ),
  ),
  sartorius: structure(
    "Mięsień krawiecki",
    "Sartorius",
    "Musculus sartorius",
    "muscular",
    "sartorius_muscle_r",
    notes(
      "A strap from the anterior superior iliac spine to the medial proximal tibia as part of pes anserinus. Femoral-nerve supply. It flexes the hip and knee and helps abduct and laterally rotate the thigh; it roofs the adductor canal.",
      "Taśma od kolca biodrowego przedniego górnego do bliższej przyśrodkowej piszczeli, jako część gęsiej stopki. Unerwia go nerw udowy. Zgina biodro i kolano, wspomaga odwodzenie i obrót uda na zewnątrz. Przykrywa kanał przywodzicieli.",
    ),
  ),
  pectineus: structure(
    "Mięsień grzebieniowy",
    "Pectineus",
    "Musculus pectineus",
    "muscular",
    "pectineus_muscle_r",
    notes(
      "From the pecten pubis to the pectineal line of the femur. It forms part of the femoral triangle floor and flexes and adducts the hip. Usually femoral-nerve supply, sometimes with an obturator contribution.",
      "Od grzebienia kości łonowej do kresy grzebieniowej kości udowej. Tworzy część dna trójkąta udowego, zgina i przywodzi udo. Zwykle nerw udowy, niekiedy z udziałem nerwu zasłonowego.",
    ),
  ),
  tibialPopliteal: structure(
    "Nerw piszczelowy",
    "Tibial nerve",
    "Nervus tibialis",
    "nervous",
    "tibial_nerve_r",
    notes(
      "The central nerve in the popliteal fossa, generally superficial to the popliteal vein and artery. It gives muscular branches to gastrocnemius, soleus, plantaris and popliteus, and the medial sural cutaneous nerve, before entering the posterior leg.",
      "Centralny nerw dołu podkolanowego, zwykle powierzchownie względem żyły i tętnicy podkolanowej. Oddaje gałęzie do brzuchatego łydki, płaszczkowatego, podeszwowego i podkolanowego oraz nerw skórny przyśrodkowy łydki. Dalej wchodzi do tylnej grupy podudzia.",
    ),
  ),
  sural: structure(
    "Nerw łydkowy",
    "Sural nerve",
    "Nervus suralis",
    "nervous",
    "sural_nerve_r",
    notes(
      "A sensory nerve commonly formed by the medial sural cutaneous nerve and a communicating branch from the common fibular system. It follows the small saphenous vein, passes behind the lateral malleolus and reaches the lateral foot. Formation varies between people.",
      "Czuciowy nerw zwykle utworzony przez skórny przyśrodkowy łydki i gałąź łączącą układu nerwu strzałkowego wspólnego. Towarzyszy żyle odstrzałkowej, przechodzi za kostką boczną i dochodzi do bocznego brzegu stopy. Sposób powstania jest zmienny.",
    ),
  ),
  medialSural: structure(
    "Nerw skórny przyśrodkowy łydki",
    "Medial sural cutaneous nerve",
    "Nervus cutaneus surae medialis",
    "nervous",
    "medial_sural_cutaneous_nerve_r",
    notes(
      "A sensory branch of tibial that descends between the gastrocnemius heads. It commonly joins a fibular communicating branch to form the sural nerve. Above that junction, use this branch name rather than calling the whole course sural.",
      "Czuciowa gałąź piszczelowego schodząca między głowami brzuchatego łydki. Zwykle łączy się z gałęzią łączącą strzałkową, tworząc nerw łydkowy. Powyżej połączenia używaj nazwy tej gałęzi, zamiast nazywać cały przebieg nerwem łydkowym.",
    ),
  ),
  gastroMedial: structure(
    "Głowa przyśrodkowa mięśnia brzuchatego łydki",
    "Medial head of gastrocnemius",
    "Caput mediale musculi gastrocnemii",
    "muscular",
    "medial_head_of_gastrocnemius_r",
    notes(
      "Arises near the medial femoral condyle and joins the calcaneal tendon with the lateral head and soleus. Tibial-nerve supply. Crossing knee and ankle, gastrocnemius plantarflexes the ankle and assists knee flexion.",
      "Rozpoczyna się przy kłykciu przyśrodkowym kości udowej i z głową boczną oraz płaszczkowatym dochodzi do ścięgna piętowego. Unerwia ją nerw piszczelowy. Przekracza kolano i staw skokowy, zgina podeszwowo stopę i wspomaga zginanie kolana.",
    ),
  ),
  gastroLateral: structure(
    "Głowa boczna mięśnia brzuchatego łydki",
    "Lateral head of gastrocnemius",
    "Caput laterale musculi gastrocnemii",
    "muscular",
    "lateral_head_of_gastrocnemius_r",
    notes(
      "Arises near the lateral femoral condyle and joins the calcaneal tendon. Supplied by tibial nerve, it plantarflexes the foot and assists knee flexion. The two heads form the lower borders of the popliteal fossa.",
      "Rozpoczyna się przy kłykciu bocznym kości udowej i dołącza do ścięgna piętowego. Unerwiona przez piszczelowy, zgina podeszwowo stopę i wspomaga zginanie kolana. Obie głowy tworzą dolne ograniczenia dołu podkolanowego.",
    ),
  ),
  semimembranosus: structure(
    "Mięsień półbłoniasty",
    "Semimembranosus",
    "Musculus semimembranosus",
    "muscular",
    "semimembranosus_muscle_r",
    notes(
      "From the ischial tuberosity to the posterior medial tibial condyle. The tibial division of sciatic supplies it. It extends the hip, flexes the knee and medially rotates the flexed leg; its broad distal attachment contributes to the oblique popliteal ligament.",
      "Od guza kulszowego do tylnej części kłykcia przyśrodkowego piszczeli. Unerwia go część piszczelowa kulszowego. Prostuje biodro, zgina kolano i obraca zgięte podudzie do wewnątrz. Rozcięgna przyczepu współtworzą więzadło podkolanowe skośne.",
    ),
  ),
  semitendinosus: structure(
    "Mięsień półścięgnisty",
    "Semitendinosus",
    "Musculus semitendinosus",
    "muscular",
    "semitendinosus_muscle_r",
    notes(
      "From the ischial tuberosity to pes anserinus on medial proximal tibia. Tibial-division sciatic supply. It extends the hip, flexes the knee and medially rotates the flexed leg; its long cord-like distal tendon distinguishes it from semimembranosus.",
      "Od guza kulszowego do gęsiej stopki na przyśrodkowej bliższej piszczeli. Unerwienie: część piszczelowa kulszowego. Prostuje biodro, zgina kolano i obraca zgięte podudzie do wewnątrz. Długie sznurowate ścięgno odróżnia go od półbłoniastego.",
    ),
  ),
  deepFibular: structure(
    "Nerw strzałkowy głęboki",
    "Deep fibular nerve",
    "Nervus fibularis profundus",
    "nervous",
    "deep_fibular_nerve_l",
    notes(
      "A common-fibular terminal branch entering the anterior leg with anterior tibial vessels. It supplies ankle and toe extensors and the short dorsal foot extensors. Its cutaneous territory is the first interdigital cleft.",
      "Gałąź końcowa strzałkowego wspólnego, wchodząca do przedniej grupy podudzia z naczyniami piszczelowymi przednimi. Unerwia prostowniki stopy i palców oraz krótkie prostowniki grzbietu stopy. Skórnie zaopatruje pierwszą przestrzeń międzypalcową.",
    ),
  ),
  superficialFibular: structure(
    "Nerw strzałkowy powierzchowny",
    "Superficial fibular nerve",
    "Nervus fibularis superficialis",
    "nervous",
    "superficial_fibular_nerve_l",
    notes(
      "A common-fibular terminal branch supplying fibularis longus and brevis. It descends in the lateral leg and becomes cutaneous distally, dividing into medial and intermediate dorsal cutaneous nerves for most of the dorsum of the foot.",
      "Gałąź końcowa strzałkowego wspólnego do strzałkowych długiego i krótkiego. Schodzi w bocznej grupie podudzia, dalej przebija powięź i dzieli się na nerwy skórne grzbietowe przyśrodkowy oraz pośredni do większości grzbietu stopy.",
    ),
  ),
  tibialisAnterior: structure(
    "Mięsień piszczelowy przedni",
    "Tibialis anterior",
    "Musculus tibialis anterior",
    "muscular",
    "tibialis_anterior_muscle_l",
    notes(
      "From lateral tibia and interosseous membrane to the medial cuneiform and first metatarsal base. Deep fibular-nerve supply. It dorsiflexes and inverts the foot; its tendon is the most medial of the anterior ankle tendons.",
      "Od bocznej powierzchni piszczeli i błony międzykostnej do kości klinowatej przyśrodkowej i podstawy I śródstopia. Nerw strzałkowy głęboki. Zgina grzbietowo i odwraca stopę; jego ścięgno jest najbardziej przyśrodkowym ze ścięgien przed kostkami.",
    ),
  ),
  extensorDigitorum: structure(
    "Mięsień prostownik długi palców",
    "Extensor digitorum longus",
    "Musculus extensor digitorum longus",
    "muscular",
    "extensor_digitorum_longus_l",
    notes(
      "From the proximal tibia, fibula and interosseous membrane to the dorsal expansions of toes 2–5. Supplied by deep fibular nerve, it extends those toes and dorsiflexes the foot. Its distal tendon divides into four slips.",
      "Od bliższej piszczeli, strzałki i błony międzykostnej do rozcięgien grzbietowych palców II–V. Unerwiony przez strzałkowy głęboki, prostuje te palce i zgina grzbietowo stopę. Dystalnie ścięgno dzieli się na cztery pasma.",
    ),
  ),
  extensorHallucis: structure(
    "Mięsień prostownik długi palucha",
    "Extensor hallucis longus",
    "Musculus extensor hallucis longus",
    "muscular",
    "extensor_hallucis_longus_l",
    notes(
      "From the anterior fibula and interosseous membrane to the distal phalanx of the hallux. Deep fibular-nerve supply. It extends the hallux and dorsiflexes the foot; its tendon lies between tibialis anterior and extensor digitorum longus at the ankle.",
      "Od przedniej powierzchni strzałki i błony międzykostnej do paliczka dalszego palucha. Nerw strzałkowy głęboki. Prostuje paluch i zgina grzbietowo stopę; przy stawie skokowym jego ścięgno leży między piszczelowym przednim a prostownikiem długim palców.",
    ),
  ),
  fibularisLongus: structure(
    "Mięsień strzałkowy długi",
    "Fibularis longus",
    "Musculus fibularis longus",
    "muscular",
    "fibularis_longus_muscle_l",
    notes(
      "From the head and upper lateral fibula, its tendon passes behind the lateral malleolus and across the sole to the first metatarsal base and medial cuneiform. Superficial fibular-nerve supply; it everts and assists plantarflexion of the foot.",
      "Od głowy i górnej bocznej części strzałki. Ścięgno przechodzi za kostką boczną i przez podeszwę do podstawy I śródstopia oraz klinowatej przyśrodkowej. Nerw strzałkowy powierzchowny. Nawraca i wspomaga zginanie podeszwowe stopy.",
    ),
  ),
  acl: structure(
    "Więzadło krzyżowe przednie",
    "Anterior cruciate ligament",
    "Ligamentum cruciatum anterius",
    "articular",
    "anterior_cruciate_ligament_l",
    notes(
      "From the anterior intercondylar tibial area upwards, backwards and laterally to the medial surface of the lateral femoral condyle. It checks anterior tibial translation relative to the femur. The name refers to its tibial attachment.",
      "Od pola międzykłykciowego przedniego piszczeli ku górze, tyłowi i bocznie do przyśrodkowej powierzchni kłykcia bocznego kości udowej. Ogranicza przesuwanie piszczeli do przodu względem uda. Nazwa odnosi się do przyczepu piszczelowego.",
    ),
  ),
  pcl: structure(
    "Więzadło krzyżowe tylne",
    "Posterior cruciate ligament",
    "Ligamentum cruciatum posterius",
    "articular",
    "posterior_cruciate_ligament_l",
    notes(
      "From the posterior intercondylar tibial area upwards, forwards and medially to the lateral surface of the medial femoral condyle. It checks posterior tibial translation. Its femoral attachment is opposite the ACL's condyle.",
      "Od pola międzykłykciowego tylnego piszczeli ku górze, przodowi i przyśrodkowo do bocznej powierzchni kłykcia przyśrodkowego uda. Ogranicza przesuwanie piszczeli do tyłu. Przyczep udowy leży na innym kłykciu niż przyczep krzyżowego przedniego.",
    ),
  ),
  lateralMeniscus: structure(
    "Łąkotka boczna",
    "Lateral meniscus",
    "Meniscus lateralis",
    "articular",
    "lateral_meniscus_l",
    notes(
      "A fibrocartilage on the lateral tibial plateau, more nearly circular and generally more mobile than the medial meniscus. It is not attached to the fibular collateral ligament; the popliteus tendon is related to its posterolateral margin.",
      "Chrząstka włóknista na bocznym plateau piszczeli, bardziej zbliżona do koła i zwykle ruchomsza od przyśrodkowej. Nie zrasta się z więzadłem pobocznym strzałkowym. Przy jej tylno-bocznym brzegu przebiega ścięgno podkolanowego.",
    ),
  ),
  medialMeniscus: structure(
    "Łąkotka przyśrodkowa",
    "Medial meniscus",
    "Meniscus medialis",
    "articular",
    "medial_meniscus_l",
    notes(
      "A C-shaped fibrocartilage on the medial tibial plateau. It connects to the joint capsule and deep tibial collateral ligament and is less mobile than the lateral meniscus. Both horns attach to intercondylar tibial areas.",
      "Chrząstka włóknista o kształcie litery C na przyśrodkowym plateau piszczeli. Łączy się z torebką i głęboką częścią więzadła pobocznego piszczelowego, jest mniej ruchoma od bocznej. Oba rogi przyczepiają się w polach międzykłykciowych piszczeli.",
    ),
  ),
  mcl: structure(
    "Więzadło poboczne piszczelowe",
    "Tibial collateral ligament",
    "Ligamentum collaterale tibiale",
    "articular",
    "superficial_part_of_tibial_collateral_ligament_l",
    notes(
      "A broad medial band from the medial femoral epicondyle to the proximal medial tibia. Its deep component connects to the medial meniscus. It resists valgus loading; the 3D link selects the superficial component.",
      "Szerokie pasmo od nadkłykcia przyśrodkowego uda do bliższej przyśrodkowej piszczeli. Część głęboka łączy się z łąkotką przyśrodkową. Przeciwdziała koślawieniu kolana; link 3D wybiera część powierzchowną.",
    ),
  ),
  lcl: structure(
    "Więzadło poboczne strzałkowe",
    "Fibular collateral ligament",
    "Ligamentum collaterale fibulare",
    "articular",
    "fibular_collateral_ligament_l",
    notes(
      "A cord-like band from the lateral femoral epicondyle to the fibular head, near the biceps femoris insertion. It is separate from the lateral meniscus and resists varus loading at the knee.",
      "Sznurowate pasmo od nadkłykcia bocznego uda do głowy strzałki, w pobliżu przyczepu dwugłowego uda. Jest oddzielone od łąkotki bocznej i przeciwdziała szpotawieniu kolana.",
    ),
  ),
} satisfies Record<string, Content>;
const structures = { ...content, ...lowerContent };

type Plate = {
  page: number;
  printed: number;
  figure: string;
  region: "upper" | "lower" | "trunk";
  crop: PhotoPin["crop"];
  masks?: PhotoPin["masks"];
};
type Position = readonly [
  keyof typeof structures,
  number,
  number,
  number,
  string,
  string,
];

export function makeCuratedPins(atlasId: string): PhotoPin[] {
  const result: PhotoPin[] = [];
  const plate = (view: Plate, positions: readonly Position[]): void => {
    for (const [key, label, x, y, en, pl] of positions) {
      const item = structures[key];
      const exercise =
        item.system === "nervous"
          ? view.region === "upper"
            ? 7
            : 8
          : item.system === "articular"
            ? 3
            : view.region === "trunk"
              ? 4
              : view.region === "upper"
                ? 5
                : 6;
      result.push({
        ...item,
        id: `mcminn-${view.page}-${view.figure}-${label}`,
        atlasId,
        page: view.page,
        x: x / 1274,
        y: y / 1800,
        crop: view.crop,
        ...(view.masks ? { masks: view.masks } : {}),
        region: view.region,
        exercise,
        recognize: notes(en, pl),
        source: `McMinn, Fotograficzny atlas anatomii człowieka · PDF ${view.page} · ${view.printed} · ${view.figure}, ${label}${view.page === 333 ? " · legend: PDF 334" : ""}`,
      });
    }
  };
  plate(
    {
      page: 149,
      printed: 146,
      figure: "A",
      region: "upper",
      crop: { x: 0.2, y: 0.175, w: 0.79, h: 0.49 },
      masks: [{ x: 0.04, y: 0.175, w: 0.37, h: 0.26 }],
    },
    [
      [
        "median",
        21,
        889,
        656,
        "Anterior right axilla, vessels removed: follow the large pale nerve formed by the two converging roots of the M-shaped arrangement.",
        "Przedni widok prawej pachy bez naczyń: prześledź duży jasny nerw powstały z dwóch zbiegających korzeni układu w kształcie M.",
      ],
      [
        "ulnar",
        14,
        1005,
        672,
        "Find the medial long limb of the M-shaped plexus arrangement, then follow it towards the medial arm; the median nerve runs alongside it.",
        "Znajdź przyśrodkowe długie ramię układu M splotu i prześledź je ku przyśrodkowej części ramienia. Obok biegnie nerw pośrodkowy.",
      ],
      [
        "musculocutaneous",
        16,
        1056,
        444,
        "The lateral nerve leaves the plexus towards coracobrachialis, above the roots that converge to make the median nerve.",
        "Boczny nerw odchodzi ze splotu ku kruczo-ramiennemu, powyżej korzeni zbiegających się w nerw pośrodkowy.",
      ],
      [
        "thoracodorsal",
        18,
        1167,
        609,
        "A slender descending nerve on the posterior axillary wall, lateral to the short subscapular branches. Follow it towards latissimus rather than the arm.",
        "Smukły nerw zstępujący po tylnej ścianie pachy, bocznie od krótkich gałęzi podłopatkowych. Śledź go ku najszerszemu grzbietu, a nie w stronę ramienia.",
      ],
      [
        "medialForearm",
        23,
        640,
        1070,
        "Distal medial arm: a fine nerve accompanies the larger ulnar nerve. Trace it distally along the arm rather than into a muscle belly.",
        "Dalsza przyśrodkowa część ramienia: cienki nerw towarzyszy większemu łokciowemu. Śledź go wzdłuż ramienia, zamiast szukać wejścia w brzusiec mięśnia.",
      ],
      [
        "medialArm",
        24,
        1041,
        728,
        "The small cutaneous branch crosses the medial axillary field, superficial to the deeper muscular posterior wall. Compare its small calibre with the adjacent ulnar nerve.",
        "Drobna gałąź skórna przecina przyśrodkową okolicę pachy powierzchownie względem mięśni tylnej ściany. Porównaj jej średnicę z pobliskim nerwem łokciowym.",
      ],
      [
        "coracobrachialis",
        8,
        823,
        610,
        "The narrow fleshy strip lies beside the broad reflected biceps surface and leads proximally to the coracoid region; look for the entering musculocutaneous nerve.",
        "Wąskie mięsiste pasmo leży przy szerokiej odsłoniętej powierzchni dwugłowego i prowadzi ku wyrostkowi kruczemu. Szukaj wchodzącego nerwu mięśniowo-skórnego.",
      ],
      [
        "subscapularis",
        13,
        1209,
        745,
        "Broad muscle on the posterior wall of the right axilla, against the costal scapula, deep to the plexus and its fine descending branches.",
        "Szeroki mięsień tylnej ściany prawej pachy przy żebrowej powierzchni łopatki, głęboko względem splotu i jego cienkich zstępujących gałęzi.",
      ],
      [
        "teresMajor",
        11,
        1112,
        796,
        "The thick muscle below subscapularis heads towards the upper humerus and contributes to the posterior axillary fold.",
        "Gruby mięsień poniżej podłopatkowego kieruje się ku górnej części kości ramiennej i współtworzy tylny fałd pachowy.",
      ],
      [
        "tricepsMedial",
        4,
        535,
        1030,
        "Look distally on the posterior arm: the broad exposed head lies deep to the narrower long and lateral heads seen more proximally.",
        "Spójrz na dalszą część tylnej powierzchni ramienia: szeroka odsłonięta głowa leży głębiej niż węższe głowy długa i boczna widoczne bliżej barku.",
      ],
      [
        "latTendon",
        9,
        891,
        600,
        "The pale flat tendon crosses the anterior aspect of the posterior axillary fold. Here it is unusually broad and partly covers the long head of triceps.",
        "Jasne płaskie ścięgno przecina przednią powierzchnię tylnego fałdu pachowego. W tym preparacie jest wyjątkowo szerokie i częściowo przykrywa głowę długą trójgłowego.",
      ],
    ],
  );
  plate(
    {
      page: 151,
      printed: 148,
      figure: "B",
      region: "upper",
      crop: { x: 0.535, y: 0.11, w: 0.425, h: 0.56 },
    },
    [
      [
        "axillary",
        9,
        981,
        590,
        "Posterior right shoulder: the nerve crosses the quadrangular opening immediately below teres minor and lateral to the long head of triceps.",
        "Tył prawego barku: nerw przecina otwór pachowy boczny tuż pod obłym mniejszym i bocznie od głowy długiej trójgłowego.",
      ],
      [
        "radial",
        10,
        965,
        814,
        "Below the axillary nerve, the thicker pale cord runs obliquely towards the posterior humerus under triceps, accompanied by profunda brachii vessels.",
        "Poniżej pachowego grubszy jasny sznur biegnie skośnie ku tylnej powierzchni kości ramiennej pod trójgłowym, z naczyniami głębokimi ramienia.",
      ],
      [
        "infraspinatus",
        7,
        724,
        531,
        "The broad exposed scapular muscle is superior to the narrow teres minor strip and occupies the area below the scapular spine.",
        "Szeroki odsłonięty mięsień łopatki leży nad wąskim pasmem obłego mniejszego i zajmuje okolicę poniżej grzebienia łopatki.",
      ],
      [
        "teresMinor",
        5,
        856,
        571,
        "A short strip just above the axillary nerve and quadrangular space, between the infraspinatus region and the long head of triceps.",
        "Krótkie pasmo tuż nad nerwem pachowym i otworem pachowym bocznym, między okolicą podgrzebieniowego a głową długą trójgłowego.",
      ],
      [
        "teresMajor",
        6,
        752,
        795,
        "The lower, thicker scapulohumeral muscle lies below the spaces crossed by nerves. Compare it with the smaller superior teres minor.",
        "Niższy, grubszy mięsień łopatkowo-ramienny leży poniżej otworów przechodzonych przez nerwy. Porównaj go z wyżej położonym drobniejszym obłym mniejszym.",
      ],
      [
        "tricepsLong",
        2,
        913,
        755,
        "The central vertical muscle descends from below the glenoid and separates the medial triangular space from the lateral quadrangular space.",
        "Centralny pionowy mięsień schodzi spod panewki i oddziela przyśrodkowy otwór pachowy od bocznego.",
      ],
      [
        "tricepsLateral",
        1,
        1108,
        857,
        "The bulky lateral posterior-arm head lies lateral to the long head. The radial nerve passes deep to it towards the humeral groove.",
        "Masywna boczna głowa tylnej grupy ramienia leży bocznie od głowy długiej. Nerw promieniowy przechodzi pod nią ku bruździe kości ramiennej.",
      ],
    ],
  );
  plate(
    {
      page: 151,
      printed: 148,
      figure: "A",
      region: "upper",
      crop: { x: 0.035, y: 0.11, w: 0.43, h: 0.54 },
    },
    [
      [
        "ulnar",
        8,
        352,
        1040,
        "The arrow indicates the nerve on the medial side of the posterior arm, approaching the medial elbow, separate from the more proximal radial bundle.",
        "Strzałka wskazuje nerw po przyśrodkowej stronie tylnej powierzchni ramienia, zmierzający ku przyśrodkowemu łokciowi, osobno od wyżej położonego pęczka promieniowego.",
      ],
    ],
  );
  plate(
    {
      page: 142,
      printed: 139,
      figure: "A",
      region: "trunk",
      crop: { x: 0.055, y: 0.255, w: 0.79, h: 0.58 },
      masks: [{ x: 0.59, y: 0.633, w: 0.405, h: 0.205 }],
    },
    [
      [
        "trapezius",
        5,
        340,
        485,
        "Posterior right scapula: superficial transverse fibres converge laterally on the scapular spine, above the broad infraspinous fascial surface.",
        "Tył prawej łopatki: powierzchowne poprzeczne włókna zbiegają bocznie do grzebienia łopatki, powyżej szerokiej powięzi dołu podgrzebieniowego.",
      ],
      [
        "latissimus",
        6,
        603,
        1310,
        "The broad superficial sheet is inferior to the scapular muscles and narrows laterally towards the posterior axillary fold.",
        "Szeroka powierzchowna blaszka leży poniżej mięśni łopatki i zwęża się bocznie ku tylnemu fałdowi pachowemu.",
      ],
      [
        "rhomboid",
        10,
        360,
        1221,
        "Look at the exposed strip along the medial scapular border below the spine, deep to the edge of trapezius and above the inferior angle.",
        "Znajdź odsłonięte pasmo wzdłuż brzegu przyśrodkowego łopatki poniżej grzebienia, pod brzegiem czworobocznego i nad kątem dolnym.",
      ],
    ],
  );
  plate(
    {
      page: 142,
      printed: 139,
      figure: "A",
      region: "upper",
      crop: { x: 0.055, y: 0.255, w: 0.79, h: 0.58 },
      masks: [{ x: 0.59, y: 0.633, w: 0.405, h: 0.205 }],
    },
    [
      [
        "deltoidPosterior",
        7,
        901,
        710,
        "The posterior shoulder cap has fibres descending from the lateral scapular spine towards the upper arm, superficial to the deeper rotator-cuff muscles.",
        "Tylna czapa barku ma włókna schodzące od bocznej części grzebienia łopatki ku ramieniu, powierzchownie względem głębszych mięśni stożka rotatorów.",
      ],
      [
        "teresMinor",
        8,
        730,
        905,
        "The narrow muscle follows the upper lateral scapular border below the infraspinous region and above the bulkier teres major.",
        "Wąski mięsień biegnie przy górnym odcinku brzegu bocznego łopatki, pod okolicą podgrzebieniową i nad masywniejszym obłym większym.",
      ],
      [
        "teresMajor",
        9,
        660,
        1140,
        "The thick lower strip arises near the inferior scapular angle and runs laterally, below teres minor, towards the posterior axillary fold.",
        "Grube dolne pasmo rozpoczyna się przy kącie dolnym łopatki i biegnie bocznie, poniżej obłego mniejszego, ku tylnemu fałdowi pachowemu.",
      ],
    ],
  );
  plate(
    {
      page: 147,
      printed: 144,
      figure: "A",
      region: "trunk",
      crop: { x: 0.025, y: 0.1, w: 0.52, h: 0.34 },
    },
    [
      [
        "pecMinor",
        1,
        306,
        600,
        "With pectoralis major reflected, the triangular deeper muscle converges from the ribs towards the coracoid process above the axillary vessels.",
        "Po odchyleniu piersiowego większego trójkątny głębszy mięsień zbiega od żeber ku wyrostkowi kruczemu nad naczyniami pachowymi.",
      ],
      [
        "subclavius",
        3,
        512,
        362,
        "Find the short muscle directly under the clavicle, superior to the axillary bundle and pectoralis minor's coracoid attachment.",
        "Znajdź krótki mięsień bezpośrednio pod obojczykiem, powyżej pęczka pachowego i przyczepu piersiowego mniejszego do wyrostka kruczego.",
      ],
    ],
  );
  plate(
    {
      page: 147,
      printed: 144,
      figure: "B",
      region: "trunk",
      crop: { x: 0.02, y: 0.498, w: 0.53, h: 0.38 },
    },
    [
      [
        "serratus",
        9,
        545,
        1514,
        "The rib-related muscle forms the medial wall of the axilla, on the thoracic side rather than the scapular posterior wall.",
        "Mięsień związany z żebrami tworzy przyśrodkową ścianę pachy, po stronie klatki piersiowej, a nie łopatkowej ściany tylnej.",
      ],
    ],
  );
  plate(
    {
      page: 156,
      printed: 153,
      figure: "C",
      region: "upper",
      crop: { x: 0.08, y: 0.132, w: 0.285, h: 0.48 },
    },
    [
      [
        "radialLeft",
        12,
        363,
        397,
        "Left proximal forearm: follow the pale nerve lateral to the biceps tendon to the point where a superficial branch descends and a deep branch turns into supinator.",
        "Bliższe lewe przedramię: prześledź jasny nerw bocznie od ścięgna dwugłowego do miejsca podziału na gałąź powierzchowną i głęboką skręcającą do odwracacza.",
      ],
      [
        "radialSuperficial",
        5,
        333,
        779,
        "The long fine cord continues distally along the lateral forearm instead of disappearing into supinator near the elbow.",
        "Długi cienki sznur biegnie dalej wzdłuż bocznej części przedramienia, zamiast znikać w odwracaczu przy łokciu.",
      ],
      [
        "radialDeep",
        10,
        342,
        590,
        "The short deep branch turns from the radial bifurcation towards the proximal radius and enters the supinator muscle.",
        "Krótka gałąź głęboka odchodzi od podziału promieniowego ku bliższej kości promieniowej i wchodzi do odwracacza.",
      ],
      [
        "lateralForearm",
        13,
        351,
        299,
        "A fine cutaneous nerve emerges beside the lateral edge of the biceps tendon, proximal and superficial to the larger radial nerve.",
        "Cienki nerw skórny wychodzi przy bocznym brzegu ścięgna dwugłowego, bliżej ramienia i powierzchowniej od większego nerwu promieniowego.",
      ],
      [
        "supinator",
        8,
        300,
        700,
        "The exposed short muscle wraps around the proximal radius just below the elbow, where the deep radial branch disappears.",
        "Odsłonięty krótki mięsień obejmuje bliższą kość promieniową tuż pod łokciem, w miejscu znikania gałęzi głębokiej promieniowego.",
      ],
      [
        "pronator",
        7,
        172,
        704,
        "The oblique fleshy strip runs from the medial elbow towards the lateral radius, crossing the front of the proximal forearm.",
        "Skośne mięsiste pasmo biegnie od przyśrodkowego łokcia ku bocznej powierzchni promieniowej, przez przód bliższego przedramienia.",
      ],
      [
        "brachialis",
        9,
        297,
        376,
        "The broad muscle deep to the reflected biceps ends on the ulna. It lies medial to the radial nerve at the elbow.",
        "Szeroki mięsień pod odchylonym dwugłowym kończy się na kości łokciowej. Przy łokciu leży przyśrodkowo od nerwu promieniowego.",
      ],
    ],
  );
  plate(
    {
      page: 159,
      printed: 156,
      figure: "A",
      region: "upper",
      crop: { x: 0.335, y: 0.066, w: 0.205, h: 0.335 },
    },
    [
      [
        "supinator",
        5,
        525,
        389,
        "The proximal muscle wraps around the radius below the radial head. Follow its lower edge to where the deep nerve leaves into the posterior forearm.",
        "Bliższy mięsień obejmuje kość promieniową poniżej jej głowy. Prześledź dolny brzeg do miejsca wyjścia nerwu ku tylnej części przedramienia.",
      ],
      [
        "annular",
        8,
        574,
        255,
        "Look for the transverse fibrous collar at the radial head, immediately proximal to supinator, rather than the longitudinal interosseous membrane.",
        "Szukaj poprzecznego włóknistego kołnierza przy głowie kości promieniowej, tuż nad odwracaczem, zamiast podłużnej błony międzykostnej.",
      ],
      [
        "radialCollateral",
        9,
        550,
        201,
        "The short fibrous band descends from the lateral humeral epicondyle towards the annular ligament above the radial head.",
        "Krótkie włókniste pasmo schodzi od nadkłykcia bocznego ramiennej ku więzadłu pierścieniowatemu nad głową promieniowej.",
      ],
    ],
  );
  plate(
    {
      page: 159,
      printed: 156,
      figure: "C",
      region: "upper",
      crop: { x: 0.73, y: 0.067, w: 0.24, h: 0.69 },
    },
    [
      [
        "posteriorInterosseous",
        11,
        1150,
        520,
        "Posterior left forearm: the pale branching nerve emerges below supinator and spreads between the superficial and deep extensor layers.",
        "Tył lewego przedramienia: jasny rozgałęziający się nerw wychodzi poniżej odwracacza i rozdziela się między powierzchowną a głęboką warstwą prostowników.",
      ],
    ],
  );
  plate(
    {
      page: 318,
      printed: 317,
      figure: "C",
      region: "lower",
      crop: { x: 0.065, y: 0.075, w: 0.53, h: 0.535 },
    },
    [
      [
        "gluteusMaximus",
        10,
        554,
        327,
        "The retained superficial flap at the upper lateral edge overlies the deeper gluteal muscles; most of this large muscle has been removed.",
        "Zachowany powierzchowny płat przy górnym bocznym brzegu przykrywa głębsze mięśnie pośladkowe. Większość tego dużego mięśnia usunięto.",
      ],
      [
        "gluteusMedius",
        9,
        537,
        523,
        "The reflected lateral flap is superficial to gluteus minimus and converges towards the greater trochanter; compare the two exposed layers.",
        "Odchylony boczny płat leży powierzchownie względem pośladkowego małego i zbiega ku krętarzowi większemu. Porównaj dwie odsłonięte warstwy.",
      ],
      [
        "gluteusMinimus",
        8,
        400,
        430,
        "The deeper exposed muscle lies above piriformis and under the reflected gluteus medius, against the external ilium.",
        "Głębszy odsłonięty mięsień leży powyżej gruszkowatego i pod odchylonym pośladkowym średnim, przy zewnętrznej powierzchni kości biodrowej.",
      ],
      [
        "piriformis",
        7,
        252,
        456,
        "The transverse muscle exits the pelvis towards the greater trochanter. Superior gluteal structures are above it; the large sciatic divisions are below.",
        "Poprzeczny mięsień wychodzi z miednicy ku krętarzowi większemu. Struktury pośladkowe górne leżą nad nim, duże gałęzie kulszowego pod nim.",
      ],
      [
        "gemellusSuperior",
        5,
        448,
        581,
        "Find the small fleshy strip immediately above the pale obturator internus tendon and below piriformis.",
        "Znajdź małe mięsiste pasmo bezpośrednio nad jasnym ścięgnem zasłaniacza wewnętrznego i poniżej gruszkowatego.",
      ],
      [
        "obturatorTendon",
        11,
        499,
        638,
        "The white transverse tendon sits between the superior and inferior gemelli and heads laterally towards the greater trochanter.",
        "Białe poprzeczne ścięgno leży między bliźniaczym górnym i dolnym oraz kieruje się bocznie ku krętarzowi większemu.",
      ],
      [
        "gemellusInferior",
        4,
        500,
        665,
        "The small fleshy strip lies immediately below the obturator internus tendon and above the broad quadratus femoris.",
        "Małe mięsiste pasmo leży bezpośrednio pod ścięgnem zasłaniacza wewnętrznego i nad szerokim czworobocznym uda.",
      ],
      [
        "quadratus",
        6,
        519,
        809,
        "The broad rectangular muscle below the gemelli runs transversely from the ischial region towards the proximal femur, deep to the descending nerves.",
        "Szeroki prostokątny mięsień pod bliźniaczymi biegnie poprzecznie od okolicy kulszowej ku bliższej kości udowej, głęboko względem zstępujących nerwów.",
      ],
      [
        "tibial",
        14,
        430,
        670,
        "Of the two large separated sciatic divisions, the thicker medial cord descends across the short external rotators. This specimen has an early division.",
        "Spośród dwóch oddzielnych dużych gałęzi kulszowego grubszy przyśrodkowy sznur schodzi przez krótkie rotatory zewnętrzne. To preparat z wysokim podziałem.",
      ],
      [
        "commonFibular",
        19,
        466,
        670,
        "The narrower lateral cord accompanies the larger tibial division over the short rotators; both are already separate below piriformis in this specimen.",
        "Węższy boczny sznur towarzyszy większej gałęzi piszczelowej nad krótkimi rotatorami. W tym preparacie oba są oddzielne już pod gruszkowatym.",
      ],
      [
        "superiorGluteal",
        16,
        315,
        399,
        "Look above the superior border of piriformis: the fine nerve branches run laterally towards the interval between gluteus medius and minimus.",
        "Spójrz ponad górny brzeg gruszkowatego: cienkie gałęzie nerwowe biegną bocznie do szczeliny między pośladkowymi średnim i małym.",
      ],
      [
        "posteriorFemoral",
        17,
        378,
        730,
        "The thin nerve descends medial and superficial to the thick tibial division, towards the posterior thigh rather than into the short rotators.",
        "Cienki nerw zstępuje przyśrodkowo i powierzchownie względem grubej gałęzi piszczelowej, ku tyłowi uda, zamiast wchodzić w krótkie rotatory.",
      ],
    ],
  );
  plate(
    {
      page: 322,
      printed: 320,
      figure: "A",
      region: "lower",
      crop: { x: 0.035, y: 0.132, w: 0.445, h: 0.505 },
    },
    [
      [
        "femoral",
        12,
        295,
        435,
        "Anterior right thigh: the branching pale nerve lies lateral to the femoral artery in the femoral triangle, just below the inguinal region.",
        "Przód prawego uda: rozgałęziający się jasny nerw leży bocznie od tętnicy udowej w trójkącie udowym, tuż pod okolicą pachwinową.",
      ],
      [
        "lateralFemoral",
        10,
        100,
        525,
        "At the lateral edge of the dissection, follow the slender cutaneous nerve near the anterior superior iliac spine, lateral to sartorius.",
        "Przy bocznym brzegu preparowania prześledź cienki nerw skórny w pobliżu kolca biodrowego przedniego górnego, bocznie od krawieckiego.",
      ],
      [
        "sartorius",
        8,
        200,
        450,
        "The long superficial strap crosses obliquely from the lateral proximal thigh towards the medial knee and forms the lateral border of the femoral triangle.",
        "Długa powierzchowna taśma przecina udo skośnie od bocznej części bliższej ku przyśrodkowemu kolanu. Tworzy boczny brzeg trójkąta udowego.",
      ],
      [
        "pectineus",
        7,
        479,
        628,
        "The short flat muscle lies in the medial floor of the femoral triangle, deep and medial to the femoral vessels, above adductor longus.",
        "Krótki płaski mięsień leży w przyśrodkowej części dna trójkąta udowego, głęboko i przyśrodkowo od naczyń udowych, powyżej przywodziciela długiego.",
      ],
    ],
  );
  plate(
    {
      page: 322,
      printed: 320,
      figure: "B",
      region: "lower",
      crop: { x: 0.523, y: 0.132, w: 0.37, h: 0.337 },
    },
    [
      [
        "saphenous",
        11,
        788,
        750,
        "In the deeper dissection, the slender nerve descends beside the femoral vessels towards the adductor canal, away from the short muscular femoral branches.",
        "W głębszym preparowaniu cienki nerw schodzi przy naczyniach udowych ku kanałowi przywodzicieli, oddalając się od krótkich gałęzi mięśniowych udowego.",
      ],
    ],
  );
  plate(
    {
      page: 331,
      printed: 330,
      figure: "A",
      region: "lower",
      crop: { x: 0.035, y: 0.1, w: 0.4, h: 0.53 },
    },
    [
      [
        "tibialPopliteal",
        13,
        334,
        475,
        "The main pale cord occupies the centre of the right popliteal fossa, superficial to the vessels, before giving branches between the gastrocnemius heads.",
        "Główny jasny sznur zajmuje środek prawego dołu podkolanowego, powierzchownie od naczyń, przed oddaniem gałęzi między głowami brzuchatego łydki.",
      ],
      [
        "commonFibular",
        15,
        421,
        750,
        "The lateral nerve follows the biceps femoris border towards the fibular head rather than descending centrally with the popliteal vessels.",
        "Boczny nerw biegnie przy brzegu dwugłowego uda ku głowie strzałki, zamiast schodzić centralnie z naczyniami podkolanowymi.",
      ],
      [
        "sural",
        12,
        320,
        1008,
        "The distal superficial nerve descends with the small saphenous vein below the convergence of the cutaneous contributions, between the calf heads.",
        "Dalszy powierzchowny nerw schodzi z żyłą odstrzałkową poniżej połączenia gałęzi skórnych, między głowami mięśnia łydki.",
      ],
      [
        "medialSural",
        14,
        312,
        576,
        "A slender branch leaves the tibial nerve and descends centrally between gastrocnemius heads, before joining the communicating contribution.",
        "Smukła gałąź odchodzi od nerwu piszczelowego i schodzi centralnie między głowami brzuchatego, przed połączeniem z gałęzią łączącą.",
      ],
      [
        "gastroMedial",
        6,
        175,
        832,
        "The large medial calf belly forms the lower medial border of the popliteal fossa. Compare its position with the more lateral head across the central nerve.",
        "Duży przyśrodkowy brzusiec łydki tworzy dolny przyśrodkowy brzeg dołu podkolanowego. Porównaj go z głową boczną po drugiej stronie centralnego nerwu.",
      ],
      [
        "gastroLateral",
        5,
        383,
        987,
        "The lateral calf belly forms the lower lateral popliteal boundary, below the biceps femoris region and lateral to the superficial sural nerve.",
        "Boczny brzusiec łydki tworzy dolne boczne ograniczenie dołu, poniżej okolicy dwugłowego uda i bocznie od powierzchownego nerwu łydkowego.",
      ],
      [
        "semimembranosus",
        9,
        258,
        447,
        "The broad oblique muscle at the upper medial boundary lies deeper than the long cord-like semitendinosus tendon.",
        "Szeroki skośny mięsień przy górnym przyśrodkowym ograniczeniu leży głębiej od długiego sznurowatego ścięgna półścięgnistego.",
      ],
      [
        "semitendinosus",
        10,
        245,
        288,
        "The narrower superficial muscle at the upper medial popliteal boundary continues into a long distal tendon; semimembranosus is the broader deep neighbour.",
        "Węższy powierzchowny mięsień przy górnym przyśrodkowym ograniczeniu dołu przechodzi w długie dalsze ścięgno. Półbłoniasty to szerszy głęboki sąsiad.",
      ],
    ],
  );
  plate(
    {
      page: 338,
      printed: 337,
      figure: "A",
      region: "lower",
      crop: { x: 0.065, y: 0.118, w: 0.285, h: 0.65 },
    },
    [
      [
        "deepFibular",
        11,
        390,
        464,
        "Left proximal leg: the nerve turns into the anterior compartment near the fibular neck and passes deep to the extensor muscles.",
        "Bliższe lewe podudzie: nerw skręca do grupy przedniej przy szyjce strzałki i przechodzi głęboko pod prostownikami.",
      ],
      [
        "superficialFibular",
        12,
        386,
        530,
        "The branch continues down the lateral muscular compartment rather than turning deeply into the anterior compartment with the other branch.",
        "Gałąź biegnie w dół bocznego przedziału mięśniowego, zamiast skręcać głęboko do grupy przedniej z drugą gałęzią.",
      ],
      [
        "tibialisAnterior",
        5,
        250,
        1046,
        "The medial anterior-compartment belly lies directly alongside the tibial border and leads to the most medial anterior ankle tendon.",
        "Przyśrodkowy brzusiec grupy przedniej leży bezpośrednio przy brzegu piszczeli i prowadzi do najbardziej przyśrodkowego ścięgna przed stawem skokowym.",
      ],
      [
        "extensorDigitorum",
        6,
        367,
        624,
        "The long anterior-compartment belly is lateral to tibialis anterior. Trace it distally towards the tendons for the four lateral toes.",
        "Długi brzusiec grupy przedniej leży bocznie od piszczelowego przedniego. Prześledź go w dół ku ścięgnom czterech bocznych palców.",
      ],
      [
        "extensorHallucis",
        7,
        319,
        1142,
        "The slender deeper belly becomes exposed distally between tibialis anterior and extensor digitorum longus; follow its single tendon towards the hallux.",
        "Smukły głębszy brzusiec odsłania się dystalnie między piszczelowym przednim a prostownikiem długim palców. Prześledź pojedyncze ścięgno ku paluchowi.",
      ],
      [
        "fibularisLongus",
        8,
        404,
        646,
        "The lateral muscle lies along the upper fibula, outside the anterior extensor group. Its course leads behind the lateral malleolus, unlike the anterior tendons.",
        "Boczny mięsień leży wzdłuż górnej strzałki, poza przednią grupą prostowników. Dalej prowadzi za kostkę boczną, inaczej niż ścięgna grupy przedniej.",
      ],
    ],
  );
  const knee = {
    page: 333,
    printed: 332,
    region: "lower" as const,
  };
  plate(
    { ...knee, figure: "A", crop: { x: 0.035, y: 0.13, w: 0.41, h: 0.34 } },
    [
      [
        "acl",
        10,
        308,
        478,
        "Anterior left knee: the oblique band rises from the anterior tibial intercondylar area towards the lateral femoral condyle. Use the fibula to establish the lateral side.",
        "Przód lewego kolana: skośne pasmo wznosi się z przedniego pola międzykłykciowego piszczeli ku bocznemu kłykciowi uda. Ustal stronę boczną po położeniu strzałki.",
      ],
      [
        "pcl",
        11,
        263,
        424,
        "The deeper band is visible in the intercondylar notch behind the anterior cruciate ligament, approaching the medial femoral condyle.",
        "Głębsze pasmo widać we wcięciu międzykłykciowym za krzyżowym przednim, przy kłykciu przyśrodkowym kości udowej.",
      ],
      [
        "lateralMeniscus",
        5,
        405,
        518,
        "The fibrocartilage lies on the tibial plateau on the fibular side, beneath the lateral femoral condyle; it is separate from the cord-like collateral ligament.",
        "Chrząstka leży na plateau piszczeli po stronie strzałki, pod kłykciem bocznym uda. Jest oddzielona od sznurowatego więzadła pobocznego.",
      ],
      [
        "medialMeniscus",
        6,
        145,
        536,
        "The fibrocartilage lies on the opposite side from the fibula, between the medial femoral and tibial condyles, beside the broad medial collateral ligament.",
        "Chrząstka leży po stronie przeciwnej do strzałki, między przyśrodkowymi kłykciami uda i piszczeli, przy szerokim więzadle pobocznym przyśrodkowym.",
      ],
      [
        "mcl",
        14,
        60,
        460,
        "The broad flat band runs down the medial side of the knee, opposite the fibula, from the femur onto the tibia.",
        "Szerokie płaskie pasmo schodzi po przyśrodkowej stronie kolana, przeciwnej do strzałki, od uda na piszczel.",
      ],
      [
        "lcl",
        15,
        539,
        530,
        "The narrow cord on the fibular side runs from the lateral femur to the fibular head, separate from the lateral meniscus.",
        "Wąski sznur po stronie strzałki biegnie od bocznej części uda do głowy strzałki, osobno od łąkotki bocznej.",
      ],
    ],
  );
  plate(
    { ...knee, figure: "C", crop: { x: 0.035, y: 0.49, w: 0.41, h: 0.35 } },
    [
      [
        "acl",
        10,
        289,
        1105,
        "Posterior left knee: the anterior cruciate is seen higher in the notch, deep to the more directly exposed posterior cruciate. The fibula is now on the left of the photograph.",
        "Tył lewego kolana: krzyżowe przednie widać wyżej we wcięciu, głęboko względem lepiej odsłoniętego krzyżowego tylnego. Strzałka jest teraz po lewej stronie zdjęcia.",
      ],
      [
        "pcl",
        11,
        299,
        1250,
        "The thick central posterior band rises from the posterior tibial intercondylar region towards the medial femoral condyle, exposed directly from behind.",
        "Grube centralne tylne pasmo wznosi się od tylnego pola międzykłykciowego piszczeli ku przyśrodkowemu kłykciowi uda, odsłonięte bezpośrednio od tyłu.",
      ],
      [
        "lateralMeniscus",
        5,
        185,
        1195,
        "In this posterior view the fibula marks the left side of the photograph: identify the meniscus on that lateral tibial plateau.",
        "W widoku tylnym strzałka wyznacza lewą stronę zdjęcia. Rozpoznaj łąkotkę na tym bocznym plateau piszczeli.",
      ],
      [
        "medialMeniscus",
        6,
        421,
        1204,
        "The posterior part of the medial meniscus lies opposite the fibula, on the right of this posterior photograph, beside the broad tibial collateral attachment.",
        "Tylna część łąkotki przyśrodkowej leży przeciwnie do strzałki, po prawej stronie tego tylnego zdjęcia, przy szerokim przyczepie pobocznym piszczelowym.",
      ],
    ],
  );
  return result;
}

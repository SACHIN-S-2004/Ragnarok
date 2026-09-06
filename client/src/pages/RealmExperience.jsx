/**
 * RealmExperience.jsx
 * ────────────────────────────────────────────────────────────────────────
 * A single-file, drop-in React component that renders an immersive
 * "realm detail" experience for RAGNARÖK's Nine Realms.
 *
 * USAGE
 *   import RealmExperience from "./RealmExperience";
 *   <RealmExperience realmId="asgard" onNavigateRealm={(id) => ...} />
 *
 *   If react-router-dom is present in the host project, this component
 *   will automatically read `useParams().realmId` when no `realmId`
 *   prop is supplied. Otherwise it falls back to internal state
 *   (starting at "asgard") so it works in total isolation.
 *
 * IMPLEMENTATION NOTE ON THE "LIVING WORLD"
 *   The atmosphere is a genuine React Three Fiber scene (see section 3,
 *   `RealmAtmosphere`). Each realm renders through a shared pipeline —
 *   fog, a cinematic camera rig with intro dolly / mouse parallax /
 *   scroll drift, and a GPU particle field — but supplies its own
 *   bespoke geometry group (Bifröst for Asgard, a forge core for
 *   Svartalfheim, a shader-driven lava flow for Muspelheim, and so on)
 *   so no two realms share a silhouette.
 *
 * REQUIRES: react, three, @react-three/fiber. (@react-three/drei is not
 * required by this file.)
 *
 * No CSS files. No JSON files. One file.
 * ────────────────────────────────────────────────────────────────────────
 */

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
  Suspense,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

/* ════════════════════════════════════════════════════════════════════
   1. REALM DATA — the single source of truth the whole UI derives from
   ════════════════════════════════════════════════════════════════════ */

const ORDER = [
  "asgard",
  "vanaheim",
  "alfheim",
  "midgard",
  "jotunheim",
  "svartalfheim",
  "muspelheim",
  "niflheim",
  "hel",
];

const REALMS = {
  asgard: {
    id: "asgard",
    index: "01",
    name: "ASGARD",
    rune: "ᛟ",
    kicker: "REALM OF THE ÆSIR",
    line: "WHERE THE GODS MAKE THEIR HOME",
    description:
      "A fortified realm set high in the branches of Yggdrasil, home to the Æsir and reached from Midgard by the burning bridge Bifröst. Its halls — chief among them Valhalla — gather the honored dead ahead of Ragnarök.",
    colors: {
      bg: "#08070b",
      ink: "#f4ecd8",
      dim: "#a89a78",
      accent: "#d9a441",
      accent2: "#8fb3c9",
      glow: "rgba(217,164,65,0.55)",
      fog: "rgba(20,15,8,0.55)",
    },
    field3d: { palette: ["#d9a441", "#f4ecd8", "#8fb3c9"], count: 90, mode: "rise", speed: 0.5, size: 0.05, spread: 16, vertical: 1.4, fogNear: 4, fogFar: 26 },
    facts: {
      type: "DIVINE",
      beings: "ÆSIR",
      known: ["VALHALLA", "BIFRÖST", "ODIN", "THOR"],
      position: "UPPER REALM",
    },
    lore: "Asgard stands as the gilded citadel of the Æsir, a fortress of divine majestic architecture carved high upon the upper limbs of Yggdrasil. Protected by impenetrable walls and accessed only by Bifröst, Asgard is the heart of celestial governance and epic sagas.",
    artifacts: ["MJÖLNIR", "GUNGNIR", "DRAUPNIR", "GJALLARHORN"],
    places: [
      { name: "VALHALLA", x: 50, y: 18, desc: "The Golden Hall of 540 doors, where Einherjar feast on Sæhrímnir and drink mead from Heidrun." },
      { name: "BIFRÖST", x: 18, y: 62, desc: "The glowing rainbow bridge of shimmering ether, guarded continuously by Heimdall." },
      { name: "HLIÐSKJÁLF", x: 82, y: 65, desc: "Odin's high throne atop Valaskjálf, offering sight across every realm and secret." },
      { name: "BILSKIRNIR", x: 30, y: 40, desc: "Thor's massive 540-room palace in Þrúðvangr, the largest hall in Asgard." },
      { name: "IÐAVÖLLR", x: 50, y: 88, desc: "The central sacred plain where gods gather in council and play golden board games." },
    ],
    inhabitants: [
      { name: "ODIN", role: "ALLFATHER", desc: "Ruler of Asgard, seeker of wisdom, who gave an eye for knowledge at Mímir's well." },
      { name: "THOR", role: "THUNDERER", desc: "Defender of Asgard and Midgard, wielder of the hammer Mjölnir." },
      { name: "FRIGG", role: "QUEEN", desc: "Odin's wife, who is said to know every fate but speaks it to no one." },
      { name: "HEIMDALL", role: "WATCHMAN", desc: "Guardian of Bifröst, whose horn Gjallarhorn will sound at Ragnarök." },
      { name: "TYR", role: "LAWGIVER", desc: "God of war and justice, who lost a hand binding the wolf Fenrir." },
      { name: "BALDR", role: "THE BRIGHT ONE", desc: "Beloved son of Odin and Frigg, whose death set Ragnarök in motion." },
    ],
    connections: [
      { to: "MIDGARD", label: "BIFRÖST", desc: "The rainbow bridge associated with travel between realms." },
      { to: "JÖTUNHEIM", label: "IRON WOOD ROADS", desc: "Contested borderlands where gods and giants have long clashed." },
      { to: "VANAHEIM", label: "THE ÆSIR–VANIR WAR", desc: "An old conflict ended in a truce and an exchange of hostages." },
    ],
    myths: [
      { title: "ODIN'S SACRIFICE", desc: "The Allfather hangs nine nights on Yggdrasil to win the secret of the runes." },
      { title: "THE BUILDING OF ASGARD'S WALL", desc: "A mysterious builder offers to raise Asgard's defenses at a terrible price." },
      { title: "THOR AND THE GIANTS", desc: "Recurring contests of strength between the thunder god and Jötunheim." },
      { title: "RAGNARÖK", desc: "The foretold battle in which Asgard's gods meet their fated ends." },
    ],
    lives: ["GODS", "HUMANS", "THE DEAD"],
  },

  vanaheim: {
    id: "vanaheim",
    index: "02",
    name: "VANAHEIM",
    rune: "ᚹ",
    kicker: "REALM OF THE VANIR",
    line: "HOME OF THE ELDER FERTILITY GODS",
    description:
      "An ancient, fertile realm belonging to the Vanir — a second tribe of gods associated with prosperity, magic, and the natural world, who fought the Æsir to a standstill before an uneasy peace.",
    colors: {
      bg: "#070c08",
      ink: "#e9f2df",
      dim: "#93a880",
      accent: "#6fae5b",
      accent2: "#c7d98f",
      glow: "rgba(111,174,91,0.5)",
      fog: "rgba(6,16,8,0.6)",
    },
    field3d: { palette: ["#6fae5b", "#c7d98f", "#dff0c8"], count: 110, mode: "float", speed: 0.3, size: 0.04, spread: 14, fogNear: 3, fogFar: 20 },
    facts: {
      type: "DIVINE / ELDER",
      beings: "VANIR",
      known: ["FREYR", "FREYJA", "NJÖRÐ", "SEIÐR"],
      position: "OUTER REALM",
    },
    lore: "Vanaheim is an unbridled realm of verdant wilderness, ancient rivers, and primal magic. Before the truce with Asgard, the Vanir ruled this realm through deep communion with nature and the practice of Seiðr—a potent sorcery capable of weaving fate itself.",
    artifacts: ["SKÍÐBLAÐNIR", "BRÍSINGAMEN", "FALCON CLOAK"],
    places: [
      { name: "NÓATÚN", x: 28, y: 32, desc: "Njörð's hall of ships by the sea, where wave-song fills the high wooden arches." },
      { name: "SESS RÚMNIR", x: 72, y: 38, desc: "Freyja's magnificent hall within Fólkvangr, receiving half of all slain warriors." },
      { name: "THE FERTILE GROVES", x: 62, y: 64, desc: "Eternal groves said to blossom with golden flora under Vanir blessings." },
      { name: "THE SEIÐR CIRCLES", x: 45, y: 82, desc: "Sacred stone monoliths where fate-weavers perform cosmic chants." },
    ],
    inhabitants: [
      { name: "FREYR", role: "LORD OF HARVEST & SUNSHINE", desc: "Master of Skíðblaðnir and keeper of Gullinbursti, bringing abundance and peace across realms." },
      { name: "FREYJA", role: "LADY OF SEIÐR & WAR", desc: "Ruler of Fólkvangr, mistress of magic and love, who claims her pick of the heroic dead." },
      { name: "NJÖRÐ", role: "GOD OF THE WINDS & SEA", desc: "Patron of seafarers and coastal wealth, ruling from his ocean hall Nóatún." },
      { name: "KVASIR", role: "BEING OF ABSOLUTE WISDOM", desc: "Created from the combined spittle of Æsir and Vanir to seal their peace, possessing infinite counsel." },
    ],
    connections: [
      { to: "ASGARD", label: "THE ÆSIR–VANIR WAR", desc: "Hostages were exchanged between the two divine tribes after the truce." },
      { to: "ALFHEIM", label: "SHARED BORDERLANDS", desc: "Given to Freyr as a tooth-gift, tying the two realms closely together." },
    ],
    myths: [
      { title: "THE ÆSIR–VANIR WAR", desc: "The first war in the cosmos, fought to a stalemate before an eternal truce was forged." },
      { title: "THE HOSTAGE EXCHANGE", desc: "Njörð, Freyr, and Freyja came to live among the Æsir as sacred pledges of harmony." },
      { title: "THE CREATION OF KVASIR", desc: "The gods created the wisest of beings from their peace ritual spittle." },
      { title: "THE TEACHING OF SEIÐR", desc: "Freyja imparted the secret arts of fate magic to Odin in exchange for realm wisdom." },
    ],
    lives: ["GODS", "CREATURES"],
  },

  alfheim: {
    id: "alfheim",
    index: "03",
    name: "ALFHEIM",
    rune: "ᛖ",
    kicker: "REALM OF THE LIGHT ELVES",
    line: "A LUMINOUS REALM GIVEN TO FREYR",
    description:
      "A radiant upper realm inhabited by the Ljósálfar — beings described in the Prose Edda as fairer than the sun. Alfheim was given to Freyr as a tooth-gift in his infancy.",
    colors: {
      bg: "#0a0a10",
      ink: "#fbf7ef",
      dim: "#b9c4d4",
      accent: "#cdd9ff",
      accent2: "#fce9c9",
      glow: "rgba(205,217,255,0.55)",
      fog: "rgba(20,22,32,0.45)",
    },
    field3d: { palette: ["#cdd9ff", "#fce9c9", "#ffffff"], count: 120, mode: "float", speed: 0.25, size: 0.035, spread: 15, fogNear: 5, fogFar: 30 },
    facts: {
      type: "CELESTIAL",
      beings: "LJÓSÁLFAR",
      known: ["FREYR", "LIGHT ELVES", "TOOTH-GIFT"],
      position: "UPPER REALM",
    },
    lore: "Alfheim floats like a crystalline sanctuary in the upper atmospheric canopy of Yggdrasil. Pure light refracts through silver spires, and its inhabitants weave subtle glimmers into garments that never tarnish.",
    artifacts: ["SOLAR CRYSTAL", "ELVEN HARP OF LÓRIEN", "FREYR'S TOOTH-RING"],
    places: [
      { name: "THE LUMINOUS COURTS", x: 44, y: 24, desc: "Palaces crafted from translucent alabaster that shimmer under celestial auroras." },
      { name: "FREYR'S GIFT-LANDS", x: 70, y: 58, desc: "The sacred territory granted to Lord Freyr when he cut his first tooth." },
      { name: "VALE OF PRISMATIC MISTS", x: 25, y: 75, desc: "A valley where light splits into endless rainbows that sing in harmonic frequencies." },
    ],
    inhabitants: [
      { name: "THE LJÓSÁLFAR", role: "LIGHT ELVES", desc: "Ethereal beings fairer than the sun, guardians of ancient stellar grace and inspiration." },
      { name: "FREYR", role: "LORD & KEEPER OF ALFHEIM", desc: "Vanir god given divine sovereignty over Alfheim, bringing warmth and abundance." },
      { name: "DAEG & NÓTT", role: "DAY AND NIGHT WEAVERS", desc: "Celestial spriggan guardians who guide the sun horse Skinfaxi across the skies." },
    ],
    connections: [
      { to: "VANAHEIM", label: "SHARED BORDERLANDS", desc: "Alfheim's ties to the Vanir run through Freyr's dual lordship." },
      { to: "ASGARD", label: "UPPER-REALM PROXIMITY", desc: "Grouped among the realms of the sky in later scholarly reconstructions." },
    ],
    myths: [
      { title: "THE TOOTH-GIFT", desc: "Freyr is given Alfheim as a gift upon cutting his first tooth, uniting light elves and fertility gods." },
      { title: "ON THE NATURE OF ELVES", desc: "Snorri's Prose Edda distinguishes light elves from dark subterranean artisans." },
      { title: "THE WEAVING OF SOLAR LIGHT", desc: "Elven artisans forge sunlight into thread used for divine banners." },
    ],
    lives: ["ELVES", "GODS"],
  },

  midgard: {
    id: "midgard",
    index: "04",
    name: "MIDGARD",
    rune: "ᛗ",
    kicker: "REALM OF HUMANKIND",
    line: "THE WORLD ENCLOSED BY THE SERPENT",
    description:
      "The middle realm, home to humankind, ringed by an ocean where the serpent Jörmungandr lies coiled. Connected to Asgard by Bifröst and bordered by the giant-lands beyond its edges.",
    colors: {
      bg: "#0a0c0e",
      ink: "#e7e2d6",
      dim: "#8a8f86",
      accent: "#5c7a6b",
      accent2: "#9fb6c9",
      glow: "rgba(159,182,201,0.4)",
      fog: "rgba(10,14,16,0.6)",
    },
    field3d: { palette: ["#9fb6c9", "#e7e2d6", "#5c7a6b"], count: 70, mode: "snow", speed: 0.4, size: 0.04, spread: 16, vertical: 1.3, fogNear: 6, fogFar: 34 },
    facts: {
      type: "MORTAL",
      beings: "HUMANKIND",
      known: ["JÖRMUNGANDR", "YGGDRASIL'S ROOTS", "ASK & EMBLA"],
      position: "MIDDLE REALM",
    },
    lore: "Midgard sits at the geometric center of the cosmos, forged from the body of the primordial giant Ymir. Encircling its continents is a fathomless ocean where Jörmungandr sleeps, holding the world together until its jaws unleash Ragnarök.",
    artifacts: ["MEAD OF POETRY", "RING OF HORIK", "RUNESTONE OF JELLING"],
    places: [
      { name: "THE ENCIRCLING SEA", x: 20, y: 30, desc: "Waters said to hold Jörmungandr, the World Serpent, coiled tail-in-mouth." },
      { name: "UTGARD'S EDGE", x: 78, y: 32, desc: "The rough borderland where human farms give way to icy giant wastes." },
      { name: "URÐARBRUNNR ROOT", x: 50, y: 76, desc: "The great root of Yggdrasil anchoring Midgard to the Well of Fate." },
      { name: "MANHEIMR PLAINS", x: 45, y: 50, desc: "Hills and fjords where mortal chieftains raise longhouses and runestones." },
    ],
    inhabitants: [
      { name: "HUMANKIND", role: "MORTALS", desc: "Descended from Ask and Embla, striving under the gaze of gods and giants." },
      { name: "ASK & EMBLA", role: "THE FIRST HUMANS", desc: "Shaped from ash and elm driftwood and endowed with spirit by Odin, Vili, and Vé." },
      { name: "JÖRMUNGANDR", role: "THE WORLD SERPENT", desc: "Loki's colossal son whose coils span the circumference of the earthly sea." },
    ],
    connections: [
      { to: "ASGARD", label: "BIFRÖST", desc: "The rainbow bridge associated with travel between realms." },
      { to: "JÖTUNHEIM", label: "UTGARD'S EDGE", desc: "A contested, thinly-settled border between human and giant lands." },
      { to: "HEL", label: "THE HELWAY", desc: "The road the dead are said to travel downward and northward." },
    ],
    myths: [
      { title: "THE SHAPING OF ASK & EMBLA", desc: "Odin and his brothers give life, breath, and reason to the first human couple." },
      { title: "THOR'S JOURNEY TO UTGARD", desc: "Thor and his companions are tested and humbled in Utgarða-Loki's stronghold." },
      { title: "THE FISHING OF JÖRMUNGANDR", desc: "Thor nearly hauls the World Serpent from the deep ocean using an ox head as bait." },
      { title: "THE BINDING OF THE SERPENT", desc: "The gods cast Jörmungandr into the sea where it grew to encircle the world." },
    ],
    lives: ["HUMANS", "CREATURES"],
  },

  jotunheim: {
    id: "jotunheim",
    index: "05",
    name: "JÖTUNHEIM",
    rune: "ᛃ",
    kicker: "REALM OF THE GIANTS",
    line: "VAST LANDS BEYOND THE EDGE OF THE WORLD",
    description:
      "A realm of immense, inhospitable scale beyond Midgard's borders, home to the Jötnar — giants who are, in the myths, as often rivals of the gods as their kin, ancestors, and even lovers.",
    colors: {
      bg: "#0b0d10",
      ink: "#dfe6ec",
      dim: "#7c8a94",
      accent: "#89a0ad",
      accent2: "#3f5561",
      glow: "rgba(137,160,173,0.35)",
      fog: "rgba(8,10,13,0.75)",
    },
    field3d: { palette: ["#89a0ad", "#dfe6ec", "#3f5561"], count: 50, mode: "snow", speed: 0.25, size: 0.045, spread: 18, vertical: 1.5, fogNear: 3, fogFar: 20 },
    facts: {
      type: "GIANT-KIND",
      beings: "JÖTNAR",
      known: ["UTGARÐA-LOKI", "SKRYMIR", "YMIR'S BONES"],
      position: "OUTER REALM",
    },
    lore: "Jötunheim is a wild realm of titanic frozen peaks, jagged granite chasms, and primeval wilderness. Here dwell frost and mountain giants whose memories stretch back to before the Æsir carved order into chaos.",
    artifacts: ["SKRYMIR'S GLOVE", "MEAD HORN OF UTGARD", "SKAÐI'S BOW OF FROST"],
    places: [
      { name: "UTGARD", x: 60, y: 20, desc: "A colossal giant fortress where illusions distort space, size, and perception." },
      { name: "THE IRON WOOD", x: 24, y: 55, desc: "A dark forest of iron-leafed trees home to giantesses and wolf-kin bred by Angrboða." },
      { name: "THE FROZEN RANGES", x: 78, y: 78, desc: "Monolithic ice peaks where avalanche storms echo like giant laughter." },
      { name: "GASTMIR'S CAVE", x: 42, y: 38, desc: "Subterranean cavern where old giant sorcerers store ancient cosmic runes." },
    ],
    inhabitants: [
      { name: "UTGARÐA-LOKI", role: "GIANT-KING & MASTER ILLUSIONIST", desc: "Monarch of Utgard who humiliated Thor through deceptive glamours and cosmic forces." },
      { name: "SKRYMIR", role: "TITANIC WANDERING GIANT", desc: "A giant whose sleeping bag was mistaken for a grand hall by travelling gods." },
      { name: "SKAÐI", role: "GIANTESS OF SNOWSHOES & HUNT", desc: "Mountain giantess who demanded blood-money for her father and won a place among the gods." },
      { name: "ANGRBOÐA", role: "MOTHER OF MONSTERS", desc: "Iron Wood giantess who bore Fenrir, Jörmungandr, and Hel with Loki." },
    ],
    connections: [
      { to: "MIDGARD", label: "UTGARD'S EDGE", desc: "A contested, thinly-settled border between human and giant lands." },
      { to: "ASGARD", label: "IRON WOOD ROADS", desc: "Contested borderlands where gods and giants have long clashed." },
    ],
    myths: [
      { title: "THOR AND THE GIANTS", desc: "Recurring contests of strength and cunning between the thunder god and giant lords." },
      { title: "THOR'S JOURNEY TO UTGARD", desc: "Thor drinks from the sea and wrestles Old Age herself under giant illusions." },
      { title: "SKAÐI'S VENGEANCE", desc: "Skaði marches on Asgard in full armor to avenge her father Thiassi." },
    ],
    lives: ["GIANTS", "CREATURES"],
  },

  svartalfheim: {
    id: "svartalfheim",
    index: "06",
    name: "SVARTALFHEIM",
    rune: "ᛞ",
    kicker: "REALM OF THE DARK ELVES / DWARVES",
    line: "WHERE THE GREAT TREASURES WERE FORGED",
    description:
      "A subterranean realm of stone and forge-fire, home to the master-smiths who wrought Mjölnir, Gungnir, and Draupnir. Its inhabitants are named variously as dwarves and dark elves across the sources.",
    colors: {
      bg: "#0a0705",
      ink: "#f2ded0",
      dim: "#a97b52",
      accent: "#e8823a",
      accent2: "#6b6a68",
      glow: "rgba(232,130,58,0.6)",
      fog: "rgba(15,8,4,0.6)",
    },
    field3d: { palette: ["#e8823a", "#ffb35c", "#6b6a68"], count: 90, mode: "sparks", speed: 0.9, size: 0.04, spread: 12, vertical: 1.6, fogNear: 2, fogFar: 16 },
    facts: {
      type: "SUBTERRANEAN",
      beings: "DWARVES",
      known: ["MJÖLLNIR", "GUNGNIR", "DRAUPNIR"],
      position: "UNDER REALM",
    },
    lore: "Deep beneath the crust of Yggdrasil lies Svartalfheim, a labyrinthine underworld echoing with anvil strikes, magma rivers, and glowing gemstone veins. Here dwarven master artisans manipulate earth magic to craft items infused with cosmic power.",
    artifacts: ["MJÖLNIR", "GUNGNIR", "DRAUPNIR", "GLEIPNIR", "GULLINBURSTI"],
    places: [
      { name: "THE SONS OF IVALDI'S FORGE", x: 32, y: 34, desc: "Legendary workshop where Odin's spear Gungnir and Sif's golden hair were wrought." },
      { name: "BROKKR & EITRI'S HALL", x: 68, y: 56, desc: "Magma forge where Thor's hammer Mjölnir was forged despite Loki's interference." },
      { name: "THE DEEP GALLERIES", x: 50, y: 82, desc: "Glowing crystal caverns housing subterranean dwarf cities and ore vaults." },
      { name: "NIDAVELLIR CAVERNS", x: 22, y: 68, desc: "Golden halls beneath the mountain where Sindri weaves magical metals." },
    ],
    inhabitants: [
      { name: "BROKKR", role: "MASTER FORGE-SMITH", desc: "Dwarf master smith who worked the bellows to forge Mjölnir and Draupnir." },
      { name: "EITRI", role: "MASTER CRAFTSMAN", desc: "Brokkr's brother, famed for pouring sacred magic into glowing crucible fires." },
      { name: "THE SONS OF IVALDI", role: "ELDER SMITHS", desc: "Craftsmen who forged Skidbladnir, the ship that folds like cloth." },
      { name: "ALVÍSS", role: "ALL-WISE DWARF", desc: "Subterranean scholar whose wisdom was tested by Thor until sunrise turned him to stone." },
    ],
    connections: [
      { to: "MIDGARD", label: "THE DEEP GALLERIES", desc: "Tunnels the sources suggest run beneath the mortal world." },
      { to: "NIFLHEIM", label: "SHARED UNDER-REALM", desc: "Both are counted among the lower, darker regions of the cosmos." },
    ],
    myths: [
      { title: "THE WAGER WITH LOKI", desc: "Loki bets his head that dwarven brothers cannot out-craft Ivaldi's golden wonders." },
      { title: "THE FORGING OF MJÖLNIR", desc: "A stinging fly fails to stop Brokkr and Eitri from forging Thor's legendary hammer." },
      { title: "SIF'S GOLDEN HAIR", desc: "Dwarven smiths spin true living gold to replace the locks severed by Loki." },
    ],
    lives: ["DWARVES", "ELVES"],
  },

  muspelheim: {
    id: "muspelheim",
    index: "07",
    name: "MUSPELHEIM",
    rune: "ᛊ",
    kicker: "REALM OF PRIMORDIAL FIRE",
    line: "THE OLDEST OF THE NINE REALMS",
    description:
      "A realm of fire that existed before the world was shaped, guarded by the fire-giant Surtr. At Ragnarök, its sons are said to ride forth and set the whole of creation ablaze.",
    colors: {
      bg: "#0c0503",
      ink: "#ffe3c2",
      dim: "#c9633b",
      accent: "#ff5a2e",
      accent2: "#ffb238",
      glow: "rgba(255,90,46,0.65)",
      fog: "rgba(30,6,2,0.5)",
    },
    field3d: { palette: ["#ff5a2e", "#ffb238", "#ffe3c2"], count: 120, mode: "embers", speed: 0.7, size: 0.045, spread: 14, vertical: 1.6, fogNear: 2, fogFar: 18 },
    facts: {
      type: "PRIMORDIAL",
      beings: "FIRE-GIANTS",
      known: ["SURTR", "LÆVATEINN", "RAGNARÖK'S FLAME"],
      position: "ANCIENT REALM",
    },
    lore: "Muspelheim is a primordial crucible of raging flames, molten magma lakes, and intense radiant heat that existed prior to time. Guarded by Surtr with his flaming sword brighter than the sun, it holds the apocalyptic fire that will burn the world tree at Ragnarök.",
    artifacts: ["SURTR'S FLAMING SWORD", "LÆVATEINN", "CINDERS OF CREATION"],
    places: [
      { name: "SURTR'S WATCH", x: 50, y: 24, desc: "The glowing precipice where the fire lord stands vigil until the doom of gods." },
      { name: "THE BURNING PLAINS", x: 20, y: 58, desc: "Ash-covered expanses where rivers of liquid fire flow eternally." },
      { name: "GINNUNGAGAP'S EDGE", x: 76, y: 70, desc: "The ancient border where Muspelheim's embers ignited Niflheim's ice at the dawn of time." },
    ],
    inhabitants: [
      { name: "SURTR", role: "FIRE-GIANT LORD & GUARDIAN", desc: "Primordial titan holding a sword of blazing heat destined to consume the cosmos." },
      { name: "THE SONS OF MUSPELL", role: "FIRE WARRIORS", desc: "Hordes of fire entities who will ride across Bifröst, causing the bridge to shatter." },
      { name: "SINMARA", role: "KEEPER OF LÆVATEINN", desc: "Consort of Surtr who guards the legendary flaming blade inside a nine-locked chest." },
    ],
    connections: [
      { to: "NIFLHEIM", label: "GINNUNGAGAP", desc: "The primordial void where fire and ice first met and shaped creation." },
      { to: "ASGARD", label: "RAGNARÖK'S PATH", desc: "The route Surtr's forces are prophesied to take against the gods." },
    ],
    myths: [
      { title: "THE SHAPING OF THE WORLD", desc: "Muspelheim's sparks meet Niflheim's rime in Ginnungagap to spark the first life." },
      { title: "THE DOOM OF RAGNARÖK", desc: "Surtr flings fire across the nine realms, destroying both gods and giants." },
    ],
    lives: ["GIANTS"],
  },

  niflheim: {
    id: "niflheim",
    index: "08",
    name: "NIFLHEIM",
    rune: "ᚻ",
    kicker: "REALM OF PRIMORDIAL ICE",
    line: "A WORLD OF MIST BEFORE TIME",
    description:
      "One of the two primordial realms, a place of ice, frost and mist that existed before the world was made. Its cold met Muspelheim's fire in Ginnungagap to give rise to the first living being.",
    colors: {
      bg: "#070a0d",
      ink: "#dbeaf2",
      dim: "#5c7684",
      accent: "#7fb8d4",
      accent2: "#e8f4fa",
      glow: "rgba(127,184,212,0.4)",
      fog: "rgba(6,12,16,0.8)",
    },
    field3d: { palette: ["#7fb8d4", "#e8f4fa", "#3d5866"], count: 35, mode: "snow", speed: 0.2, size: 0.035, spread: 20, vertical: 1.4, fogNear: 1.5, fogFar: 12 },
    facts: {
      type: "PRIMORDIAL",
      beings: "UNKNOWN",
      known: ["HVERGELMIR", "GINNUNGAGAP", "ELIVÁGAR"],
      position: "ANCIENT REALM",
    },
    lore: "Niflheim is an eternal realm of dense freezing fog, rime frost, and absolute silence. It harbors Hvergelmir, the boiling subterranean spring that feeds the eleven venomous rivers of Élivágar.",
    artifacts: ["ICE OF ÉLIVÁGAR", "HVERGELMIR VIAL", "RIME SHROUD"],
    places: [
      { name: "HVERGELMIR", x: 50, y: 30, desc: "The cosmic roaring spring where the dragon NÍÐHÖGGR gnaws Yggdrasil's lowest root." },
      { name: "THE FROST WASTES", x: 24, y: 66, desc: "Vast, silent expanses of frozen mist stretching into absolute darkness." },
      { name: "ÉLIVÁGAR RIVERS", x: 74, y: 78, desc: "The poisonous icy rivers whose frozen crusts drifted into Ginnungagap." },
    ],
    inhabitants: [
      { name: "NÍÐHÖGGR", role: "MALICIOUS DRAGON", desc: "Serpentine dragon coiled beneath Hvergelmir, gnawing on the root of the world tree." },
      { name: "FROST SPECTRES", role: "PRIMORDIAL ECHOES", desc: "Whispering mist phantoms created from the venomous frost of Élivágar." },
    ],
    connections: [
      { to: "MUSPELHEIM", label: "GINNUNGAGAP", desc: "The primordial void where fire and ice first met and shaped creation." },
      { to: "SVARTALFHEIM", label: "SHARED UNDER-REALM", desc: "Both are counted among the lower, darker regions of the cosmos." },
      { to: "HEL", label: "LATER ASSOCIATION", desc: "Some later sources blur Niflheim's cold with Hel's domain of the dead." },
    ],
    myths: [
      { title: "THE COSMIC SPRINGS", desc: "Hvergelmir sends forth rivers that freeze in the void to begin world creation." },
      { title: "THE GNAWING DRAGON", desc: "Níðhöggr trades insults with the eagle atop Yggdrasil via the squirrel Ratatoskr." },
    ],
    lives: ["CREATURES"],
  },

  hel: {
    id: "hel",
    index: "09",
    name: "HEL",
    rune: "ᚺ",
    kicker: "REALM OF THE UNHONORED DEAD",
    line: "WHERE THOSE WHO DID NOT FALL IN BATTLE GO",
    description:
      "A cold, shadowed realm ruled by the being Hel, daughter of Loki, given dominion here by Odin. Those who die of sickness or old age are said to travel down and north along the Helway to reach it.",
    colors: {
      bg: "#050506",
      ink: "#cfc9c2",
      dim: "#57524f",
      accent: "#7a736e",
      accent2: "#3c4a45",
      glow: "rgba(122,115,110,0.3)",
      fog: "rgba(2,2,3,0.85)",
    },
    field3d: { palette: ["#7a736e", "#3c4a45", "#cfc9c2"], count: 40, mode: "ash", speed: 0.15, size: 0.035, spread: 16, vertical: 1.3, fogNear: 1.5, fogFar: 14 },
    facts: {
      type: "CHTHONIC",
      beings: "THE DEAD",
      known: ["HEL", "GARMR", "THE HELWAY"],
      position: "LOWER REALM",
    },
    lore: "Helheim is a gloomy, quiet subterranean realm enveloped in fog and heavy silent mists. It is neither a place of torture nor eternal punishment, but a silent underworld hall for those who died of old age, illness, or quiet peaceful deaths.",
    artifacts: ["NAGLFAR NAIL SHIP", "GJALLARBRÚ GOLD BRIDGE", "DISH OF HUNGER"],
    places: [
      { name: "ÉLJÚÐNIR", x: 50, y: 28, desc: "Hel's hall, with thresholds named Stumbling-Block and plates named Hunger." },
      { name: "GJÖLL RIVER & GJALLARBRÚ", x: 22, y: 60, desc: "The river bordering Hel, crossed by a roofed bridge of burning gold guarded by MÓÐGUÐR." },
      { name: "GNIPAHELLIR", x: 74, y: 76, desc: "The cavern mouth at the entry of Hel where the blood-stained hound Garmr is bound." },
      { name: "NÁSTRÖND", x: 80, y: 40, desc: "The Shore of Corpses where oathbreakers and murderers are punished by Níðhöggr." },
    ],
    inhabitants: [
      { name: "HEL", role: "QUEEN OF THE UNDERWORLD", desc: "Loki's daughter, half living skin and half rotting corpse, ruling with solemn dignity." },
      { name: "GARMR", role: "BLOOD-STAINED GUARDIAN HOUND", desc: "Monstrous hound who howls at Gnipahellir until breaking free at Ragnarök." },
      { name: "MÓÐGUÐR", role: "WATCH-MAIDEN OF THE BRIDGE", desc: "Maiden who guards Gjallarbrú and questions all dead souls crossing into Hel." },
    ],
    connections: [
      { to: "MIDGARD", label: "THE HELWAY", desc: "The road the dead are said to travel downward and northward." },
      { to: "NIFLHEIM", label: "LATER ASSOCIATION", desc: "Some later sources blur Niflheim's cold with Hel's domain of the dead." },
    ],
    myths: [
      { title: "HERMÓÐ'S RIDE TO HEL", desc: "Odin's messenger rides nine nights down the Helway to bargain for Baldr's return." },
      { title: "THE SAILING OF NAGLFAR", desc: "At Ragnarök, a ship made from the unpared nails of dead men sails out of Hel." },
    ],
    lives: ["THE DEAD", "CREATURES"],
  },
};

/* ════════════════════════════════════════════════════════════════════
   2. SMALL HOOKS
   ════════════════════════════════════════════════════════════════════ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn);
    };
  }, []);
  return reduced;
}

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return touch;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 860);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

/** best-effort react-router param read, without importing react-router-dom */
function useRealmIdFromLocation() {
  const [fromUrl, setFromUrl] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const parts = window.location.pathname.split("/").filter(Boolean);
    const i = parts.indexOf("realm");
    if (i !== -1 && parts[i + 1]) {
      const candidate = parts[i + 1].toLowerCase();
      if (REALMS[candidate]) setFromUrl(candidate);
    }
  }, []);
  return fromUrl;
}

/* ════════════════════════════════════════════════════════════════════
   3. ATMOSPHERE — React Three Fiber living world
   ════════════════════════════════════════════════════════════════════
   Every realm renders through the same pipeline (fog, light rig,
   particle field, camera rig) but each supplies its own signature
   geometry group below, so no two realms share a silhouette.
   ════════════════════════════════════════════════════════════════════ */

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ── camera rig: intro dolly, mouse parallax, scroll drift ────────── */
function CameraRig({ realm, reducedMotion, scrollRef }) {
  const { camera, pointer } = useThree();
  const mounted = useRef(0);
  const target = useRef(new THREE.Vector3(0, 0.4, 9));
  const introFrom = useMemo(() => new THREE.Vector3(0, -1.2, 22), [realm.id]);
  const introTo = useMemo(() => new THREE.Vector3(0, 0.4, 8.5), [realm.id]);

  useEffect(() => {
    mounted.current = 0;
  }, [realm.id]);

  useFrame((_, dt) => {
    mounted.current = Math.min(1, mounted.current + dt / (reducedMotion ? 0.4 : 2.2));
    const introT = 1 - Math.pow(1 - mounted.current, 3); // ease-out cubic
    const base = introFrom.clone().lerp(introTo, introT);

    const scroll = scrollRef.current || 0;
    const px = reducedMotion ? 0 : pointer.x * 0.55;
    const py = reducedMotion ? 0 : pointer.y * 0.32;

    target.current.set(base.x + px, base.y + py + scroll * 0.6, base.z - scroll * 2.4);
    camera.position.lerp(target.current, reducedMotion ? 1 : 0.045);
    camera.lookAt(0, 0.2 - scroll * 0.3, 0);
  });

  return null;
}

/* ── particle field: shared engine, per-realm behaviour via `mode` ─── */
function ParticleField({ config, reducedMotion, mobile }) {
  const ref = useRef();
  const count = Math.round((mobile ? 0.45 : 1) * config.count * (reducedMotion ? 0.4 : 1));
  const spread = config.spread || 14;

  const [positions, colors, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const palette = config.palette.map(hexToRgb);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * (config.vertical || 1);
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.7;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
      seed[i] = Math.random() * Math.PI * 2;
    }
    return [pos, col, seed];
  }, [count, spread, config.palette, config.vertical]);

  useFrame((state, dt) => {
    if (reducedMotion || !ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    const speed = config.speed || 0.3;
    const half = spread / 2;

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const s = seeds[i];
      switch (config.mode) {
        case "rise":
          arr[iy] += speed * dt;
          arr[ix] += Math.sin(t * 0.6 + s) * 0.003;
          break;
        case "embers":
          arr[iy] += speed * dt * 1.4;
          arr[ix] += Math.sin(t * 1.4 + s) * 0.006;
          arr[iz] += Math.cos(t * 1.1 + s) * 0.004;
          break;
        case "sparks":
          arr[iy] += speed * dt * 1.8;
          arr[ix] += Math.sin(t * 3 + s) * 0.01;
          break;
        case "snow":
          arr[iy] -= speed * dt * 0.5;
          arr[ix] += Math.sin(t * 0.4 + s) * 0.003;
          break;
        case "ash":
          arr[iy] -= speed * dt * 0.25;
          arr[ix] += Math.sin(t * 0.3 + s) * 0.002;
          break;
        case "float":
          arr[ix] += Math.sin(t * 0.5 + s) * 0.004;
          arr[iy] += Math.cos(t * 0.4 + s) * 0.003;
          break;
        default:
          arr[ix] += Math.sin(t * 0.3 + s) * 0.002;
          arr[iy] += Math.cos(t * 0.25 + s) * 0.002;
      }
      if (arr[iy] > half) arr[iy] = -half;
      if (arr[iy] < -half) arr[iy] = half;
      if (arr[ix] > half) arr[ix] = -half;
      if (arr[ix] < -half) arr[ix] = half;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={config.size || 0.045}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── shared lava/aurora style flowing shader material ─────────────── */
function useFlowShader(colorA, colorB, colorC) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color(colorA) },
          uColorB: { value: new THREE.Color(colorB) },
          uColorC: { value: new THREE.Color(colorC) },
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float uTime;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(pos.x * 1.4 + uTime * 0.6) * cos(pos.y * 1.1 - uTime * 0.4);
            pos.z += wave * 0.35;
            vElevation = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform vec3 uColorC;
          uniform float uTime;
          void main() {
            float mixer = smoothstep(-0.5, 0.5, vElevation + sin(vUv.x * 6.0 + uTime * 0.3) * 0.2);
            vec3 color = mix(uColorA, uColorB, mixer);
            color = mix(color, uColorC, pow(vUv.y, 3.0));
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide,
      }),
    [colorA, colorB, colorC]
  );
}

function FlowingGround({ colorA, colorB, colorC, y = -2.6, size = 40 }) {
  const ref = useRef();
  const mat = useFlowShader(colorA, colorB, colorC);
  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.35, 0, 0]} position={[0, y, -4]} material={mat}>
      <planeGeometry args={[size, size, 64, 64]} />
    </mesh>
  );
}

/* ── signature environments, one per realm ─────────────────────────── */

function AsgardScene({ realm, mobile }) {
  const arcRef = useRef();
  const pillars = useMemo(
    () =>
      new Array(mobile ? 5 : 9).fill(0).map((_, i) => ({
        x: (i - (mobile ? 2 : 4)) * 1.9,
        h: 5 + Math.random() * 6,
        z: -6 - Math.random() * 6,
      })),
    [mobile]
  );
  const bifrostCurve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector3((t - 0.5) * 16, Math.sin(t * Math.PI) * 4.2 - 1.4, -3 + t * 2));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);
  const bifrostGeo = useMemo(() => new THREE.TubeGeometry(bifrostCurve, 80, 0.16, 8, false), [bifrostCurve]);
  const bifrostColors = useMemo(() => {
    const colors = [];
    const palette = ["#d9a441", "#f4ecd8", "#8fb3c9", "#e07a5f", "#81b29a"];
    const count = bifrostGeo.attributes.position.count;
    for (let i = 0; i < count; i++) {
      const c = new THREE.Color(palette[Math.floor((i / count) * palette.length) % palette.length]);
      colors.push(c.r, c.g, c.b);
    }
    bifrostGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return true;
  }, [bifrostGeo]);

  useFrame((state) => {
    if (arcRef.current) arcRef.current.material.emissiveIntensity = 1.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
  });

  return (
    <group>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2 - 3, p.z]}>
          <cylinderGeometry args={[0.35, 0.5, p.h, 6]} />
          <meshStandardMaterial color="#1a1508" emissive="#d9a441" emissiveIntensity={0.15} />
        </mesh>
      ))}
      <mesh position={[0, -3.2, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#0d0a05" metalness={0.6} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 4, 2]} color="#ffd08a" intensity={2.2} distance={20} />
    </group>
  );
}

function VanaheimScene({ mobile }) {
  const groupRef = useRef();
  const branches = useMemo(() => {
    const items = [];
    const n = mobile ? 10 : 18;
    for (let i = 0; i < n; i++) {
      items.push({
        pos: [(Math.random() - 0.5) * 12, -3 + Math.random() * 6, -2 - Math.random() * 8],
        rot: [Math.random() * 0.6 - 0.3, Math.random() * Math.PI, Math.random() * 0.6 - 0.3],
        h: 3 + Math.random() * 5,
        r: 0.08 + Math.random() * 0.14,
      });
    }
    return items;
  }, [mobile]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((c, i) => {
      c.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.05;
    });
  });

  return (
    <group>
      <group ref={groupRef}>
        {branches.map((b, i) => (
          <mesh key={i} position={b.pos} rotation={b.rot}>
            <cylinderGeometry args={[b.r * 0.3, b.r, b.h, 5]} />
            <meshStandardMaterial color="#1c2b17" emissive="#6fae5b" emissiveIntensity={0.25} roughness={0.9} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -3.4, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a1409" roughness={1} />
      </mesh>
      <pointLight position={[0, 2, 3]} color="#9fe08a" intensity={1.1} distance={16} />
      <hemisphereLight args={["#3d5c33", "#050a04", 0.6]} />
    </group>
  );
}

function AlfheimScene({ mobile }) {
  const orbsRef = useRef();
  const count = mobile ? 10 : 18;
  const orbs = useMemo(
    () =>
      new Array(count).fill(0).map(() => ({
        radius: 3 + Math.random() * 5,
        speed: 0.1 + Math.random() * 0.25,
        offset: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 4,
        scale: 0.06 + Math.random() * 0.1,
      })),
    [count]
  );

  useFrame((state) => {
    if (!orbsRef.current) return;
    orbsRef.current.children.forEach((mesh, i) => {
      const o = orbs[i];
      const t = state.clock.elapsedTime * o.speed + o.offset;
      mesh.position.set(Math.cos(t) * o.radius, o.y + Math.sin(t * 1.4) * 0.6, Math.sin(t) * o.radius - 3);
    });
  });

  return (
    <group>
      <group ref={orbsRef}>
        {orbs.map((o, i) => (
          <mesh key={i} scale={o.scale}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color="#fce9c9" emissive="#cdd9ff" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[0.3, 0.5, 0]} position={[0, 0.5, -5]}>
        <icosahedronGeometry args={[3.2, 1]} />
        <meshPhysicalMaterial
          color="#dfe8ff"
          transmission={0.9}
          thickness={1.2}
          roughness={0.15}
          metalness={0}
          transparent
          opacity={0.35}
        />
      </mesh>
      <pointLight position={[0, 2, 2]} color="#e9f0ff" intensity={1.6} distance={18} />
    </group>
  );
}

function MidgardScene({ mobile }) {
  const mountains = useMemo(
    () =>
      new Array(mobile ? 5 : 8).fill(0).map((_, i) => ({
        x: (i - (mobile ? 2 : 3.5)) * 3.2 + (Math.random() - 0.5),
        h: 3 + Math.random() * 4,
        z: -8 - Math.random() * 6,
        w: 2.4 + Math.random() * 1.6,
      })),
    [mobile]
  );

  return (
    <group>
      <FlowingGround colorA="#0c1a1f" colorB="#1c3a3f" colorC="#3a5a55" y={-2.8} size={36} />
      {mountains.map((m, i) => (
        <mesh key={i} position={[m.x, m.h / 2 - 2.8, m.z]}>
          <coneGeometry args={[m.w, m.h, 4]} />
          <meshStandardMaterial color="#141c1a" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 4, -12]}>
        <planeGeometry args={[24, 6]} />
        <meshBasicMaterial color="#5c7a6b" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>
      <directionalLight position={[4, 6, 2]} color="#9fb6c9" intensity={0.8} />
      <ambientLight color="#2a3a34" intensity={0.4} />
    </group>
  );
}

function JotunheimScene({ mobile }) {
  const peaks = useMemo(
    () =>
      new Array(mobile ? 4 : 6).fill(0).map((_, i) => ({
        x: (i - (mobile ? 1.5 : 2.5)) * 5 + (Math.random() - 0.5) * 2,
        h: 14 + Math.random() * 16,
        z: -10 - Math.random() * 14,
        w: 4 + Math.random() * 3,
      })),
    [mobile]
  );
  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2 - 5, p.z]}>
          <coneGeometry args={[p.w, p.h, 5]} />
          <meshStandardMaterial color="#0f1417" roughness={1} />
        </mesh>
      ))}
      {/* a single much nearer, oversized cliff face to sell scale */}
      <mesh position={[3.5, -2, -3]} rotation={[0, 0.4, 0]}>
        <coneGeometry args={[3, 22, 4]} />
        <meshStandardMaterial color="#1a2226" roughness={1} />
      </mesh>
      <fogExp2 attach="fog" args={["#0b0d10", 0.06]} />
      <directionalLight position={[-3, 5, 4]} color="#89a0ad" intensity={0.5} />
      <ambientLight color="#232b30" intensity={0.5} />
    </group>
  );
}

function SvartalfheimScene({ mobile }) {
  const forgeRef = useRef();
  const rocks = useMemo(
    () =>
      new Array(mobile ? 8 : 14).fill(0).map(() => ({
        pos: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, -3 - Math.random() * 10],
        scale: 0.6 + Math.random() * 1.6,
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      })),
    [mobile]
  );

  useFrame((state) => {
    if (forgeRef.current) {
      forgeRef.current.intensity = 2.4 + Math.sin(state.clock.elapsedTime * 8) * 0.5 + Math.random() * 0.3;
    }
  });

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={r.rot} scale={r.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#1a120c" roughness={1} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, -2, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 24]} />
        <meshStandardMaterial color="#ff5a2e" emissive="#ff5a2e" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      <pointLight ref={forgeRef} position={[0, -1.4, -1]} color="#ff7a3a" intensity={2.5} distance={14} />
    </group>
  );
}

function MuspelheimScene({ mobile }) {
  return (
    <group>
      <FlowingGround colorA="#2a0a02" colorB="#ff5a2e" colorC="#ffe3c2" y={-2.6} size={36} />
      <mesh position={[0, 3, -14]} scale={mobile ? 0.7 : 1}>
        <coneGeometry args={[5, 18, 6]} />
        <meshStandardMaterial color="#0d0402" roughness={1} />
      </mesh>
      <pointLight position={[0, -1, 2]} color="#ff5a2e" intensity={2} distance={16} />
      <ambientLight color="#3a1206" intensity={0.5} />
    </group>
  );
}

function NiflheimScene() {
  const shards = useMemo(
    () =>
      new Array(6).fill(0).map(() => ({
        pos: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, -4 - Math.random() * 10],
        scale: [0.4 + Math.random() * 0.5, 1.4 + Math.random() * 2, 0.4 + Math.random() * 0.5],
        rot: [Math.random(), Math.random(), Math.random()],
      })),
    []
  );
  return (
    <group>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color="#cfe9f5" transmission={0.85} thickness={0.6} roughness={0.1} transparent opacity={0.5} />
        </mesh>
      ))}
      <fogExp2 attach="fog" args={["#070a0d", 0.11]} />
      <pointLight position={[0, 1, 2]} color="#7fb8d4" intensity={0.7} distance={12} />
      <ambientLight color="#1a2830" intensity={0.35} />
    </group>
  );
}

function HelScene({ mobile }) {
  const structures = useMemo(
    () =>
      new Array(mobile ? 3 : 5).fill(0).map((_, i) => ({
        x: (i - (mobile ? 1 : 2)) * 4,
        h: 8 + Math.random() * 8,
        z: -8 - Math.random() * 8,
      })),
    [mobile]
  );
  return (
    <group>
      {structures.map((s, i) => (
        <mesh key={i} position={[s.x, s.h / 2 - 4, s.z]}>
          <cylinderGeometry args={[0.6, 1, s.h, 5]} />
          <meshStandardMaterial color="#08080a" roughness={1} />
        </mesh>
      ))}
      <fogExp2 attach="fog" args={["#050506", 0.13]} />
      <pointLight position={[0, 1, 3]} color="#7a736e" intensity={0.5} distance={10} />
      <ambientLight color="#101012" intensity={0.25} />
    </group>
  );
}

const SIGNATURE_SCENES = {
  asgard: AsgardScene,
  vanaheim: VanaheimScene,
  alfheim: AlfheimScene,
  midgard: MidgardScene,
  jotunheim: JotunheimScene,
  svartalfheim: SvartalfheimScene,
  muspelheim: MuspelheimScene,
  niflheim: NiflheimScene,
  hel: HelScene,
};

function RealmScene({ realm, reducedMotion, mobile, scrollRef }) {
  const Signature = SIGNATURE_SCENES[realm.id] || AsgardScene;
  return (
    <>
      <color attach="background" args={[realm.colors.bg]} />
      <fog attach="fog" args={[realm.colors.bg, realm.field3d.fogNear, realm.field3d.fogFar]} />
      <ambientLight color={realm.colors.accent2} intensity={0.28} />
      <CameraRig realm={realm} reducedMotion={reducedMotion} scrollRef={scrollRef} />
      <Signature realm={realm} mobile={mobile} />
      <ParticleField config={realm.field3d} reducedMotion={reducedMotion} mobile={mobile} />
    </>
  );
}

function RealmAtmosphere({ realm, reducedMotion, mobile, scrollRef }) {
  return (
    <div className="realm-atmosphere-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.4 : 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, -1, 22], fov: mobile ? 62 : 52, near: 0.1, far: 80 }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <Suspense fallback={null}>
          <RealmScene realm={realm} reducedMotion={reducedMotion} mobile={mobile} scrollRef={scrollRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4. CUSTOM CURSOR
   ════════════════════════════════════════════════════════════════════ */

function CustomCursor({ disabled }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (disabled) return;
    let pos = { x: 0, y: 0 };
    let ring = { x: 0, y: 0 };
    let trail = { x: 0, y: 0 };

    function onMove(e) {
      pos = { x: e.clientX, y: e.clientY };
      const target = e.target;
      setInteractive(!!(target.closest && target.closest("[data-cursor='interactive']")));
    }
    window.addEventListener("mousemove", onMove);

    let raf;
    function loop() {
      ring.x += (pos.x - ring.x) * 0.22;
      ring.y += (pos.y - ring.y) * 0.22;
      trail.x += (pos.x - trail.x) * 0.09;
      trail.y += (pos.y - trail.y) * 0.09;
      if (dotRef.current) dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
      if (trailRef.current) trailRef.current.style.transform = `translate(${trail.x}px, ${trail.y}px)`;
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <>
      <div ref={trailRef} className={`cx-trail ${interactive ? "cx-active" : ""}`} />
      <div ref={ringRef} className={`cx-ring ${interactive ? "cx-active" : ""}`} />
      <div ref={dotRef} className="cx-dot" />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5. YGGDRASIL NAVIGATOR
   ════════════════════════════════════════════════════════════════════ */

function YggdrasilNavigator({ currentId, onNavigate, mobile }) {
  return (
    <nav className={`ygg-nav ${mobile ? "ygg-nav--mobile" : ""}`} aria-label="Yggdrasil realm navigator">
      {!mobile && <div className="ygg-label">YGGDRASIL</div>}
      <ol className="ygg-list">
        {ORDER.map((id) => {
          const r = REALMS[id];
          const active = id === currentId;
          return (
            <li key={id}>
              <button
                type="button"
                data-cursor="interactive"
                className={`ygg-node ${active ? "ygg-node--active" : ""}`}
                style={{ "--node-color": r.colors.accent }}
                onClick={() => onNavigate(id)}
                aria-current={active ? "true" : undefined}
                aria-label={`Travel to ${r.name}`}
              >
                <span className="ygg-dot" />
                {!mobile && <span className="ygg-name">{r.name}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════════════════
   6. PROGRESSIVE DISCLOSURE ACCORDION
   ════════════════════════════════════════════════════════════════════ */

function Disclosure({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelRef = useRef(null);

  return (
    <div className={`disclosure ${open ? "disclosure--open" : ""}`}>
      <button
        type="button"
        className="disclosure-trigger"
        data-cursor="interactive"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="disclosure-icon">{open ? "−" : "+"}</span>
        <span>{label}</span>
      </button>
      <div
        className="disclosure-panel"
        ref={panelRef}
        style={{ maxHeight: open ? panelRef.current?.scrollHeight ?? 999 : 0 }}
      >
        <div className="disclosure-inner">{children}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   7. MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */

export default function RealmExperience({ realmId: realmIdProp, onNavigateRealm, onNavigateGod, onReturnHome }) {
  const urlRealmId = useRealmIdFromLocation();
  const [internalId, setInternalId] = useState(realmIdProp || urlRealmId || "asgard");
  const [transitioning, setTransitioning] = useState(false);
  const [heroPhase, setHeroPhase] = useState(0);
  const [atmosphereOn, setAtmosphereOn] = useState(true);
  const scrollRef = useRef(0);
  const [expandedPlace, setExpandedPlace] = useState(null);
  const [hoveredInhabitant, setHoveredInhabitant] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);

  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (realmIdProp && REALMS[realmIdProp]) setInternalId(realmIdProp);
  }, [realmIdProp]);

  const realmId = REALMS[internalId] ? internalId : "asgard";
  const realm = REALMS[realmId];
  const orderIdx = ORDER.indexOf(realmId);
  const prevRealm = REALMS[ORDER[(orderIdx - 1 + ORDER.length) % ORDER.length]];
  const nextRealm = REALMS[ORDER[(orderIdx + 1) % ORDER.length]];

  // hero entrance sequence
  useEffect(() => {
    setHeroPhase(0);
    const steps = reducedMotion ? [0, 1, 6] : [0, 1, 2, 3, 4, 5, 6];
    const timers = steps.map((s, i) =>
      setTimeout(() => setHeroPhase(s), reducedMotion ? i * 120 : i * 190)
    );
    return () => timers.forEach(clearTimeout);
  }, [realmId, reducedMotion]);

  // scroll progress feeds the 3D camera rig via a ref (no re-renders per pixel)
  useEffect(() => {
    function onScroll() {
      const max = document.body.scrollHeight - window.innerHeight || 1;
      scrollRef.current = Math.max(0, Math.min(1, window.scrollY / max));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToRealm = useCallback(
    (id) => {
      if (!REALMS[id] || id === realmId) return;
      setTransitioning(true);
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      setTimeout(() => {
        setInternalId(id);
        if (onNavigateRealm) onNavigateRealm(id);
        else if (typeof window !== "undefined" && window.history?.pushState) {
          window.history.pushState({}, "", `/realm/${id}`);
        }
        setTimeout(() => setTransitioning(false), 60);
      }, reducedMotion ? 120 : 620);
    },
    [realmId, onNavigateRealm, reducedMotion]
  );

  const handleReturnHome = useCallback(() => {
    if (onReturnHome) onReturnHome();
  }, [onReturnHome]);

  const cssVars = useMemo(
    () => ({
      "--c-bg": realm.colors.bg,
      "--c-ink": realm.colors.ink,
      "--c-dim": realm.colors.dim,
      "--c-accent": realm.colors.accent,
      "--c-accent2": realm.colors.accent2,
      "--c-glow": realm.colors.glow,
    }),
    [realm]
  );

  return (
    <div
      className={`realm-root ${transitioning ? "realm-root--transitioning" : ""} ${reducedMotion ? "reduced-motion" : ""}`}
      style={cssVars}
    >
      <GlobalStyles />
      <FilmGrain />

      {atmosphereOn && (
        <RealmAtmosphere realm={realm} reducedMotion={reducedMotion} mobile={isMobile} scrollRef={scrollRef} />
      )}

      <CustomCursor disabled={isTouch || reducedMotion} />

      {/* ── PERSISTENT NAVIGATION ─────────────────────────────────── */}
      <header className="top-nav">
        <button type="button" className="brand" data-cursor="interactive" onClick={handleReturnHome}>
          <span className="brand-rune">ᛏ</span> RAGNARÖK
        </button>
        <div className="breadcrumb">
          NINE REALMS <span className="breadcrumb-sep">/</span> {realm.name}
        </div>
        <button type="button" className="return-link" data-cursor="interactive" onClick={handleReturnHome}>
          ← RETURN TO YGGDRASIL
        </button>
      </header>

      <YggdrasilNavigator currentId={realmId} onNavigate={goToRealm} mobile={isMobile} />

      <button
        type="button"
        className="atmosphere-toggle"
        data-cursor="interactive"
        onClick={() => setAtmosphereOn((a) => !a)}
        aria-pressed={atmosphereOn}
      >
        <span className={`atmosphere-dot ${atmosphereOn ? "on" : ""}`} />
        ATMOSPHERE: {atmosphereOn ? "ON" : "OFF"}
      </button>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="hero" aria-label={`${realm.name} — entrance`}>
        <div className="hero-vertical" aria-hidden="true">
          {realm.name.split("").map((ch, i) => (
            <span key={i} className={heroPhase >= 3 ? "letter-in" : "letter-out"} style={{ transitionDelay: `${i * 40}ms` }}>
              {ch}
            </span>
          ))}
        </div>

        <div className="hero-center">
          <div className={`hero-rune ${heroPhase >= 1 ? "reveal" : ""}`}>{realm.rune}</div>
          <h1 className={`hero-title ${heroPhase >= 3 ? "reveal" : ""}`}>
            {realm.name.split("").map((ch, i) => (
              <span key={i} style={{ transitionDelay: `${i * 35}ms` }}>
                {ch}
              </span>
            ))}
          </h1>
          <p className={`hero-kicker ${heroPhase >= 4 ? "reveal" : ""}`}>{realm.kicker}</p>
          <p className={`hero-line ${heroPhase >= 5 ? "reveal" : ""}`}>{realm.line}</p>
          <div className={`hero-scroll ${heroPhase >= 6 ? "reveal" : ""}`}>
            <span>↓</span> BEGIN EXPLORING
          </div>
        </div>

        <div className="hero-coords" aria-hidden="true">
          ARCHIVE {realm.index} <br /> {realm.facts.position}
        </div>
      </section>

      {/* ── IDENTITY PANEL ────────────────────────────────────────── */}
      <section className="identity">
        <div className="identity-number">{realm.index}</div>
        <div className="identity-body">
          <h2 className="identity-name">{realm.name}</h2>
          <div className="rule" />
          <p className="identity-kicker">{realm.kicker}</p>
          <p className="identity-desc">{realm.description}</p>
        </div>
        <div className="identity-frame" aria-hidden="true">
          <span className="frame-rune">{realm.rune}</span>
        </div>
      </section>

      {/* ── AT A GLANCE ───────────────────────────────────────────── */}
      <section className="glance">
        <p className="section-label">ᚠ ───── AT A GLANCE</p>
        <div className="glance-grid">
          <GlanceItem label="REALM TYPE" value={realm.facts.type} />
          <GlanceItem label="ASSOCIATED BEINGS" value={realm.facts.beings} />
          <GlanceItem label="KNOWN FOR" value={realm.facts.known} />
          <GlanceItem label="COSMIC POSITION" value={realm.facts.position} />
        </div>
      </section>

      {/* ── DISCOVER (progressive disclosure) ────────────────────── */}
      <section className="discover">
        <p className="section-label">DISCOVER</p>

        <Disclosure label="HISTORY & NATURE" defaultOpen>
          <p className="discover-summary">{realm.description}</p>
          {realm.lore && <p className="discover-lore">{realm.lore}</p>}
          {realm.artifacts && (
            <div className="discover-artifacts">
              <span className="artifacts-title">LEGENDARY RELICS & ARTIFACTS:</span>
              <div className="artifacts-tags">
                {realm.artifacts.map((art) => (
                  <span key={art} className="artifact-tag">
                    ✦ {art}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Disclosure>

        <Disclosure label="IMPORTANT PLACES">
          <div className="places-map">
            {realm.places.map((p) => (
              <button
                key={p.name}
                type="button"
                data-cursor="interactive"
                className={`place-node ${expandedPlace === p.name ? "place-node--active" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={() => setExpandedPlace(expandedPlace === p.name ? null : p.name)}
              >
                <span className="place-dot" />
                <span className="place-label">{p.name}</span>
              </button>
            ))}
            <span className="place-node place-node--you" style={{ left: "50%", top: "50%" }}>
              <span className="place-dot" /> YOU ARE HERE
            </span>
          </div>
          {expandedPlace && (
            <div className="place-detail">
              <h4>{expandedPlace}</h4>
              <p>{realm.places.find((p) => p.name === expandedPlace)?.desc}</p>
            </div>
          )}
        </Disclosure>

        <Disclosure label="INHABITANTS">
          <ul className="inhabitants-list">
            {realm.inhabitants.map((b) => (
              <li
                key={b.name}
                className={hoveredInhabitant === b.name ? "inhabitant--active" : ""}
                onMouseEnter={() => setHoveredInhabitant(b.name)}
                onMouseLeave={() => setHoveredInhabitant(null)}
              >
                <button
                  type="button"
                  data-cursor="interactive"
                  className="inhabitant-name"
                  onClick={() => onNavigateGod && onNavigateGod(b.name.toLowerCase().replace(/[^a-z]/g, ""))}
                >
                  {b.name}
                </button>
                <span className="inhabitant-role">{b.role}</span>
                {hoveredInhabitant === b.name && <p className="inhabitant-desc">{b.desc}</p>}
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure label="WHAT LIVES HERE">
          <div className="taxonomy">
            {["GODS", "GIANTS", "ELVES", "DWARVES", "HUMANS", "CREATURES", "THE DEAD"].map((cat) => (
              <span key={cat} className={`taxon ${realm.lives.includes(cat) ? "taxon--active" : "taxon--inactive"}`}>
                {cat}
              </span>
            ))}
          </div>
        </Disclosure>

        <Disclosure label="CONNECTIONS TO OTHER REALMS">
          <div className="connections">
            {realm.connections.map((c) => (
              <button
                key={c.to}
                type="button"
                data-cursor="interactive"
                className="connection-row"
                onMouseEnter={() => setHoveredConnection(c.to)}
                onMouseLeave={() => setHoveredConnection(null)}
                onClick={() => goToRealm(c.to.toLowerCase().replace(/[^a-z]/g, ""))}
              >
                <span className="connection-line" />
                <span className="connection-to">{c.to}</span>
                <span className="connection-label">{c.label}</span>
                {hoveredConnection === c.to && <span className="connection-desc">{c.desc}</span>}
              </button>
            ))}
          </div>
        </Disclosure>
      </section>

      {/* ── MYTHS ─────────────────────────────────────────────────── */}
      <section className="myths">
        <p className="section-label">MYTHS CONNECTED TO THIS REALM</p>
        <ol className="myth-list">
          {realm.myths.map((m, i) => (
            <li key={m.title} className="myth-item">
              <span className="myth-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="myth-body">
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
                <span className="myth-cta">READ THE SAGA →</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── SOURCES ───────────────────────────────────────────────── */}
      <section className="sources">
        <p className="sources-label">SOURCES</p>
        <p className="sources-list">POETIC EDDA · PROSE EDDA · OLD NORSE SAGAS</p>
        <p className="sources-note">
          Explore the traditions from which these stories survive. Where accounts differ across sources,
          this archive notes the variation rather than presenting one telling as settled fact.
        </p>
      </section>

      {/* ── NEXT / PREVIOUS ───────────────────────────────────────── */}
      <section className="realm-transition-cta">
        <button
          type="button"
          data-cursor="interactive"
          className="cta-side cta-prev"
          onClick={() => goToRealm(prevRealm.id)}
          style={{ "--preview-color": prevRealm.colors.accent }}
        >
          <span className="cta-label">PREVIOUS REALM</span>
          <span className="cta-arrow">←</span>
          <span className="cta-name">{prevRealm.name}</span>
        </button>

        <div className="cta-current">
          <span className="cta-current-rune">{realm.rune}</span>
          <span className="cta-current-name">{realm.name}</span>
        </div>

        <button
          type="button"
          data-cursor="interactive"
          className="cta-side cta-next"
          onClick={() => goToRealm(nextRealm.id)}
          style={{ "--preview-color": nextRealm.colors.accent }}
        >
          <span className="cta-label">NEXT REALM</span>
          <span className="cta-name">{nextRealm.name}</span>
          <span className="cta-arrow">→</span>
        </button>
      </section>

      {/* ── FINAL ─────────────────────────────────────────────────── */}
      <section className="finale">
        <p className="finale-kicker">YOU HAVE ENTERED</p>
        <h2 className="finale-name">{realm.name}</h2>
        <div className="finale-actions">
          <button type="button" data-cursor="interactive" className="finale-btn" onClick={handleReturnHome}>
            RETURN TO YGGDRASIL
          </button>
          <button
            type="button"
            data-cursor="interactive"
            className="finale-btn finale-btn--ghost"
            onClick={() => goToRealm(nextRealm.id)}
          >
            EXPLORE ANOTHER REALM
          </button>
        </div>
      </section>
    </div>
  );
}

function GlanceItem({ label, value }) {
  return (
    <div className="glance-item">
      <span className="glance-label">{label}</span>
      {Array.isArray(value) ? (
        <ul className="glance-value-list">
          {value.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      ) : (
        <span className="glance-value">{value}</span>
      )}
    </div>
  );
}

function FilmGrain() {
  return <div className="film-grain" aria-hidden="true" />;
}

/* ════════════════════════════════════════════════════════════════════
   8. GLOBAL STYLES
   ════════════════════════════════════════════════════════════════════ */

function GlobalStyles() {
  return (
    <style>{`
      .realm-root {
        --font-display: "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
        --font-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        --font-mono: "IBM Plex Mono", "SF Mono", monospace;
        position: relative;
        background: var(--c-bg);
        color: var(--c-ink);
        font-family: var(--font-body);
        overflow-x: hidden;
        min-height: 100vh;
        transition: background 900ms ease;
        cursor: none;
      }
      .realm-root.reduced-motion,
      .realm-root * { }
      @media (pointer: coarse) { .realm-root { cursor: auto; } }

      .realm-root * { box-sizing: border-box; }

      .realm-root--transitioning { animation: veil-out 620ms ease forwards; }
      @keyframes veil-out { to { filter: brightness(0); } }

      .realm-atmosphere-wrap {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        transition: opacity 900ms ease;
      }
      .realm-atmosphere-wrap canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
      .realm-root--transitioning .realm-atmosphere-wrap { opacity: 0; }

      .film-grain {
        position: fixed;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        opacity: 0.05;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      }

      /* cursor */
      .cx-dot, .cx-ring, .cx-trail {
        position: fixed; top: 0; left: 0; pointer-events: none; z-index: 999;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      .cx-dot { width: 6px; height: 6px; background: var(--c-accent); margin-left: -3px; margin-top: -3px; }
      .cx-ring { width: 28px; height: 28px; border: 1px solid var(--c-accent); margin-left: -14px; margin-top: -14px; transition: width 200ms, height 200ms; }
      .cx-trail { width: 46px; height: 46px; border: 1px solid rgba(255,255,255,0.15); margin-left: -23px; margin-top: -23px; }
      .cx-ring.cx-active { width: 46px; height: 46px; margin-left: -23px; margin-top: -23px; border-color: var(--c-ink); }
      @media (pointer: coarse) { .cx-dot, .cx-ring, .cx-trail { display: none; } }

      /* top nav */
      .top-nav {
        position: fixed; top: 0; left: 0; right: 0; z-index: 40;
        display: flex; align-items: center; justify-content: space-between;
        padding: 1.6rem 2.2rem;
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        mix-blend-mode: difference;
        color: #fff;
      }
      .brand, .return-link {
        background: none; border: none; color: inherit; font: inherit; letter-spacing: inherit;
        cursor: none; padding: 0.4rem;
      }
      .brand-rune { color: var(--c-accent); margin-right: 0.3em; }
      .breadcrumb { opacity: 0.75; }
      .breadcrumb-sep { opacity: 0.4; margin: 0 0.4em; }
      @media (max-width: 720px) { .breadcrumb { display: none; } .top-nav { padding: 1.1rem 1.2rem; } }

      /* yggdrasil nav */
      .ygg-nav {
        position: fixed; right: 1.6rem; top: 50%; transform: translateY(-50%);
        z-index: 35; display: flex; flex-direction: column; align-items: flex-end; gap: 0.6rem;
      }
      .ygg-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.2em; opacity: 0.4; margin-bottom: 0.4rem; }
      .ygg-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; position: relative; }
      .ygg-list::before {
        content: ""; position: absolute; right: 4px; top: 4px; bottom: 4px; width: 1px;
        background: rgba(255,255,255,0.12);
      }
      .ygg-node {
        display: flex; align-items: center; gap: 0.5rem; background: none; border: none; cursor: none;
        font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.4);
        padding: 0.15rem 0; transition: color 220ms;
      }
      .ygg-node:hover, .ygg-node--active { color: var(--c-ink); }
      .ygg-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); flex-shrink: 0; transition: all 220ms; }
      .ygg-node--active .ygg-dot { background: var(--node-color); box-shadow: 0 0 10px var(--node-color); width: 8px; height: 8px; }
      @media (max-width: 860px) {
        .ygg-nav--mobile {
          position: fixed; right: 0; left: 0; top: auto; bottom: 0; transform: none;
          flex-direction: row; justify-content: center; padding: 0.7rem 0.5rem;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(10px);
        }
        .ygg-nav--mobile .ygg-list { flex-direction: row; gap: 0.9rem; }
        .ygg-nav--mobile .ygg-list::before { display: none; }
      }

      .atmosphere-toggle {
        position: fixed; left: 1.6rem; bottom: 1.4rem; z-index: 35;
        background: none; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6);
        font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em;
        padding: 0.5rem 0.8rem; border-radius: 999px; display: flex; align-items: center; gap: 0.5rem;
        cursor: none;
      }
      .atmosphere-dot { width: 6px; height: 6px; border-radius: 50%; background: #555; }
      .atmosphere-dot.on { background: var(--c-accent); box-shadow: 0 0 8px var(--c-accent); }
      @media (max-width: 860px) { .atmosphere-toggle { left: 1rem; bottom: 4.4rem; } }

      /* hero */
      .hero {
        position: relative; z-index: 5; min-height: 100vh; display: flex; align-items: center; justify-content: center;
        padding: 6rem 2rem;
      }
      .hero-vertical {
        position: absolute; left: 2.4rem; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column; font-family: var(--font-display);
        font-size: 1.6rem; letter-spacing: 0.05em; opacity: 0.35;
      }
      .hero-vertical .letter-out { opacity: 0; transform: translateY(6px); }
      .hero-vertical .letter-in { opacity: 1; transform: translateY(0); transition: all 500ms ease; }
      @media (max-width: 860px) { .hero-vertical { display: none; } }

      .hero-center { text-align: center; max-width: 760px; }
      .hero-rune { font-size: 2rem; color: var(--c-accent); opacity: 0; transform: scale(0.6); transition: all 700ms ease; }
      .hero-rune.reveal { opacity: 1; transform: scale(1); }
      .hero-title { font-family: var(--font-display); font-weight: 500; font-size: clamp(3rem, 11vw, 8rem); line-height: 0.95; margin: 0.3em 0; letter-spacing: 0.02em; }
      .hero-title span { display: inline-block; opacity: 0; transform: translateY(0.4em); transition: all 560ms cubic-bezier(.2,.8,.2,1); }
      .hero-title.reveal span { opacity: 1; transform: translateY(0); }
      .hero-kicker { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.28em; color: var(--c-accent); opacity: 0; transform: translateY(8px); transition: all 500ms ease; }
      .hero-kicker.reveal { opacity: 1; transform: translateY(0); }
      .hero-line { margin-top: 0.8rem; color: var(--c-dim); font-size: 0.95rem; opacity: 0; transition: opacity 600ms ease; }
      .hero-line.reveal { opacity: 1; }
      .hero-scroll { margin-top: 3rem; font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.2em; opacity: 0; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; transition: opacity 700ms ease; }
      .hero-scroll span { animation: bob 2.4s ease-in-out infinite; }
      .hero-scroll.reveal { opacity: 0.7; }
      @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
      .hero-coords {
        position: absolute; right: 2.2rem; bottom: 2.2rem; text-align: right;
        font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.14em; color: var(--c-dim);
      }
      @media (max-width: 720px) { .hero-coords { display: none; } }

      /* identity */
      .identity {
        position: relative; z-index: 5; display: grid; grid-template-columns: 120px 1fr 220px;
        gap: 2rem; padding: 8rem 2.4rem 6rem; align-items: start; max-width: 1400px; margin: 0 auto;
      }
      .identity-number { font-family: var(--font-mono); font-size: 5rem; opacity: 0.15; line-height: 1; }
      .identity-name { font-family: var(--font-display); font-size: clamp(2.4rem, 5vw, 4.2rem); margin: 0; letter-spacing: 0.01em; }
      .rule { height: 1px; background: linear-gradient(90deg, var(--c-accent), transparent); margin: 1rem 0 1.4rem; width: 60%; }
      .identity-kicker { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.2em; color: var(--c-accent); margin: 0 0 1.2rem; }
      .identity-desc { max-width: 60ch; line-height: 1.75; color: var(--c-ink); opacity: 0.85; font-size: 1.02rem; }
      .identity-frame { display: flex; align-items: center; justify-content: center; height: 220px; border: 1px solid rgba(255,255,255,0.1); position: relative; }
      .identity-frame::before, .identity-frame::after { content: ""; position: absolute; width: 14px; height: 14px; border: 1px solid var(--c-accent); }
      .identity-frame::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
      .identity-frame::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }
      .frame-rune { font-size: 3rem; color: var(--c-accent); opacity: 0.8; }
      @media (max-width: 900px) { .identity { grid-template-columns: 1fr; } .identity-frame { display: none; } }

      /* glance */
      .glance { position: relative; z-index: 5; padding: 2rem 2.4rem 6rem; max-width: 1400px; margin: 0 auto; }
      .section-label { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.18em; color: var(--c-dim); margin-bottom: 2rem; }
      .glance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid rgba(255,255,255,0.1); }
      .glance-item { padding: 1.6rem 1.6rem 1.6rem 0; border-right: 1px solid rgba(255,255,255,0.1); }
      .glance-item:last-child { border-right: none; }
      .glance-label { display: block; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--c-dim); margin-bottom: 0.7rem; }
      .glance-value { font-family: var(--font-display); font-size: 1.6rem; }
      .glance-value-list { list-style: none; margin: 0; padding: 0; font-family: var(--font-display); font-size: 1.15rem; line-height: 1.6; }
      @media (max-width: 860px) { .glance-grid { grid-template-columns: 1fr 1fr; } .glance-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1.2rem 0; } }

      /* discover */
      .discover { position: relative; z-index: 5; padding: 2rem 2.4rem 6rem; max-width: 1000px; margin: 0 auto; }
      .disclosure { border-bottom: 1px solid rgba(255,255,255,0.1); }
      .disclosure-trigger {
        width: 100%; display: flex; align-items: center; gap: 1rem; background: none; border: none; color: var(--c-ink);
        font-family: var(--font-display); font-size: 1.3rem; padding: 1.3rem 0; cursor: none; text-align: left;
      }
      .disclosure-icon { color: var(--c-accent); font-family: var(--font-mono); width: 1.2em; }
      .disclosure-panel { overflow: hidden; transition: max-height 480ms ease; }
      .disclosure-inner { padding-bottom: 1.6rem; color: var(--c-ink); opacity: 0.85; line-height: 1.7; }
      .discover-summary { margin-top: 0; margin-bottom: 0.8rem; }
      .discover-lore { opacity: 0.9; font-style: italic; border-left: 2px solid var(--c-accent); padding-left: 1rem; margin: 1rem 0; }
      .discover-artifacts { margin-top: 1.2rem; }
      .artifacts-title { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.14em; color: var(--c-dim); display: block; margin-bottom: 0.6rem; }
      .artifacts-tags { display: flex; flex-wrap: wrap; gap: 0.6rem; }
      .artifact-tag { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.08em; padding: 0.3rem 0.7rem; background: rgba(255,255,255,0.04); border: 1px dashed var(--c-accent); color: var(--c-accent); border-radius: 4px; }

      .places-map { position: relative; height: 340px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1rem; }
      .place-node { position: absolute; transform: translate(-50%, -50%); background: none; border: none; color: var(--c-ink);
        display: flex; flex-direction: column; align-items: center; gap: 0.4rem; cursor: none; }
      .place-dot { width: 8px; height: 8px; border-radius: 50%; border: 1px solid var(--c-accent); }
      .place-node--active .place-dot, .place-node:hover .place-dot { background: var(--c-accent); box-shadow: 0 0 10px var(--c-accent); }
      .place-label { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em; white-space: nowrap; }
      .place-node--you { opacity: 0.5; font-family: var(--font-mono); font-size: 0.58rem; }
      .place-detail { padding: 1rem; border-left: 2px solid var(--c-accent); background: rgba(255,255,255,0.02); }
      .place-detail h4 { margin: 0 0 0.5rem; font-family: var(--font-display); font-size: 1.2rem; }

      .inhabitants-list { list-style: none; margin: 0; padding: 0; }
      .inhabitants-list li { padding: 0.9rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); transition: opacity 260ms; }
      .inhabitant-name { background: none; border: none; color: var(--c-ink); font-family: var(--font-display); font-size: 1.9rem; cursor: none; padding: 0; }
      .inhabitant-role { margin-left: 1rem; font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--c-dim); }
      .inhabitant--active .inhabitant-name { color: var(--c-accent); }
      .inhabitant-desc { margin: 0.5rem 0 0; opacity: 0.8; max-width: 60ch; }

      .taxonomy { display: flex; flex-wrap: wrap; gap: 0.7rem; }
      .taxon { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.1em; padding: 0.5rem 0.9rem; border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; }
      .taxon--active { border-color: var(--c-accent); color: var(--c-accent); }
      .taxon--inactive { opacity: 0.25; }

      .connections { display: flex; flex-direction: column; }
      .connection-row { position: relative; display: grid; grid-template-columns: 24px 140px 1fr; align-items: center; gap: 1rem;
        background: none; border: none; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 1rem 0; cursor: none; text-align: left; color: var(--c-ink); }
      .connection-line { width: 20px; height: 1px; background: var(--c-accent); }
      .connection-to { font-family: var(--font-display); font-size: 1.1rem; }
      .connection-label { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.08em; color: var(--c-dim); }
      .connection-desc { grid-column: 1 / -1; font-size: 0.9rem; opacity: 0.75; margin-top: 0.4rem; }

      /* myths */
      .myths { position: relative; z-index: 5; padding: 2rem 2.4rem 6rem; max-width: 1000px; margin: 0 auto; }
      .myth-list { list-style: none; margin: 0; padding: 0; }
      .myth-item { display: grid; grid-template-columns: 80px 1fr; gap: 1.4rem; padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.08); }
      .myth-index { font-family: var(--font-mono); font-size: 0.8rem; color: var(--c-accent); }
      .myth-body h4 { margin: 0 0 0.6rem; font-family: var(--font-display); font-size: 1.8rem; }
      .myth-body p { margin: 0 0 0.8rem; opacity: 0.8; max-width: 60ch; line-height: 1.7; }
      .myth-cta { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; color: var(--c-accent); }

      /* sources */
      .sources { position: relative; z-index: 5; padding: 3rem 2.4rem; max-width: 700px; margin: 0 auto; text-align: center; opacity: 0.6; }
      .sources-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.2em; margin-bottom: 0.6rem; }
      .sources-list { font-family: var(--font-display); font-size: 1rem; margin-bottom: 0.8rem; }
      .sources-note { font-size: 0.82rem; line-height: 1.6; }

      /* next/prev cta */
      .realm-transition-cta {
        position: relative; z-index: 5; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
        padding: 5rem 2.4rem; max-width: 1400px; margin: 0 auto; gap: 1rem;
      }
      .cta-side { background: none; border: none; color: var(--c-ink); cursor: none; display: flex; flex-direction: column; gap: 0.4rem; }
      .cta-prev { align-items: flex-start; }
      .cta-next { align-items: flex-end; text-align: right; }
      .cta-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; color: var(--c-dim); }
      .cta-name { font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 3rem); transition: color 260ms; }
      .cta-side:hover .cta-name { color: var(--preview-color); }
      .cta-arrow { font-size: 1.3rem; color: var(--c-accent); }
      .cta-current { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
      .cta-current-rune { font-size: 1.4rem; color: var(--c-accent); }
      .cta-current-name { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.2em; opacity: 0.6; }
      @media (max-width: 720px) { .realm-transition-cta { grid-template-columns: 1fr; text-align: center; } .cta-prev, .cta-next { align-items: center; text-align: center; } }

      /* finale */
      .finale { position: relative; z-index: 5; min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1.2rem; padding: 4rem 2rem; }
      .finale-kicker { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.24em; color: var(--c-dim); }
      .finale-name { font-family: var(--font-display); font-size: clamp(2.6rem, 8vw, 5.5rem); margin: 0; }
      .finale-actions { display: flex; gap: 1rem; margin-top: 1.6rem; flex-wrap: wrap; justify-content: center; }
      .finale-btn { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.12em; padding: 0.9rem 1.6rem; background: var(--c-accent); color: #0a0a0a; border: none; cursor: none; }
      .finale-btn--ghost { background: none; border: 1px solid var(--c-accent); color: var(--c-ink); }

      /* focus visibility for accessibility */
      .realm-root button:focus-visible {
        outline: 2px solid var(--c-accent);
        outline-offset: 3px;
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-title span, .hero-rune, .hero-kicker, .hero-line, .hero-scroll { transition: none !important; }
      }
    `}</style>
  );
}
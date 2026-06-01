export const SHAPES = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "pentagon",
  "hexagon",
  "vertical",
  "horizontal",
  "plus",
  "xshape"
];

export const COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#F59E0B",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#65A30D",
  "#EA580C",
  "#0F172A"
];

/** Tüm çalıştırmalarda aynı hedef rengi (deterministik test). */
export const FIXED_TARGET_COLOR = COLORS[0];

/** Dosyalar: public/distractors/ — yoksa img onError ile gizlenir */
export const GIF_FILES = {
  top: { name: "Top", gif: "/distractors/top.gif", sound: "/distractors/top.mp3", size: 235 },
  kosan: { name: "Koşan İnsan", gif: "/distractors/kosan.gif", sound: "/distractors/kosan.mp3", size: 235 },
  kedi: { name: "Kedi", gif: "/distractors/kedi.gif", sound: "/distractors/kedi.mp3", size: 230 },
  araba: { name: "Araba", gif: "/distractors/araba.gif", sound: "/distractors/araba.mp3", size: 240 },
  agac: { name: "Ağaç", gif: "/distractors/agac.gif", sound: "/distractors/agac.mp3", size: 235 },
  arabakorna: { name: "Araba Korna", gif: "/distractors/arabakorna.gif", sound: "/distractors/arabakorna.mp3", size: 240 },
  asansor: { name: "Asansör", gif: "/distractors/asansor.gif", sound: "/distractors/asansor.mp3", size: 235 },
  camtemizlik: {
    name: "Cam Temizliği",
    gif: "/distractors/camtemizlik.gif",
    sound: "/distractors/camtemizlik.mp3",
    size: 240
  },
  kapi: { name: "Kapı", gif: "/distractors/kapi.gif", sound: "/distractors/kapi.mp3", size: 235 },
  motorsiklet: {
    name: "Motorsiklet",
    gif: "/distractors/motorsiklet.gif",
    sound: "/distractors/motorsiklet.mp3",
    size: 240
  },
  televizyon: {
    name: "Televizyon",
    gif: "/distractors/televizyon.gif",
    sound: "/distractors/televizyon.mp3",
    size: 240
  }
};

export const INDEPENDENT_SOUNDS = {
  alarm: "/distractors/alarm.mp3",
  cekic: "/distractors/cekic.mp3",
  gemi: "/distractors/gemi.mp3",
  sudamlasi: "/distractors/sudamlasi.mp3",
  kussesi: "/distractors/kussesi.mp3",
  hilti: "/distractors/hilti.mp3",
  tren: "/distractors/tren.mp3",
  matkap: "/distractors/matkap.mp3",
  insan: "/distractors/insan.mp3",
  testere: "/distractors/testere.mp3"
};

/** Deterministik çeldirici sırası (sabit dizi — test her koşuda aynı). */
export const DISTRACTOR_GIF_KEYS = [
  "top",
  "kosan",
  "kedi",
  "araba",
  "agac",
  "arabakorna",
  "asansor",
  "camtemizlik",
  "kapi",
  "motorsiklet",
  "televizyon"
];

export const DISTRACTOR_SOUND_KEYS = [
  "alarm",
  "cekic",
  "gemi",
  "sudamlasi",
  "kussesi",
  "hilti",
  "tren",
  "matkap",
  "insan",
  "testere"
];

/** Sesli gif penceresinde dönen gifler */
export const DISTRACTOR_SOUND_GIF_KEYS = DISTRACTOR_GIF_KEYS;

/** Ekranda sabit durmaz; çıktığı yönden karşı tarafa kayar */
export const MOVING_GIF_KEYS = new Set(["araba", "kedi", "kosan", "motorsiklet", "arabakorna"]);

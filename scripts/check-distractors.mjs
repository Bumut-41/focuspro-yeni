/**
 * public/distractors/ içinde gerekli dosyalar var mı kontrol eder.
 * Kullanım: npm run check-distractors
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public", "distractors");

const GIF_KEYS = [
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

const SOUND_KEYS = [
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

const REQUIRED = [
  ...GIF_KEYS.flatMap((k) => [`${k}.gif`, `${k}.mp3`]),
  ...SOUND_KEYS.map((k) => `${k}.mp3`)
];

const missing = REQUIRED.filter((f) => !existsSync(join(ROOT, f)));
const ok = REQUIRED.length - missing.length;

console.log(`\nÇeldirici klasörü: ${ROOT}\n`);
if (!missing.length) {
  console.log(`Tamam: ${REQUIRED.length}/${REQUIRED.length} dosya mevcut (11 gif + 10 bağımsız ses).\n`);
  process.exit(0);
}

console.log(`Durum: ${ok}/${REQUIRED.length} dosya var, ${missing.length} eksik.\n`);
console.log("Eksik dosyalar:");
missing.forEach((f) => console.log(`  - ${f}`));
console.log("\nListe: public/distractors/DOSYA_LISTESI.txt\n");
process.exit(1);

/**
 * Yaş grubuna göre normatif referans (ortalama / SS).
 * Güncellenebilir sabit tablo — klinik norm veri seti entegre edildiğinde buradan beslenir.
 */

const PHASE_KEYS = ["temel1", "gorsel1", "gorsel2", "isitsel1", "isitsel2", "kombine1", "kombine2", "temel2"];

function phaseNorm(att, tim, imp, hyp) {
  return {
    attention: { mean: att[0], sd: att[1] },
    timing: { mean: tim[0], sd: tim[1] },
    impulsivity: { mean: imp[0], sd: imp[1] },
    hyperactivity: { mean: hyp[0], sd: hyp[1] }
  };
}

/** phaseKey -> indeks -> { mean, sd } */
const BY_PROFILE = {
  child: {
    global: phaseNorm([90, 8], [70, 10], [88, 9], [92, 7]),
    temel1: phaseNorm([92, 7], [72, 9], [90, 8], [94, 6]),
    gorsel1: phaseNorm([90, 8], [68, 10], [85, 10], [91, 7]),
    gorsel2: phaseNorm([88, 9], [65, 11], [82, 11], [90, 8]),
    isitsel1: phaseNorm([89, 8], [66, 10], [84, 10], [91, 7]),
    isitsel2: phaseNorm([87, 9], [64, 11], [80, 11], [89, 8]),
    kombine1: phaseNorm([86, 9], [62, 11], [78, 12], [88, 8]),
    kombine2: phaseNorm([84, 10], [60, 12], [75, 12], [86, 9]),
    temel2: phaseNorm([88, 9], [68, 10], [83, 11], [90, 8])
  },
  teen: {
    global: phaseNorm([91, 7], [74, 9], [90, 8], [93, 6]),
    temel1: phaseNorm([93, 7], [76, 9], [92, 7], [95, 6]),
    gorsel1: phaseNorm([90, 8], [72, 10], [88, 9], [92, 7]),
    gorsel2: phaseNorm([89, 8], [70, 10], [86, 10], [91, 7]),
    isitsel1: phaseNorm([88, 9], [69, 10], [85, 10], [90, 8]),
    isitsel2: phaseNorm([87, 9], [68, 11], [83, 11], [89, 8]),
    kombine1: phaseNorm([85, 9], [66, 11], [80, 12], [88, 8]),
    kombine2: phaseNorm([84, 10], [64, 11], [78, 12], [87, 9]),
    temel2: phaseNorm([89, 8], [71, 10], [84, 11], [91, 7])
  },
  adult: {
    global: phaseNorm([92, 6], [78, 8], [91, 7], [94, 5]),
    temel1: phaseNorm([94, 6], [80, 8], [93, 6], [96, 5]),
    gorsel1: phaseNorm([91, 7], [76, 9], [90, 8], [93, 6]),
    gorsel2: phaseNorm([90, 7], [74, 9], [88, 8], [92, 7]),
    isitsel1: phaseNorm([89, 8], [73, 9], [87, 9], [91, 7]),
    isitsel2: phaseNorm([88, 8], [72, 10], [85, 10], [90, 8]),
    kombine1: phaseNorm([87, 8], [70, 10], [83, 11], [89, 8]),
    kombine2: phaseNorm([85, 9], [68, 10], [80, 12], [88, 9]),
    temel2: phaseNorm([90, 7], [75, 9], [86, 10], [92, 7])
  }
};

export function normStats(profileKey, phaseKey, indexKey) {
  const p = BY_PROFILE[profileKey] ?? BY_PROFILE.adult;
  const phase = phaseKey === "global" ? p.global : p[phaseKey] ?? p.global;
  return phase[indexKey] ?? phase.attention;
}

export function normZScore(score, profileKey, phaseKey, indexKey) {
  const { mean, sd } = normStats(profileKey, phaseKey, indexKey);
  if (!sd) return 0;
  return Number(((score - mean) / sd).toFixed(2));
}

/** MOXO tarzı performans düzeyi (z-puanına göre) */
export function normLevelFromZ(z) {
  if (z >= 0.75) return 1;
  if (z >= -0.5) return 2;
  if (z >= -1.25) return 3;
  return 4;
}

export function normLevelTextFromZ(z) {
  const l = normLevelFromZ(z);
  if (l === 1) return "İyi Performans";
  if (l === 2) return "Standart Performans";
  if (l === 3) return "Düşük Performans";
  return "Performansta Zorluk";
}

export function normBand(profileKey, phaseKey, indexKey) {
  const { mean, sd } = normStats(profileKey, phaseKey, indexKey);
  return {
    mean: Math.round(mean),
    low: Math.max(0, Math.round(mean - sd)),
    high: Math.min(100, Math.round(mean + sd))
  };
}

export { PHASE_KEYS };

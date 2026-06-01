/** Test süresini dakika:saniye.s formatında gösterir (örn. 2:34.5). */
export function formatTestMs(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  const totalSec = Math.max(0, ms) / 1000;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec - min * 60;
  return `${min}:${sec.toFixed(1).padStart(min > 0 ? 4 : 3, "0")}`;
}

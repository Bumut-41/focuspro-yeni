export function includesText(query, ...values) {
  const needle = String(query || "").trim().toLocaleLowerCase("tr");
  if (!needle) return true;
  return values.some((value) => String(value || "").toLocaleLowerCase("tr").includes(needle));
}

export function inDateRange(iso, from, to) {
  if (!from && !to) return true;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  if (from) {
    const [year, month, day] = from.split("-").map(Number);
    if (time < new Date(year, month - 1, day, 0, 0, 0, 0).getTime()) return false;
  }
  if (to) {
    const [year, month, day] = to.split("-").map(Number);
    if (time > new Date(year, month - 1, day, 23, 59, 59, 999).getTime()) return false;
  }
  return true;
}

export function likeTerm(value) {
  return String(value || "").trim().replace(/[%_,.()\\]/g, "");
}

export function dayStartIso(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

export function dayEndIso(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

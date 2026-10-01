export function isStaleChunkError(error) {
  const message = String(error?.message || error?.payload?.message || error || "");
  return /dynamically imported module|Importing a module script failed/i.test(message);
}

/** Yeni yayından sonra eski pdfmake paketi 404 olursa sayfayı bir kez yeniler. */
export function reloadStaleChunk(error) {
  if (error && !isStaleChunkError(error)) return false;
  const key = "fp-chunk-reload-at";
  const last = Number(sessionStorage.getItem(key) || 0);
  if (Date.now() - last < 20000) return false;
  sessionStorage.setItem(key, String(Date.now()));
  window.location.reload();
  return true;
}

/** Tarayıcıda blob indirmesini güvenilir şekilde tetikler. */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 250);
}

/** Signed URL'den PDF indirir (yeni sekme / popup engeline takılmaz). */
export async function downloadPdfFromUrl(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PDF download failed (${res.status})`);
  const blob = await res.blob();
  if (!blob.size) throw new Error("PDF file is empty");
  triggerBlobDownload(blob, filename);
}

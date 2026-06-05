let pdfMakePromise;

function resolvePdfVfs(fontsModule) {
  const fonts = fontsModule?.default ?? fontsModule;
  const vfs = fonts?.pdfMake?.vfs ?? fonts?.vfs ?? fonts;
  if (vfs && typeof vfs === "object" && vfs["Roboto-Regular.ttf"]) {
    return vfs;
  }
  return null;
}

/** pdfmake + Roboto vfs (Vite / pdfmake 0.2.x uyumlu). */
export async function getPdfMake() {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const pdfMakeMod = await import("pdfmake/build/pdfmake");
      const pdfFontsMod = await import("pdfmake/build/vfs_fonts.js");
      const pdfMake = pdfMakeMod.default ?? pdfMakeMod;
      const vfs = resolvePdfVfs(pdfFontsMod);
      if (!vfs) {
        throw new Error("PDF yazı tipleri yüklenemedi (pdfmake vfs).");
      }
      pdfMake.vfs = vfs;
      return pdfMake;
    })();
  }
  return pdfMakePromise;
}

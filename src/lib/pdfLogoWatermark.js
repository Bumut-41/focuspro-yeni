const LOGO_PATH = "/focuspro-logo.png";
const LOGO_ASPECT = 463 / 664;
const WIDTH_RATIO = 0.78;
const OPACITY = 0.08;

let logoDataUrlPromise = null;

/** Site logosunu PDF filigranı için base64 data URL olarak yükler (önbellekli). */
export async function getPdfLogoDataUrl() {
  if (typeof window === "undefined") return null;
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(LOGO_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Logo yüklenemedi");
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .catch(() => null);
  }
  return logoDataUrlPromise;
}

/**
 * pdfmake `background` — sayfa ortasında büyük, şeffaf logo filigranı.
 * @param {string} logoDataUrl
 * @param {{ widthRatio?: number, opacity?: number }} [opts]
 */
export function buildPdfLogoBackground(logoDataUrl, opts = {}) {
  if (!logoDataUrl) return undefined;
  const widthRatio = opts.widthRatio ?? WIDTH_RATIO;
  const opacity = opts.opacity ?? OPACITY;

  return function pdfLogoBackground(_currentPage, pageSize) {
    const logoWidth = pageSize.width * widthRatio;
    const logoHeight = logoWidth * LOGO_ASPECT;
    const x = (pageSize.width - logoWidth) / 2;
    const y = (pageSize.height - logoHeight) / 2;

    return {
      image: logoDataUrl,
      width: logoWidth,
      opacity,
      absolutePosition: { x, y }
    };
  };
}

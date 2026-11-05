export function getGifPosition(area, zone) {
  const row = { upper: 26, middle: 50, lower: 74 };
  return { left: area === "left" ? 18 : 82, top: row[zone] ?? 50 };
}

/** Yukarı bakan dolu üçgen noktaları (hedef). */
const TRI_UP = "36,6 8,66 64,66";
const TRI_DOWN = "36,66 8,6 64,6";
const TRI_RIGHT = "6,8 66,36 6,64";
const TRI_LEFT = "66,8 6,36 66,64";

function svgWrap(inner) {
  return `<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

export function getShapeSvg(shape, color) {
  const c = color;
  const map = {
    circle: svgWrap(`<circle cx="36" cy="36" r="30" fill="${c}"/>`),
    square: svgWrap(`<rect x="10" y="10" width="52" height="52" fill="${c}"/>`),
    triangle: svgWrap(`<polygon points="${TRI_UP}" fill="${c}"/>`),
    diamond: svgWrap(`<polygon points="36,4 68,36 36,68 4,36" fill="${c}"/>`),
    pentagon: svgWrap(`<polygon points="36,5 66,28 54,66 18,66 6,28" fill="${c}"/>`),
    hexagon: svgWrap(`<polygon points="20,8 52,8 66,36 52,64 20,64 6,36" fill="${c}"/>`),
    vertical: svgWrap(`<rect x="28" y="6" width="16" height="60" fill="${c}"/>`),
    horizontal: svgWrap(`<rect x="6" y="28" width="60" height="16" fill="${c}"/>`),
    plus: svgWrap(
      `<rect x="28" y="8" width="16" height="56" fill="${c}"/><rect x="8" y="28" width="56" height="16" fill="${c}"/>`
    ),
    xshape: svgWrap(
      `<line x1="12" y1="12" x2="60" y2="60" stroke="${c}" stroke-width="12" stroke-linecap="round"/>` +
        `<line x1="60" y1="12" x2="12" y2="60" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`
    ),
    // GPT önerisi — hedef dışı (inhibisyon / ayırt etme)
    triangle_outline: svgWrap(
      `<polygon points="${TRI_UP}" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/>`
    ),
    triangle_dashed: svgWrap(
      `<polygon points="${TRI_UP}" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round" stroke-dasharray="8 7"/>`
    ),
    triangle_hole: svgWrap(
      `<polygon points="${TRI_UP}" fill="${c}"/>` +
        `<circle cx="36" cy="40" r="9" fill="#F8FAFC"/>`
    ),
    triangle_right: svgWrap(`<polygon points="${TRI_RIGHT}" fill="${c}"/>`),
    triangle_left: svgWrap(`<polygon points="${TRI_LEFT}" fill="${c}"/>`),
    triangle_down: svgWrap(`<polygon points="${TRI_DOWN}" fill="${c}"/>`),
    star: svgWrap(
      `<polygon points="36,4 43,26 66,26 47,40 54,62 36,48 18,62 25,40 6,26 29,26" fill="${c}"/>`
    ),
    triangle_dot_white: svgWrap(
      `<polygon points="${TRI_UP}" fill="${c}"/>` + `<circle cx="36" cy="40" r="7" fill="#FFFFFF"/>`
    ),
    triangle_bar: svgWrap(
      `<polygon points="${TRI_UP}" fill="${c}"/>` +
        `<rect x="22" y="36" width="28" height="8" rx="2" fill="#FFFFFF"/>`
    ),
    triangle_dot_yellow: svgWrap(
      `<polygon points="${TRI_UP}" fill="${c}"/>` + `<circle cx="36" cy="40" r="7" fill="#EAB308"/>`
    )
  };
  return map[shape] ?? map.circle;
}

export function ShapeView({ shape, color, size = 100 }) {
  const html = getShapeSvg(shape, color);
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        lineHeight: 0,
        verticalAlign: "middle"
      }}
      dangerouslySetInnerHTML={{
        __html: html.replace('width="72"', `width="${size}"`).replace('height="72"', `height="${size}"`)
      }}
    />
  );
}

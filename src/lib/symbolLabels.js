export const SHAPE_LABELS = {
  circle: "Daire",
  square: "Kare",
  triangle: "Üçgen",
  diamond: "Elmas",
  pentagon: "Beşgen",
  hexagon: "Altıgen",
  vertical: "Dikey çubuk",
  horizontal: "Yatay çubuk",
  plus: "Artı",
  xshape: "X"
};

const COLOR_LABELS = {
  "#2563EB": "Mavi",
  "#16A34A": "Yeşil",
  "#DC2626": "Kırmızı",
  "#F59E0B": "Turuncu",
  "#7C3AED": "Mor",
  "#0891B2": "Camgöbeği",
  "#DB2777": "Pembe",
  "#65A30D": "Açık yeşil",
  "#EA580C": "Koyu turuncu",
  "#0F172A": "Koyu"
};

export function colorLabel(color) {
  return COLOR_LABELS[color] ?? color ?? "—";
}

export function shapeLabel(shape) {
  return SHAPE_LABELS[shape] ?? shape ?? "—";
}

export function symbolCaption(shape, color) {
  if (!shape) return "—";
  return `${shapeLabel(shape)} · ${colorLabel(color)}`;
}

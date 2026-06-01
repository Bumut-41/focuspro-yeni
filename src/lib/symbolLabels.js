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

export function shapeLabel(shape) {
  return SHAPE_LABELS[shape] ?? shape ?? "—";
}

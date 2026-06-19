/** pdfmake Roboto emoji desteklemez; renkli nokta + metin kullan. */
const STATUS_COLORS = {
  green: "#16a34a",
  yellow: "#ca8a04",
  orange: "#ea580c",
  red: "#dc2626",
  gray: "#64748b"
};

export function pdfStatusColor(level) {
  return STATUS_COLORS[level] ?? STATUS_COLORS.gray;
}

export function pdfStatusLevelFromEmoji(emoji) {
  if (emoji === "🟢") return "green";
  if (emoji === "🟡") return "yellow";
  if (emoji === "🟠") return "orange";
  if (emoji === "🔴") return "red";
  return "gray";
}

function statusDotCanvas(color, size = 7) {
  const w = size + 6;
  return {
    width: w,
    canvas: [{ type: "ellipse", x: w / 2, y: size / 2 + 1, r1: size / 2, r2: size / 2, color }],
    margin: [0, 3, 0, 0]
  };
}

/** Başlık satırı: renkli nokta + metin (emoji yerine). */
export function pdfStatusLine(level, text, opts = {}) {
  const color = pdfStatusColor(level);
  return {
    columns: [
      statusDotCanvas(color, opts.dotSize ?? 7),
      {
        text,
        width: "*",
        fontSize: opts.fontSize ?? 11,
        bold: opts.bold ?? true,
        color: opts.textColor ?? "#4c1d95",
        margin: [0, 1, 0, 0]
      }
    ],
    columnGap: 4,
    margin: opts.margin ?? [0, 0, 0, 4]
  };
}

/** Klinik bayrak / geçerlilik bandı satırı. */
export function pdfFlagRow(flag, opts = {}) {
  const level = flag.level ?? pdfStatusLevelFromEmoji(flag.emoji);
  return pdfStatusLine(level, flag.text, {
    fontSize: opts.fontSize ?? 12,
    bold: true,
    textColor: pdfStatusColor(level),
    margin: opts.margin ?? [0, 0, 0, 0]
  });
}

import { triggerBlobDownload } from "./triggerBlobDownload.js";

function csvCell(value) {
  const text = value == null ? "" : String(value);
  if (text.startsWith("=")) return text;
  if (/[;"\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function excelText(value) {
  const text = value == null ? "" : String(value).trim();
  if (!text) return "";
  return `="${text.replace(/"/g, '""')}"`;
}

export function downloadTableCsv(filename, headers, rows) {
  const lines = [headers.map(csvCell).join(";")];
  for (const row of rows) {
    lines.push(row.map(csvCell).join(";"));
  }
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const day = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `${filename}-${day}.csv`);
}

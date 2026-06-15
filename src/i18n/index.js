import { tr } from "./locales/tr.js";
import { en } from "./locales/en.js";

export const DEFAULT_LOCALE = "tr";
export const SUPPORTED_LOCALES = ["tr", "en"];
export const LOCALE_STORAGE_KEY = "focuspro-locale";

const CATALOG = { tr, en };

export function getStrings(locale = DEFAULT_LOCALE) {
  return CATALOG[locale] ?? tr;
}

export function dateLocaleFor(locale = DEFAULT_LOCALE) {
  return getStrings(locale).meta.dateLocale;
}

export function resolvePath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function t(strings, path, vars) {
  let value = resolvePath(strings, path);
  if (value == null) return path;
  if (typeof value !== "string") return value;
  if (!vars) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : ""));
}

export function profileLabel(profileKey, locale = DEFAULT_LOCALE) {
  const labels = getStrings(locale).profiles;
  return labels[profileKey] ?? profileKey;
}

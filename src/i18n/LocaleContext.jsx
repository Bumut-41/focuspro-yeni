import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  dateLocaleFor,
  getStrings,
  t as translate
} from "./index.js";

const LocaleContext = createContext(null);

function readStoredLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setLocale = useCallback((next) => {
    const value = SUPPORTED_LOCALES.includes(next) ? next : DEFAULT_LOCALE;
    setLocaleState(value);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const strings = useMemo(() => getStrings(locale), [locale]);
  const dateLocale = useMemo(() => dateLocaleFor(locale), [locale]);

  const t = useCallback((path, vars) => translate(strings, path, vars), [strings]);

  useEffect(() => {
    document.documentElement.lang = strings.meta.lang;
    document.title = strings.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", strings.meta.description);
  }, [strings]);

  const value = useMemo(
    () => ({ locale, setLocale, strings, t, dateLocale }),
    [locale, setLocale, strings, t, dateLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

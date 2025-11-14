// src/i18nLang.ts
export type UiLang = "fr" | "en";
const KEY = "i18n-lang";

export function getUiLang(): UiLang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "fr" || v === "en") return v;
  } catch {}
  return "fr";
}

export function setUiLang(lang: UiLang) {
  try { localStorage.setItem(KEY, lang); } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
}

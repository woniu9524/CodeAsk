import type { i18n } from "i18next";

const languageLocalStorageKey = "lang";

export function setAppLanguage(lang: string, i18n: i18n) {
  localStorage.setItem(languageLocalStorageKey, lang);
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
}

export function updateAppLanguage(i18n: i18n) {
  const localLang = localStorage.getItem(languageLocalStorageKey);
  if (!localLang) {
    return;
  }

  i18n.changeLanguage(localLang);
  document.documentElement.lang = localLang;
}

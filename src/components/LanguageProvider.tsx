"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import de from "@/lib/de";

export function useLanguage() {
  const { t, i18n } = useTranslation();
  const language: "en" | "de" = i18n.language === "de" ? "de" : "en";
  const translate = (text: string) => {
    const key = text.replace(/\s+/g, " ").trim();
    return t(key, { defaultValue: text });
  };
  return { language, translate, setLanguage: (value: "en" | "de") => i18n.changeLanguage(value) };
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => {
    const i18n = createInstance();
    void i18n.init({
      lng: "en",
      fallbackLng: "en",
      supportedLngs: ["en", "de"],
      initAsync: false,
      keySeparator: false,
      nsSeparator: false,
      interpolation: { escapeValue: false },
      resources: { en: { translation: {} }, de: { translation: de } },
    });
    return i18n;
  });

  useEffect(() => {
    const syncLanguage = (language: string) => {
      document.documentElement.lang = language;
      try { localStorage.setItem("language", language); } catch {}
    };
    instance.on("languageChanged", syncLanguage);
    let language = "en";
    try { if (localStorage.getItem("language") === "de") language = "de"; } catch {}
    void instance.changeLanguage(language);
    return () => { instance.off("languageChanged", syncLanguage); };
  }, [instance]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

export function SkipToContent() {
  const { translate } = useLanguage();
  return <a className="skip-link" href="#content">{translate("Skip to content")}</a>;
}
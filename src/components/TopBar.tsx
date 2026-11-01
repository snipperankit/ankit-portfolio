"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Languages, Moon, Sun, X } from "lucide-react";
import { THEME_CHANGE_EVENT } from "@/components/Hero";
import { LINKS } from "@/lib/content";
import { useLanguage } from "./LanguageProvider";
import { AnalyticsSettings } from "./Analytics";

const STORAGE_KEY = "theme";
const HEADER_SOCIAL_KEYS = ["github", "medium", "linkedin"];

export default function TopBar({ onRun, visible = true, marketplace = false }: { onRun: (cmd: string) => void; visible?: boolean; marketplace?: boolean }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { language, translate, setLanguage } = useLanguage();
  const noticeRef = useRef<HTMLDialogElement>(null);
  const noticeTitle = useId();

  useEffect(() => {
    const stored = document.documentElement.getAttribute("data-theme") ?? "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing initial state from localStorage/DOM, avoids SSR hydration mismatch
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  const applyTheme = (next: "dark" | "light") => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <div id="topbar" className={visible ? "" : "chrome-hidden"}>
      <button className="name" onClick={() => onRun("home")}>
        Ankit Anand
      </button>
      <span className="role">{translate("SOLUTION ARCHITECT · GERMANY")}</span>
      <div className="topbar-socials">
        {LINKS.filter(([k]) => HEADER_SOCIAL_KEYS.includes(k)).map(([k, url]) => (
          <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={k}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/icons/${k}.svg`} alt="" width={16} height={16} />
          </a>
        ))}
      </div>
      <div className="language-toggle" role="group" aria-label={translate("Language")}>
        <Languages size={18} aria-hidden="true" />
        {(["en", "de"] as const).map((l) => (
          <button key={l} type="button" className={language === l ? "on" : ""} aria-pressed={language === l}
            aria-label={l === "en" ? "English" : "Deutsch"}
            onClick={() => { if (language === l) return; void setLanguage(l); if (marketplace && l === "de") noticeRef.current?.showModal(); }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <dialog ref={noticeRef} className="calendly-notice language-notice" aria-labelledby={noticeTitle}
        onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); noticeRef.current?.close(); } }}
        onClick={(event) => { if (event.target === event.currentTarget) noticeRef.current?.close(); }}>
        <div className="calendly-notice-card">
          <button type="button" className="icon-button calendly-notice-close" aria-label={translate("Close language notice")} title={translate("Close language notice")} onClick={() => noticeRef.current?.close()}><X size={18} /></button>
          <div className="calendly-notice-kicker">{translate("English only, for now")}</div>
          <h2 id={noticeTitle}>{translate("These articles haven't passed their German exam yet.")}</h2>
          <p>{translate("Marketplace articles and diagrams are currently available in English only. We're aiming to add a German version soon. Until then: a little English, a lot of know-how.")}</p>
          <button className="btn primary" type="button" onClick={() => noticeRef.current?.close()}>{translate("Keep reading in English")}</button>
        </div>
      </dialog>
      <button
        id="theme-toggle"
        className="thbtn"
        onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
        title={translate(theme === "dark" ? "Switch to light theme" : "Switch to dark theme")}
        aria-label={translate(theme === "dark" ? "Switch to light theme" : "Switch to dark theme")}
      >
        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      </button>
      <AnalyticsSettings />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Play } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useTypewriter } from "@/hooks/useTypewriter";
import deskPoster from "../../public/images/desk-poster.png";

const HEADLINES = [
  ["Distributed systems.", "Applied GenAI."],
  ["Complex systems.", "Clear architecture."],
  ["From idea to impact.", "Code that delivers."],
  ["AI with purpose.", "Built for real life."],
  ["Reliable by design.", "Ready to scale."],
] as const;

function RotatingHeadline() {
  const { translate } = useLanguage();
  const phrases = HEADLINES.map((lines) => lines.map(translate).join("\n"));
  const { text, phrase: currentPhrase } = useTypewriter(phrases);
  const typedLines = text.split("\n");
  return (
    <h1 className="headline typing-headline" aria-label={phrases[0].replace("\n", " ")}>
      {phrases.map((phrase) => (
        <span className="headline-reserve" key={phrase} aria-hidden="true">{phrase}<span className="cur" /></span>
      ))}
      <span className="headline-typed" aria-hidden="true">
        {currentPhrase.split("\n").map((line, index) => (
          <span className="headline-line" key={index}>
            <span className="headline-line-width">{line}<span className="cur" /></span>
            <span className="headline-line-text">{typedLines[index] ?? ""}{index === typedLines.length - 1 && <span className="cur" />}</span>
          </span>
        ))}
      </span>
    </h1>
  );
}

export const THEME_CHANGE_EVENT = "themechange";
const DeskScene = dynamic(() => import("./DeskScene"), {
  ssr: false,
  loading: () => <div className="desk-scene" aria-busy="true" />,
});

type SceneConnection = EventTarget & { saveData?: boolean; effectiveType?: string };

function sceneConnection() {
  return (navigator as Navigator & { connection?: SceneConnection }).connection;
}

function sceneLoadingMode() {
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  const connection = sceneConnection();
  return connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "") ? "restricted" : "desktop";
}

function subscribeSceneLoading(onChange: () => void) {
  const viewport = window.matchMedia("(max-width: 767px)");
  const connection = sceneConnection();
  viewport.addEventListener("change", onChange);
  connection?.addEventListener("change", onChange);
  return () => {
    viewport.removeEventListener("change", onChange);
    connection?.removeEventListener("change", onChange);
  };
}

function DeferredDesk() {
  const { translate } = useLanguage();
  const mode = useSyncExternalStore(subscribeSceneLoading, sceneLoadingMode, () => "pending");
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (mode !== "desktop" || enabled) return;
    let idle: number | undefined;
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setEnabled(true), { timeout: 2500 });
      else setEnabled(true);
    }, 1200);
    return () => { clearTimeout(timer); if (idle !== undefined) window.cancelIdleCallback(idle); };
  }, [mode, enabled]);
  return enabled ? <DeskScene /> : (
    <div className="desk-scene desk-poster">
      <Image src={deskPoster} alt={translate("Ankit's engineering desk")} fill loading="eager" sizes="(max-width: 767px) 100vw, 800px" />
      {mode === "mobile" && <button className="btn ghost desk-load" data-track="scene_requested" onClick={() => setEnabled(true)}><Play size={16} aria-hidden="true" />{translate("Load 3D scene")}</button>}
    </div>
  );
}

export default function Hero({
  onRun,
}: {
  onRun: (cmd: string) => void;
}) {
  const { translate } = useLanguage();
  return (
    <div className="hero">
      <DeferredDesk />
      <div className="hero-text in">
        <RotatingHeadline />
        <div className="sub">
          {translate("9 years of distributed systems and GenAI, running in production.")}
        </div>
        <div id="hero-ctas" className="ctas">
          <button className="btn primary" onClick={() => onRun("work")}>
            {translate("Explore my work")}
          </button>
          <button className="btn ghost" onClick={() => onRun("cv")}>
            {translate("View CV")}
          </button>
        </div>
      </div>
    </div>
  );
}


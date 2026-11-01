"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "./LanguageProvider";

interface TourStep {
  selector: string;
  eyebrow: string;
  title: string;
  body: string;
}

// the terminal input is step 5 of 5 and is owned by TerminalOnboarding — this only covers the pointer steps before it
const STEPS: TourStep[] = [
  {
    selector: "#theme-toggle",
    eyebrow: "APPEARANCE",
    title: "Light or dark",
    body: "Flip the theme any time — your choice is remembered on your next visit.",
  },
  {
    selector: "#sidebar",
    eyebrow: "NAVIGATION",
    title: "Jump to any section",
    body: "These tabs mirror terminal commands like about, work, and contact.",
  },
  {
    selector: "#hero-ctas",
    eyebrow: "SHORTCUTS",
    title: "One-click actions",
    body: "Book a call, ask a question, or grab the CV instantly.",
  },
  {
    selector: "#flash-rail",
    eyebrow: "LIVE UPDATES",
    title: "Rotating notices",
    body: "Announcements about new releases, offers, and social proof.",
  },
  {
    selector: "#ask-launch",
    eyebrow: "AI ASSISTANT",
    title: "Ask Ankit anything",
    body: "A chat assistant trained on this site's content — always one tap away.",
  },
];

const MARGIN = 12;
const TOOLTIP_WIDTH = 280;

export default function OnboardingTour({
  active,
  stepIndex,
  total,
  onAdvance,
  onSkip,
}: {
  active: boolean;
  stepIndex: number;
  total: number;
  onAdvance: () => void;
  onSkip: () => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { language, translate } = useLanguage();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);

  const step = STEPS[stepIndex];

  // recompute the highlighted element's rect, skipping straight past any step whose target isn't on screen
  useLayoutEffect(() => {
    if (!active || !step) return;
    const measure = () => {
      const el = document.querySelector(step?.selector ?? "");
      if (!el) {
        onAdvance();
        return;
      }
      setRect(el.getBoundingClientRect());
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-measure whenever the active step changes
  }, [active, stepIndex, step?.selector]);

  // two-pass placement: measure the tooltip's real size, then pick the side of the target with the most room
  useLayoutEffect(() => {
    if (!rect || !tooltipRef.current) {
      setPos(null);
      return;
    }
    const tipH = tooltipRef.current.offsetHeight || 120;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const above = spaceBelow < tipH + MARGIN * 2 && spaceAbove > spaceBelow;
    let top = above ? rect.top - tipH - MARGIN : rect.bottom + MARGIN;
    top = Math.min(Math.max(top, MARGIN), vh - tipH - MARGIN);
    const isSidebar = step.selector === "#sidebar";
    let left = isSidebar
      ? rect.right + MARGIN
      : rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    if (isSidebar && left + TOOLTIP_WIDTH > vw - MARGIN) left = rect.left - TOOLTIP_WIDTH - MARGIN;
    left = Math.min(Math.max(left, MARGIN), vw - TOOLTIP_WIDTH - MARGIN);
    setPos({ top, left, above });
  }, [rect, step?.selector, language]);

  // advance the moment the visitor actually interacts with the highlighted control
  useEffect(() => {
    if (!active || !step) return;
    const onClick = (e: MouseEvent) => {
      const el = document.querySelector(step.selector);
      if (el && el.contains(e.target as Node)) onAdvance();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active, step, onAdvance]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, onSkip]);

  if (!active || !step || !rect || typeof document === "undefined") return null;

  return createPortal(
    // keyed by step so a jump between differently sized/positioned targets pops in fresh instead of tweening across the screen
    <Fragment key={stepIndex}>
      <div
        className="tour-highlight"
        aria-hidden="true"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
        }}
      />
      <div
        ref={tooltipRef}
        className="tour-tooltip"
        role="group"
        aria-label={translate(step.title)}
        style={pos ? { top: pos.top, left: pos.left, width: TOOLTIP_WIDTH, visibility: "visible" } : { top: -9999, left: -9999, width: TOOLTIP_WIDTH, visibility: "hidden" }}
      >
        <p className="tour-eyebrow">{translate(step.eyebrow)}</p>
        <h2 className="tour-title">{translate(step.title)}</h2>
        <p className="tour-body">{translate(step.body)}</p>
        <div className="tour-actions">
          <span className="onboard-dots" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`onboard-dot${i <= stepIndex ? " filled" : ""}`} />
            ))}
          </span>
          <span className="sr-only">
            {translate("step")} {stepIndex + 1} {translate("of")} {total}
          </span>
          <button type="button" className="btn ghost" onClick={onSkip}>
            {translate("Skip")}
          </button>
          <button type="button" className="btn primary" onClick={onAdvance}>
            {translate("Next")}
          </button>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}

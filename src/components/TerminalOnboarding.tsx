"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "./LanguageProvider";

// non-modal by design: the terminal input must stay usable while this is open,
// so there's no role="dialog"/aria-modal and no focus trap — Escape and the two
// buttons are the only extra affordances on top of normal tab order
export default function TerminalOnboarding({
  open,
  step = 1,
  total = 1,
  onTryHelp,
  onSkip,
}: {
  open: boolean;
  step?: number;
  total?: number;
  onTryHelp: () => void;
  onSkip: () => void;
}) {
  const primaryRef = useRef<HTMLButtonElement>(null);
  const { translate } = useLanguage();

  useEffect(() => {
    if (!open) return;
    primaryRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onSkip]);

  if (!open) return null;

  return (
    <>
      {typeof document !== "undefined" &&
        createPortal(<div className="terminal-onboard-scrim" aria-hidden="true" />, document.body)}
      <div
        className="terminal-onboard-card"
        role="group"
        aria-labelledby="terminal-onboard-heading"
        aria-describedby="terminal-onboard-body"
      >
        <p className="terminal-onboard-eyebrow">{translate("INTERACTIVE COMMAND PALETTE")}</p>
        <h2 id="terminal-onboard-heading" className="terminal-onboard-heading">
          {translate("Control this site from the terminal")}
        </h2>
        <p id="terminal-onboard-body" className="terminal-onboard-body">
          {translate("Type")} <code>help</code> {translate("to explore commands, or try")} <code>work</code>, <code>about</code>, <code>ask</code> {translate("or")} <code>contact</code>.
        </p>
        <div className="terminal-onboard-actions">
          <span className="onboard-dots" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`onboard-dot${i < step ? " filled" : ""}`} />
            ))}
          </span>
          <span className="sr-only">
            {translate("step")} {step} {translate("of")} {total}
          </span>
          <button type="button" className="btn ghost" onClick={onSkip}>
            {translate("Skip")}
          </button>
          <button type="button" ref={primaryRef} className="btn primary" onClick={onTryHelp}>
            {translate("Try help")}
          </button>
        </div>
      </div>
    </>
  );
}

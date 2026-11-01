"use client";

import type { FlashNotice } from "@/lib/types";
import { useFlashNotifications } from "@/hooks/useFlashNotifications";

interface FlashNotificationsProps {
  notices: FlashNotice[];
  onRunCommand: (cmd: string) => void;
  onAsk: (query: string) => void;
  held?: boolean;
}

function actionForTone(tone: FlashNotice["tone"]) {
  switch (tone) {
    case "social-proof":
      return "SOCIAL PROOF";
    case "launch":
      return "NEW RELEASE";
    case "offer":
      return "LIMITED OFFER";
    case "event":
      return "EVENT";
    default:
      return "UPDATE";
  }
}

function glyphForTone(tone: FlashNotice["tone"]) {
  switch (tone) {
    case "social-proof":
      return "👥";
    case "launch":
      return "🚀";
    case "offer":
      return "🔥";
    case "event":
      return "⚡";
    default:
      return "●";
  }
}

export default function FlashNotifications({ notices, onRunCommand, onAsk, held }: FlashNotificationsProps) {
  const { active, hasAny, dismissActive, showNext, pause, resume } = useFlashNotifications(notices, { held });

  if (!hasAny || !active) return null;

  const takeAction = () => {
    if (!active.action) return;

    if (active.action.type === "command") {
      onRunCommand(active.action.value);
    } else if (active.action.type === "ask") {
      onAsk(active.action.value);
    } else {
      const target = active.action.newTab === false ? "_self" : "_blank";
      window.open(active.action.value, target, "noopener,noreferrer");
    }

    dismissActive();
  };

  return (
    <div id="flash-rail" aria-live="polite" aria-atomic="true" onMouseEnter={pause} onMouseLeave={resume}>
      <aside className={`flash-card tone-${active.tone}`}>
        <div className="flash-meta">
          <span className="flash-glyph" aria-hidden="true">{glyphForTone(active.tone)}</span>
          <span className="flash-pill">{active.badge ?? actionForTone(active.tone)}</span>
          <span className="flash-kicker">{actionForTone(active.tone)}</span>
          <span className="flash-prompt" aria-hidden="true">$ notifyctl</span>
        </div>

        <div className="flash-title">{active.title}</div>
        <div className="flash-message">{active.message}</div>

        <div className="flash-actions">
          {active.action && (
            <button type="button" className="flash-btn flash-btn-primary" onClick={takeAction}>
              {active.action.label}
            </button>
          )}
          <button type="button" className="flash-btn flash-icon-btn" onClick={showNext} aria-label="Show next notification" title="Next notification">
            &gt;_
          </button>
          <button type="button" className="flash-btn flash-icon-btn" onClick={dismissActive} aria-label="Dismiss notification" title="Dismiss notification">
            x
          </button>
        </div>
      </aside>
    </div>
  );
}

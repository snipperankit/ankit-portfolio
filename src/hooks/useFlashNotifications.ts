"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlashNotice } from "@/lib/types";

interface UseFlashNotificationsOptions {
  initialDelayMs?: number;
  rotateEveryMs?: number;
  held?: boolean;
}

const DEFAULT_INITIAL_DELAY_MS = 5000;
const DEFAULT_ROTATE_EVERY_MS = 18000;
const DEFAULT_COOLDOWN_MS = 60000;

function isWithinSchedule(notice: FlashNotice, nowMs: number) {
  const startMs = notice.startAt
    ? Date.parse(notice.startAt)
    : Number.NEGATIVE_INFINITY;
  const endMs = notice.endAt
    ? Date.parse(notice.endAt)
    : Number.POSITIVE_INFINITY;
  return nowMs >= startMs && nowMs <= endMs;
}

function resolveSocialProofCount(notice: FlashNotice) {
  if (!notice.socialProofCount) return notice;
  const min = Math.max(1, Math.ceil(notice.socialProofCount.min));
  const max = Math.max(min, Math.floor(notice.socialProofCount.max));
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return { ...notice, title: notice.title.replace("{count}", String(count)) };
}

export function useFlashNotifications(
  notices: FlashNotice[],
  options?: UseFlashNotificationsOptions,
) {
  const initialDelayMs = options?.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
  const rotateEveryMs = options?.rotateEveryMs ?? DEFAULT_ROTATE_EVERY_MS;
  const held = options?.held ?? false;

  const [active, setActive] = useState<FlashNotice | null>(null);
  const [paused, setPaused] = useState(false);
  const [dismissedAt, setDismissedAt] = useState<Record<string, number>>({});
  const cursorRef = useRef(0);

  const rankedNotices = useMemo(
    () => [...notices].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    [notices],
  );

  const pickNext = useCallback(() => {
    const nowMs = Date.now();
    const liveNotices = rankedNotices.filter((n) => isWithinSchedule(n, nowMs));
    if (!liveNotices.length) return null;

    for (let step = 0; step < liveNotices.length; step += 1) {
      const idx = (cursorRef.current + step) % liveNotices.length;
      const candidate = liveNotices[idx];
      const coolDownMs = candidate.cooldownMs ?? DEFAULT_COOLDOWN_MS;
      const lastDismissedAt =
        dismissedAt[candidate.id] ?? Number.NEGATIVE_INFINITY;
      if (nowMs - lastDismissedAt >= coolDownMs) {
        cursorRef.current = (idx + 1) % liveNotices.length;
        return resolveSocialProofCount(candidate);
      }
    }

    const fallbackIdx = cursorRef.current % liveNotices.length;
    cursorRef.current = (fallbackIdx + 1) % liveNotices.length;
    return resolveSocialProofCount(liveNotices[fallbackIdx]);
  }, [dismissedAt, rankedNotices]);

  const showNext = useCallback(() => {
    setActive(pickNext());
  }, [pickNext]);

  const dismissActive = useCallback(() => {
    if (!active) return;
    const nowMs = Date.now();
    setDismissedAt((prev) => ({ ...prev, [active.id]: nowMs }));
    setActive(null);
  }, [active]);

  useEffect(() => {
    if (held || paused || !rankedNotices.length) return;

    const initialTimer = window.setTimeout(showNext, initialDelayMs);
    const rotateTimer = window.setInterval(showNext, rotateEveryMs);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(rotateTimer);
    };
  }, [
    held,
    initialDelayMs,
    paused,
    rankedNotices.length,
    rotateEveryMs,
    showNext,
  ]);

  return {
    active,
    hasAny: rankedNotices.length > 0,
    dismissActive,
    showNext,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  };
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import { ANALYTICS_CONSENT, ANALYTICS_EVENTS, analyticsAllowed, track } from "@/lib/analytics";
import { useLanguage } from "./LanguageProvider";

export default function Analytics() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    const pageview = () => {
      if (!analyticsAllowed()) { previous.current = null; return; }
      if (previous.current !== pathname) { track("pageview"); previous.current = pathname; }
    };
    pageview();
    window.addEventListener("analyticsconsentchange", pageview);
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-track]");
      if (target && ANALYTICS_EVENTS.includes(target.dataset.track as typeof ANALYTICS_EVENTS[number])) {
        track(target.dataset.track as typeof ANALYTICS_EVENTS[number], { resource: target.dataset.resource });
        return;
      }
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (anchor?.getAttribute("href")?.startsWith("mailto:")) track("email_clicked");
      else if (anchor && new URL(anchor.href).pathname.startsWith("/cv/")) track("cv_download");
    };
    document.addEventListener("click", click);
    return () => { window.removeEventListener("analyticsconsentchange", pageview); document.removeEventListener("click", click); };
  }, [pathname]);
  return null;
}

export function AnalyticsSettings() {
  const { translate } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const [allowed, setAllowed] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN);
  const save = (value: boolean) => {
    try { localStorage.setItem(ANALYTICS_CONSENT, value ? "allow" : "deny"); } catch {}
    setAllowed(analyticsAllowed());
    window.dispatchEvent(new Event("analyticsconsentchange"));
  };
  return <>
    <button className="thbtn" aria-label={translate("Privacy settings")} title={translate("Privacy settings")} onClick={() => { setAllowed(analyticsAllowed()); dialog.current?.showModal(); }}><ShieldCheck size={18} /></button>
    <dialog ref={dialog} className="calendly-notice" aria-label={translate("Privacy settings")} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); dialog.current?.close(); } }} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="calendly-notice-card">
        <button className="icon-button calendly-notice-close" aria-label={translate("Close")} onClick={() => dialog.current?.close()}><X size={18} /></button>
        <h2>{translate("Privacy settings")}</h2>
        <p>{translate("Optional usage statistics help improve this site. No chat messages, email addresses, payment identifiers or search terms are included. Browser privacy signals are respected.")}</p>
        <p>{translate(configured ? "Statistics are sent to Plausible only with your permission." : "Usage statistics are not configured on this site.")}</p>
        <p role="status">{translate(allowed && configured ? "Usage statistics: on" : "Usage statistics: off")}</p>
        <div className="calendly-notice-actions">
          <button className="btn ghost" onClick={() => save(false)}>{translate("Keep statistics off")}</button>
          <button className="btn primary" disabled={!configured} onClick={() => save(true)}>{translate("Allow statistics")}</button>
        </div>
      </div>
    </dialog>
  </>;
}
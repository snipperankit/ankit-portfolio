export const ANALYTICS_EVENTS = [
  "pageview",
  "section_view",
  "resource_download",
  "resource_share",
  "email_clicked",
  "cv_download",
  "checkout_opened",
  "checkout_started",
  "assistant_opened",
  "scene_requested",
] as const;
type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
type Details = { resource?: string; section?: string };
export const ANALYTICS_CONSENT = "portfolio-analytics-consent";

export function analyticsPayload(
  event: AnalyticsEvent,
  href: string,
  domain: string,
  language: string,
  details: Details = {},
) {
  const url = new URL(href);
  const props: Record<string, string> = {
    language: language === "de" ? "de" : "en",
  };
  if (
    details.resource &&
    /^(?:\/resources\/(?:genai|handbooks)\/)?[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(
      details.resource,
    )
  )
    props.resource = details.resource;
  if (
    details.section &&
    [
      "home",
      "about",
      "work",
      "stack",
      "certs",
      "consulting",
      "cv",
      "contact",
      "links",
      "marketplace",
      "genai",
      "offers",
      "help",
    ].includes(details.section)
  )
    props.section = details.section;
  return { n: event, u: `${url.origin}${url.pathname}`, d: domain, props };
}

export function analyticsAllowed() {
  if (typeof window === "undefined") return false;
  const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (navigator.doNotTrack === "1" || privacy.globalPrivacyControl)
    return false;
  try {
    return localStorage.getItem(ANALYTICS_CONSENT) === "allow";
  } catch {
    return false;
  }
}

export function track(event: AnalyticsEvent, details: Details = {}) {
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (
    !domain ||
    !/^[a-z0-9.-]+$/i.test(domain) ||
    !analyticsAllowed() ||
    !ANALYTICS_EVENTS.includes(event)
  )
    return;
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ANALYTICS_DEBUG !== "true"
  )
    return;
  const payload = analyticsPayload(
    event,
    window.location.href,
    domain,
    document.documentElement.lang,
    details,
  );
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") {
    window.dispatchEvent(
      new CustomEvent("portfolio:analytics", { detail: payload }),
    );
    return;
  }
  void fetch("https://plausible.io/api/event", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
    keepalive: true,
    credentials: "omit",
    referrerPolicy: "no-referrer",
  }).catch(() => {});
}

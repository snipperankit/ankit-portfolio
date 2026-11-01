"use client";

import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import type { MarketplaceDoc } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import BuyForm from "./BuyForm";
import { PdfPreview } from "./PdfPreview";

export function ShareResource({ path }: { path: string }) {
  const { language, translate } = useLanguage();
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [url, setUrl] = useState("");
  return <div className="resource-share" lang={language}>
    <button className="btn ghost" data-track="resource_share" data-resource={path} onClick={async () => {
      const url = new URL(path, window.location.origin).href;
      setUrl(url);
      try { await navigator.clipboard.writeText(url); setStatus("copied"); } catch { setStatus("error"); }
    }}>{status === "copied" ? <Check size={16} /> : <LinkIcon size={16} />}{translate(status === "copied" ? "Link copied" : "Copy link")}</button>
    {status === "error" && <input readOnly aria-label={translate("Resource link")} value={url} onFocus={(event) => event.currentTarget.select()} />}
    <span className="sr-only" role="status">{status === "copied" ? translate("Link copied") : ""}</span>
  </div>;
}

export function HandbookPreview({ doc }: { doc: MarketplaceDoc }) {
  const [buying, setBuying] = useState(false);
  return <section className="resource-preview">
    <h2>Free preview</h2>
    <p>Pages 1-{doc.freePages} of {doc.pageCount}. The complete handbook is in English.</p>
    <PdfPreview src={`/api/marketplace/preview/${doc.slug}`} pageCount={doc.freePages} />
    {doc.priceCents ? <button className="btn primary" data-track="checkout_opened" data-resource={doc.slug} onClick={() => setBuying(true)}>Unlock PDF · ${(doc.priceCents / 100).toFixed(2)}</button> : <a className="btn primary" data-track="resource_download" data-resource={doc.slug} href={`/api/download/${doc.slug}`}>Download PDF</a>}
    {buying && <BuyForm doc={doc} onClose={() => setBuying(false)} />}
  </section>;
}
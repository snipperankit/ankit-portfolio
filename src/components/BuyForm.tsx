"use client";

import { track } from "@/lib/analytics";

const CONTACT_EMAIL = "anand.ankit093@gmail.com";

export default function BuyForm({
  doc,
  onClose,
}: {
  doc: { slug: string; title: string; priceCents?: number };
  onClose: () => void;
}) {
  const price = doc.priceCents ? `$${(doc.priceCents / 100).toFixed(2)}` : "";

  const subject = `Buy: ${doc.title}${price ? ` (${price})` : ""}`;
  const body = [
    "Hi Ankit,",
    "",
    `I'd like to buy "${doc.title}"${price ? ` for ${price}` : ""}.`,
    "Please send me a PayPal payment link.",
    "",
    "After payment, please deliver the PDF to this email address.",
  ].join("\n");
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="buyform-overlay" lang="en" role="dialog" aria-modal="true" aria-label={`buy ${doc.title}`}>
      <div className="buyform-card">
        <div className="buyform-head">
          <span className="buyform-title">buy — {doc.title}</span>
          <button className="buyform-close" onClick={onClose} aria-label="close">
            x
          </button>
        </div>
        <p className="buyform-note">
          Checkout is handled personally by email — three quick steps:
        </p>
        <ol className="buyform-steps">
          <li>Send me an email naming this document{price ? ` (${price})` : ""}.</li>
          <li>You get a PayPal payment link by reply.</li>
          <li>After payment, the full PDF lands in your inbox — usually within 24 hours.</li>
        </ol>
        <div className="buyform-actions">
          <button className="btn ghost" onClick={onClose}>
            cancel
          </button>
          <a
            className="btn primary"
            href={mailto}
            onClick={() => track("checkout_started", { resource: doc.slug })}
          >
            email to buy{price ? ` · ${price}` : ""}
          </a>
        </div>
      </div>
    </div>
  );
}

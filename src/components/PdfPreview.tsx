"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useLanguage } from "./LanguageProvider";

let workerConfigured = false;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjs;
}

// Renders every page of a PDF (fetched from `src`) onto its own <canvas>.
// layout "row" fits pages side by side (e.g. a 2-page CV spread) sized to the
// available width/height instead of stacking them in one tall scroll.
export function PdfPreview({
  src,
  pageCount,
  layout = "stack",
  localized = false,
}: {
  src: string;
  pageCount: number;
  layout?: "stack" | "row";
  localized?: boolean;
}) {
  const { translate } = useLanguage();
  const label = (text: string) => localized ? translate(text) : text;
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Stack layout (Marketplace) pages through one canvas at a time instead of a
  // tall vertical scroll; row layout (CV spread) still renders all pages at once.
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);

  const renderPages = useCallback(async () => {
    const doc = docRef.current;
    const container = containerRef.current;
    if (!doc || !container) return;
    container.innerHTML = "";

    const dpr = window.devicePixelRatio || 1;
    const gap = 16;
    const cs = window.getComputedStyle(container);
    const paddingX = parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
    // Extra safety margin beyond padding: canvas widths round up slightly and a
    // vertical scrollbar can appear once pages are tall enough to need one, both
    // of which can eat into the row before it's accounted for and force a wrap.
    const frameWidth = (container.clientWidth || 640) - paddingX - 16;
    const columns = layout === "row" && frameWidth >= 640 ? Math.min(doc.numPages, 2) : 1;
    const perPageWidth =
      layout === "row" ? Math.floor((frameWidth - gap * (columns - 1)) / columns) : frameWidth;
    // Row layout favors width so page text stays legible; height is generous on
    // purpose so the container (not the render scale) absorbs any overflow via scroll.
    const heightBudget =
      layout === "row"
        ? isFullscreen
          ? window.innerHeight * 0.92
          : window.innerHeight * 1.15
        : isFullscreen
          ? window.innerHeight * 0.86
          : Math.min(window.innerHeight * 0.68, 760);

    const pagesToRender = layout === "row" ? Array.from({ length: doc.numPages }, (_, i) => i + 1) : [Math.min(pageNum, doc.numPages)];

    for (const i of pagesToRender) {
      const page = await doc.getPage(i);
      const unscaled = page.getViewport({ scale: 1 });
      // Stack layout must also fit the container width — the side column can be
      // much narrower than a full page render at a fixed zoom, which silently
      // clipped page content left/right under `.mkt-pdf-pages{overflow-x:hidden}`.
      const scale =
        layout === "row"
          ? Math.min((perPageWidth * dpr) / unscaled.width, (heightBudget * dpr) / unscaled.height)
          : (perPageWidth * dpr) / unscaled.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;
      canvas.className = "mkt-pdf-page";
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      container.appendChild(canvas);
    }
  }, [layout, isFullscreen, pageNum]);

  useEffect(() => {
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        doc = await pdfjs.getDocument({
          url: src,
          cMapUrl: "/cmaps/",
          cMapPacked: true,
          standardFontDataUrl: "/standard_fonts/",
        }).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        setNumPages(doc.numPages);
        setPageNum(1);
        await renderPages();
        if (!cancelled) setStatus("ready");
      } catch (err) {
        console.error("[pdf-preview] failed", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      doc?.destroy();
      docRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (status === "ready") renderPages();
  }, [status, renderPages]);

  // Re-fit already-rendered pages when the container is resized in place
  // (window resize/orientation change) — renderPages otherwise only reruns
  // on src/page/layout/fullscreen changes, so a live resize left canvases at
  // their old pixel size, overflowing the now-narrower container.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let lastWidth = container.clientWidth;
    const observer = new ResizeObserver(() => {
      const width = container.clientWidth;
      if (Math.abs(width - lastWidth) < 8) return;
      lastWidth = width;
      if (status === "ready") renderPages();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [status, renderPages]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement === frameRef.current) {
      document.exitFullscreen();
    } else {
      frameRef.current?.requestFullscreen();
    }
  };

  const goToPage = (n: number) => setPageNum(Math.min(Math.max(n, 1), numPages || pageCount));

  return (
    <div ref={frameRef} className={`mkt-pdf${isFullscreen ? " is-fullscreen" : ""}`}>
      <div className="mkt-pdf-toolbar">
        {layout === "row" ? (
          <span className="dim" style={{ fontSize: ".82em" }}>
            {pageCount} {label(pageCount === 1 ? "page" : "pages")}
          </span>
        ) : (
          <div className="mkt-pdf-nav">
            <button className="btn ghost" onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1} aria-label={label("previous page")}>
              {label("‹ prev")}
            </button>
            <span className="dim" style={{ fontSize: ".82em" }}>
              {label("page")} {pageNum} / {numPages || pageCount}
            </span>
            <button className="btn ghost" onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= (numPages || pageCount)} aria-label={label("next page")}>
              {label("next ›")}
            </button>
          </div>
        )}
        <button className="btn ghost" onClick={toggleFullscreen}>
          {label(isFullscreen ? "exit fullscreen" : "fullscreen")}
        </button>
      </div>
      {status === "loading" && (
        <div className="mkt-pdf-status dim">{label("Loading preview...")}</div>
      )}
      {status === "error" && (
        <div className="mkt-pdf-status red">{label("could not load the preview — try again shortly.")}</div>
      )}
      <div ref={containerRef} className={`mkt-pdf-pages${layout === "row" ? " mkt-pdf-pages--row" : ""}`} />
    </div>
  );
}

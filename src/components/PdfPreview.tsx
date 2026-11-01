"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const renderVersion = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);

  const renderPages = useCallback(async () => {
    const doc = docRef.current;
    const container = containerRef.current;
    if (!doc || !container) return;
    const version = ++renderVersion.current;

    const dpr = window.devicePixelRatio || 1;
    const cs = window.getComputedStyle(container);
    const paddingX = parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
    // Extra safety margin beyond padding: canvas widths round up slightly and a
    // vertical scrollbar can appear once pages are tall enough to need one, both
    // of which can eat into the row before it's accounted for and force a wrap.
    const frameWidth = (container.clientWidth || 640) - paddingX - 16;
    const perPageWidth = Math.min(frameWidth, 900);
    const pagesToRender = [Math.min(pageNum, doc.numPages)];

    for (const i of pagesToRender) {
      const page = await doc.getPage(i);
      const unscaled = page.getViewport({ scale: 1 });
      // Stack layout must also fit the container width — the side column can be
      // much narrower than a full page render at a fixed zoom, which silently
      // clipped page content left/right under `.mkt-pdf-pages{overflow-x:hidden}`.
      const scale = (perPageWidth * dpr) / unscaled.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;
      canvas.className = "mkt-pdf-page";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `${i} / ${doc.numPages}`);
      canvas.dataset.page = String(i);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      if (version === renderVersion.current && docRef.current === doc) container.replaceChildren(canvas);
    }
  }, [pageNum]);

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
  }, [status, renderPages, isFullscreen]);

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
  }, [status, renderPages, isFullscreen]);

  const restoreFocus = useCallback(() => fullscreenButtonRef.current?.focus(), []);

  useEffect(() => {
    if (!isFullscreen) return;
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      requestAnimationFrame(restoreFocus);
    };
  }, [isFullscreen, restoreFocus]);

  const goToPage = (n: number) => setPageNum(Math.min(Math.max(n, 1), numPages || pageCount));

  const viewer = (
    <div ref={frameRef} className={`mkt-pdf${isFullscreen ? " is-fullscreen" : ""}`}>
      <div className="mkt-pdf-toolbar">
          <div className="mkt-pdf-nav">
            <button className="btn ghost" onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1} aria-label={label("previous page")} title={label("previous page")}>
              <ChevronLeft size={20} />
            </button>
            <span className="dim" aria-live="polite" style={{ fontSize: ".82em" }}>
              {label("page")} {pageNum} / {numPages || pageCount}
            </span>
            <button className="btn ghost" onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= (numPages || pageCount)} aria-label={label("next page")} title={label("next page")}>
              <ChevronRight size={20} />
            </button>
          </div>
        <button ref={fullscreenButtonRef} className="btn ghost" onClick={() => setIsFullscreen(!isFullscreen)} aria-label={label(isFullscreen ? "exit fullscreen" : "fullscreen")} title={label(isFullscreen ? "exit fullscreen" : "fullscreen")}>
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
      {status === "loading" && (
        <div className="mkt-pdf-status dim">{label("Loading preview...")}</div>
      )}
      {status === "error" && (
        <div className="mkt-pdf-status red">{label("could not load the preview — try again shortly.")}</div>
      )}
      <div ref={containerRef} className={`mkt-pdf-pages${layout === "row" ? " mkt-pdf-pages--row" : ""}`}
        tabIndex={0} role="region" aria-label={label("Curriculum Vitae")}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            goToPage(pageNum + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onTouchStart={(event) => {
          touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || !event.changedTouches.length) return;
          const deltaX = event.changedTouches[0].clientX - start.x;
          const deltaY = event.changedTouches[0].clientY - start.y;
          if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            goToPage(pageNum + (deltaX < 0 ? 1 : -1));
          }
        }} />
    </div>
  );
  return isFullscreen ? (
    <dialog ref={dialogRef} className="pdf-reader-dialog" aria-label={label("Curriculum Vitae")}
      onCancel={(event) => { event.preventDefault(); setIsFullscreen(false); }}>
      {viewer}
    </dialog>
  ) : viewer;
}

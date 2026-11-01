"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, ExternalLink, Search, X } from "lucide-react";
import topics from "@/lib/genai.json";
import Link from "next/link";
import { diagramPath, topicPath } from "@/lib/resources";
import { ShareResource } from "./ResourceActions";

type Topic = (typeof topics)[number];

function DiagramViewer({ topic, initialIndex, onClose }: { topic: Topic; initialIndex: number; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [failed, setFailed] = useState(false);
  const slide = topic.slides[index];
  const move = (offset: number) => {
    setIndex((current) => Math.max(0, Math.min(topic.slides.length - 1, current + offset)));
    setFailed(false);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="genai-viewer" aria-labelledby="diagram-title" onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
      <header className="genai-viewer-header">
        <div><span className="section-eyebrow">{topic.title}</span><h2 id="diagram-title">{slide.title}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Close diagram" title="Close diagram" autoFocus><X size={20} /></button>
      </header>
      <div className="genai-full-image">
        {failed ? <p role="alert">This diagram could not load. <a href={slide.src} target="_blank" rel="noopener noreferrer">Open the original</a></p> :
          <Image key={slide.src} src={slide.src} alt={`${topic.title}: ${slide.title}`} fill sizes="96vw" loading="eager" onError={() => setFailed(true)} />}
      </div>
      <footer className="genai-viewer-footer">
        <div className="genai-viewer-nav">
          <ShareResource path={diagramPath(topic.id, slide.src)} />
          <button className="icon-button" disabled={index === 0} onClick={() => move(-1)} aria-label="Previous diagram" title="Previous diagram"><ArrowLeft size={20} /></button>
          <span aria-live="polite">{index + 1} / {topic.slides.length}</span>
          <button className="icon-button" disabled={index === topic.slides.length - 1} onClick={() => move(1)} aria-label="Next diagram" title="Next diagram"><ArrowRight size={20} /></button>
        </div>
        <div className="genai-viewer-nav">
          <a className="icon-button" href={slide.src} target="_blank" rel="noopener noreferrer" aria-label="Open original image" title="Open original image"><ExternalLink size={19} /></a>
          <a className="icon-button" data-track="resource_download" data-resource={diagramPath(topic.id, slide.src)} href={slide.src} download aria-label="Download diagram" title="Download diagram"><Download size={19} /></a>
        </div>
      </footer>
    </dialog>
  );
}

export default function GenAiLibrary({ initialTopicId = "" }: { initialTopicId?: string }) {
  const [topicId, setTopicId] = useState(initialTopicId);
  const [query, setQuery] = useState("");
  const [viewer, setViewer] = useState<{ topic: Topic; index: number } | null>(null);
  const topic = topics.find((item) => item.id === topicId);
  const search = query.trim().toLowerCase();
  const results = (topic ? [topic] : topics).flatMap((group) => group.slides.map((slide, index) => ({ slide, group, index })))
    .filter(({ slide, group }) => `${slide.title} ${group.title}`.toLowerCase().includes(search));

  return (
    <section className="genai-library" aria-labelledby="genai-title">
      <header className="section-header">
        <span className="section-eyebrow">Notes from practice</span>
        <h1 id="genai-title">GenAI fieldnotes</h1>
        <p>From tokens to production systems. A visual collection on retrieval, model architecture, and connected AI.</p>
        {topic && <><Link href={topicPath(topic.id)}>Open collection page</Link><ShareResource path={topicPath(topic.id)} /></>}
      </header>
      <div className="genai-toolbar">
        <label className="genai-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search diagrams</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search diagrams" /></label>
        <label><span className="sr-only">Topic</span><select aria-label="Topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}><option value="">All topics</option>{topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <span className="genai-count" role="status">{!topic && !search ? `${topics.length} topics / ${results.length} diagrams` : `${results.length} diagrams`}</span>
      </div>
      {!topic && !search ? (
        <div className="genai-grid">
          {topics.map((item) => (
            <button className="genai-card" key={item.id} onClick={() => setTopicId(item.id)}>
              <span className="genai-thumbnail"><Image src={item.slides[0].src} alt={`${item.title} overview`} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" /></span>
              <span className="genai-card-body"><span className="genai-card-meta">{item.slides.length} diagrams <ArrowRight size={17} /></span><strong>{item.title}</strong><span>{item.description}</span></span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="genai-topic-heading"><button className="icon-button" onClick={() => { setTopicId(""); setQuery(""); }} aria-label="Back to all topics" title="Back to all topics"><ArrowLeft size={20} /></button><h2>{topic?.title ?? "Search results"}</h2></div>
          {results.length ? <div className="genai-grid">{results.map(({ slide, group, index }) => (
            <button className="genai-card" key={slide.src} onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setViewer({ topic: group, index }); }}>
              <span className="genai-thumbnail"><Image src={slide.src} alt={`${group.title}: ${slide.title}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" /></span>
              <span className="genai-card-body"><span className="genai-card-meta">{group.title} / {String(index + 1).padStart(2, "0")}</span><strong>{slide.title}</strong></span>
            </button>
          ))}</div> : <p className="genai-empty">No diagrams match &quot;{query}&quot;.<button className="btn ghost" onClick={() => setQuery("")}>Clear search</button></p>}
        </>
      )}
      {viewer && <DiagramViewer topic={viewer.topic} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
    </section>
  );
}
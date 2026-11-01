"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, ArrowDownUp, ArrowLeft, ArrowUp, Blocks, ChevronDown, Database, Download, Globe, Layers, Monitor, Network, Pause, Play, Radio, Server, Sparkles, Trophy } from "lucide-react";
import type { CSSProperties } from "react";
import {
  ABOUT_BUILDS,
  ABOUT_STATS,
  ABOUT_STACK,
  ABOUT_TIMELINE,
  CERTS,
  FLASH_NOTIFICATIONS,
  HELP,
  LINKS,
  MARKETPLACE,
  PROJECTS,
  SMARTRECO,
  STACK,
  type Project,
  type ArchitectureNode,
} from "@/lib/content";
import type { MarketplaceDoc } from "@/lib/types";
import topics from "@/lib/genai.json";
import { PdfPreview } from "./PdfPreview";
import BuyForm from "./BuyForm";
import { useLanguage } from "./LanguageProvider";
import Link from "next/link";
import { handbookPath, topicPath } from "@/lib/resources";
import { ShareResource } from "./ResourceActions";
import { track } from "@/lib/analytics";
const GenAiLibrary = dynamic(() => import("./GenAiLibrary"), { loading: () => <p role="status">Loading diagrams...</p> });

export function AboutOutput() {
  const { translate } = useLanguage();
  const [openJob, setOpenJob] = useState(-1);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // reveal each timeline row (and grow its rail line/dot) as it scrolls into view
  useEffect(() => {
    const rows = rowRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (!rows.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            setRevealed((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    rows.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="about-wrap">
      <div className="about-main">
        <div className="about-bio">
          <div className="about-eyebrow">
            <span className="accent-mark">$</span>about<span className="caret" aria-hidden="true" />
          </div>
          <h1 className="about-title">{translate("Architecture to delivery.")}</h1>
          <p className="about-intro">{translate("I'm Ankit, a solution architect and engineer at QVC Group. I build GenAI applications and distributed systems, from full-stack implementation to production.")}</p>
        </div>

        <div className="about-stats">
          {ABOUT_STATS.map((s) => (
            <div className="about-stat" key={s.label}>
              <div className="fig">{translate(s.figure)}</div>
              <div className="lbl">{translate(s.label)}</div>
            </div>
          ))}
        </div>

        <section className="about-achievement" aria-labelledby="smartreco-achievement">
          <Trophy size={24} aria-hidden="true" />
          <div>
            <p className="about-achievement-result">{translate(SMARTRECO.result)} · 2026</p>
            <h2 id="smartreco-achievement">{SMARTRECO.title}</h2>
            <p>{translate(SMARTRECO.summary)}</p>
            <a href={SMARTRECO.url} target="_blank" rel="noopener noreferrer">{translate(SMARTRECO.organizer)}</a>
          </div>
        </section>

        <div className="about-section">
          <div className="about-section-head">
            <div className="mkt-detail-eyebrow">
              <span className="accent-mark">$</span>{translate("What I build")}
            </div>
            <div className="rule" />
          </div>
          <div className="about-builds">
            {ABOUT_BUILDS.map((b) => (
              <div className="about-build" key={b.title}>
                <div className="about-build-title">
                  <span className="dot" />
                  <span>{translate(b.title)}</span>
                </div>
                <div className="about-build-body">{translate(b.body)}</div>
                <div className="about-build-metric">{translate(b.metric)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <div className="about-section-head">
            <div className="mkt-detail-eyebrow">
              <span className="accent-mark">$</span>{translate("Timeline")}
            </div>
            <div className="rule" />
            <span className="hint">2015 &ndash; {translate("Present")}</span>
          </div>
          <div className="about-timeline">
            {ABOUT_TIMELINE.map((job, i) => {
              const open = openJob === i;
              const isRevealed = revealed.has(i);
              const delay = i * 120;
              return (
                <div
                  className={`about-tl-row${open ? " open" : ""}${isRevealed ? " revealed" : ""}`}
                  key={job.role + job.year}
                  data-idx={i}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  style={isRevealed ? { transitionDelay: `${delay}ms` } : undefined}
                >
                  <div className="about-tl-when">
                    <div className="yr">{job.year}</div>
                    <div className="sp">{translate(job.span)}</div>
                  </div>
                  <div className="about-tl-rail">
                    <div className="about-tl-track" />
                    <div className="about-tl-fill" style={isRevealed ? { transitionDelay: `${delay + 100}ms` } : undefined} />
                    <div className="about-tl-dot" style={isRevealed ? { transitionDelay: `${delay + 260}ms` } : undefined} />
                  </div>
                  <div className="about-tl-body">
                    <button
                      className="about-tl-head"
                      onClick={() => setOpenJob(open ? -1 : i)}
                      aria-expanded={open}
                    >
                      <span className="role">{translate(job.role)}</span>
                      <span className="company">{job.company}</span>
                      <span className="place">{job.place}</span>
                      <ChevronDown className="about-role-chevron" size={16} aria-hidden="true" />
                    </button>
                    {open && (
                      <ul className="about-tl-points">
                        {job.points.map((pt) => (
                          <li key={pt}>
                            <span className="dash">—</span>
                            <span>{translate(pt)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="about-section">
          <div className="about-section-head">
            <div className="mkt-detail-eyebrow">
              <span className="accent-mark">$</span>{translate("Tech stack")}
            </div>
            <div className="rule" />
          </div>
          <div className="about-stack-groups">
            {ABOUT_STACK.map((group) => (
              <details className="about-stack-group" key={group.label} open>
                <summary><span>{translate(group.label)}</span><ChevronDown size={16} aria-hidden="true" /></summary>
                <div className="about-tags">
                  {group.items.map((technology) => <span className="about-tag" key={technology}>{technology}</span>)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="about-facts">
        <div className="cell">
          <div className="t">{translate("GERMANY")}</div>
          <div className="d">{translate("Ulm, Germany")}</div>
        </div>
        <div className="cell">
          <div className="t">{translate("NOW")}</div>
          <div className="d">{translate("QVC Group — AI-enabled commerce")}</div>
        </div>
        <div className="cell">
          <div className="t">{translate("OPEN TO")}</div>
          <div className="d">
            {translate("Solution Architect, Senior Engineer roles")} ·{" "}
            <a href="mailto:anand.ankit093@gmail.com">anand.ankit093@gmail.com</a>
          </div>
        </div>
        <div className="cell">
          <div className="d">
            <div className="about-cv-label">{translate("Download CV")}</div>
            <div className="about-cv-langs">
              {CV_LANGS.map((l) => (
                <a key={l.key} className="about-cv-lang" href={l.href} download={l.fileName}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ARCHITECTURE_KINDS = {
  frontend: { label: "Client / frontend", icon: Monitor },
  backend: { label: "Backend / service", icon: Server },
  database: { label: "Database", icon: Database },
  ai: { label: "AI service", icon: Sparkles },
  messaging: { label: "Messaging", icon: Radio },
  external: { label: "External system", icon: Globe },
  library: { label: "Library / retrieval", icon: Blocks },
};

function ArchitectureBlock({ node, step }: { node: ArchitectureNode; step: number }) {
  const { translate } = useLanguage();
  const kind = ARCHITECTURE_KINDS[node.kind];
  return <div className={`work-architecture-node work-architecture-node--${node.kind}`} style={{ "--step": step } as CSSProperties}>
    <div className="work-architecture-kind"><kind.icon size={20} aria-hidden="true" /><span>{translate(kind.label)}</span></div>
    <strong>{translate(node.title)}</strong>
    <span className="work-architecture-detail">{translate(node.detail)}</span>
  </div>;
}

function ProjectFlow({ project }: { project: Project }) {
  const { translate } = useLanguage();
  const [paused, setPaused] = useState(false);
  const controlLabel = translate(paused ? "Play diagram animation" : "Pause diagram animation");
  const { diagram } = project;
  const DirectionIcon = diagram.direction === "both" ? ArrowDownUp : diagram.direction === "response" ? ArrowUp : ArrowDown;
  return (
    <figure className="work-flow" data-paused={paused}>
      <figcaption>
        <span>{translate(project.dir === "genai-delivery-pilot/" ? "Engineering toolchain" : "High-level architecture")}</span>
        <button type="button" className="work-flow-toggle" onClick={() => setPaused(!paused)} aria-label={controlLabel} title={controlLabel}>
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </figcaption>
      <div className="work-architecture">
        <ArchitectureBlock node={diagram.client} step={0} />
        <div className="work-architecture-link" data-direction={diagram.direction} style={{ "--step": 0 } as CSSProperties}>
          <DirectionIcon size={18} aria-hidden="true" /><span>{translate(diagram.connection)}</span>
        </div>
        <ArchitectureBlock node={diagram.service} step={1} />
        {diagram.dependencies.length > 0 && <ul className="work-architecture-branches" style={{ "--branches": diagram.dependencies.length } as CSSProperties}>
          {diagram.dependencies.map((node) => <li key={node.title}>
            <div className="work-architecture-link" style={{ "--step": 1 } as CSSProperties}><ArrowDown size={18} aria-hidden="true" /><span>{translate(node.connection)}</span></div>
            <ArchitectureBlock node={node} step={2} />
          </li>)}
        </ul>}
      </div>
      {diagram.note && <p className="work-architecture-note">{translate(diagram.note)}</p>}
    </figure>
  );
}

export function WorkOutput() {
  const { translate } = useLanguage();
  const filterId = useId();
  const [category, setCategory] = useState("all");
  const groups = [
    { key: "genai", title: "Applied GenAI", description: "Solution architecture for enterprise AI, agent orchestration and proactive recommendations.", icon: Sparkles },
    { key: "fullstack", title: "Full-stack delivery", description: "End-to-end ownership, from solution design and technical direction to production delivery.", icon: Layers },
    { key: "distributed", title: "Distributed systems", description: "Integration architecture, client consulting and technical leadership across commerce and financial systems.", icon: Network },
  ];
  return (
    <section className="work-section">
      <header className="section-header work-header">
        <div><span className="section-eyebrow">{translate("Solution architecture & delivery")}</span><h1>{translate("Work")}</h1></div>
        <div className="work-header-copy">
          <p>{translate("I shape solution architecture, guide engineering teams and stay hands-on through implementation and production delivery.")}</p>
          <p>{translate("My focus: clear technical direction, mentoring engineers and taking solutions from business need to measurable outcomes.")}</p>
        </div>
      </header>
      <div className="work-filter">
        <span className="work-filter-label" id={filterId}>{translate("Focus areas")}</span>
        <div className="work-filter-choices" role="radiogroup" aria-labelledby={filterId}>
          {[{ key: "all", title: "All projects" }, ...groups].map((group) => (
            <label className="work-filter-choice" key={group.key}>
              <input type="radio" name={filterId} value={group.key} checked={category === group.key} onChange={() => setCategory(group.key)} />
              <span>{translate(group.title)}</span>
            </label>
          ))}
        </div>
        <span className="work-filter-count" role="status">{PROJECTS.filter((project) => category === "all" || project.category === category).length} {translate("projects")}</span>
      </div>
      {groups.filter((group) => category === "all" || group.key === category).map((group) => <section className={`work-group work-group--${group.key}`} id={`work-${group.key}`} key={group.key} aria-labelledby={`heading-${group.key}`}>
        <header className="work-group-header">
          <group.icon size={24} aria-hidden="true" />
          <div><h2 id={`heading-${group.key}`}>{translate(group.title)}</h2><p>{translate(group.description)}</p></div>
        </header>
        <div className="work-project-grid">
          {PROJECTS.filter((project) => project.category === group.key).map((project) => <article className="work-project" key={project.dir}>
            <header className="work-project-header">
              <span className="work-project-company">{project.company}</span>
              <h3>{translate(project.name)}</h3>
              <p>{translate(project.desc)}</p>
            </header>
            <p className="work-project-outcome"><span>{translate("Outcome")}</span><strong>{translate(project.metric)}</strong></p>
            <details className="work-row-details work-project-disclosure">
              <summary><span>{translate("Architecture & outcomes")}</span><ChevronDown size={16} aria-hidden="true" /></summary>
              <div className="work-project-expanded">
            <ProjectFlow project={project} />
            <div className="work-project-footer">
              <h4 className="work-stack-heading">{translate("Technologies and patterns")}</h4>
              <ul className="work-row-stack" aria-label={translate("Technologies and patterns")}>
                {project.stack.map((technology) => <li key={technology}>{translate(technology)}</li>)}
              </ul>
                <div className="work-project-details">
                  <div><h4>{translate("Leadership & delivery ownership")}</h4><p>{translate(project.contribution)}</p></div>
                  <div><h4>{translate("Solution architecture")}</h4><p>{translate(project.architecture)}</p></div>
                  <div><h4>{translate("Achievement")}</h4><p>{translate(project.outcome)}</p></div>
                </div>
            </div>
              </div>
            </details>
          </article>)}
        </div>
      </section>)}
    </section>
  );
}

export function StackOutput() {
  const { translate } = useLanguage();
  return (
    <div>
      <div className="head b" style={{ fontSize: "1.15em", marginBottom: 12 }}>{translate("Stack")}</div>
      <div className="grid4">
        {STACK.map(([k, v]) => (
          <div className="cell" key={k}>
            <div className="t">{translate(k).toUpperCase()}</div>
            <div className="d">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CertsOutput() {
  const { translate } = useLanguage();
  return (
    <div>
      <div className="head b" style={{ fontSize: "1.15em", marginBottom: 12 }}>{translate("Certifications")}</div>
      <div className="grid4">
        {CERTS.map(([t, m]) => (
          <div className="cell" key={t}>
            <div className="t">{m}</div>
            <div className="d" style={{ color: "var(--fg)" }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CV_LANGS = [
  { key: "en" as const, label: "EN", href: "/cv/ankit-anand-cv-en.pdf", fileName: "ankit-anand-cv-en.pdf", pageCount: 2 },
  { key: "de" as const, label: "DE", href: "/cv/ankit-anand-cv-de.pdf", fileName: "ankit-anand-cv-de.pdf", pageCount: 2 },
];

export function CvOutput() {
  const { language, translate } = useLanguage();
  const lang = language;
  const active = CV_LANGS.find((l) => l.key === lang) ?? CV_LANGS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="mkt-head">
        <div className="head b" style={{ fontSize: "1.15em" }}>{translate("Curriculum Vitae")}</div>
        <a className="btn primary" href={active.href} download={active.fileName} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Download size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
          {translate("Download CV")}
        </a>
      </div>
      <PdfPreview key={active.key} src={active.href} pageCount={active.pageCount} layout="row" localized />
    </div>
  );
}

export function ContactOutput() {
  const { translate } = useLanguage();
  return (
    <div className="contact-page">
      <div className="head b" style={{ fontSize: "1.15em" }}>{translate("Contact")}</div>
      <div className="contact-intro contact-intro-copy">
        <p style={{ margin: 0 }}>{translate("I'm open to Solution Architect and Senior Engineer opportunities, and conversations about distributed systems, cloud architecture, and applied GenAI.")}</p>
        <p className="dim" style={{ margin: 0 }}>{translate("Tell me a little about your team, the challenge you're working on, and where you think I could help.")}</p>
      </div>
      <a href="mailto:anand.ankit093@gmail.com" style={{ alignSelf: "flex-start", overflowWrap: "anywhere" }} onClick={() => track("email_clicked")}>
        anand.ankit093@gmail.com
      </a>
    </div>
  );
}

export function LinksOutput() {
  return (
    <div className="links-grid">
      {LINKS.map(([k, url, disp]) => {
        const content = <>
          <span className="licon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/icons/${k}.svg`} alt="" width={18} height={18} />
          </span>
          <span className="ltext">
            <span className="green">{k}</span> <span className="dim">{disp}</span>
          </span>
          <span className="dim larrow">↗</span>
        </>;
        return (
          <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="lrow">{content}</a>
        );
      })}
    </div>
  );
}

export function HelpOutput({ onRun }: { onRun: (cmd: string) => void }) {
  const { translate } = useLanguage();
  return (
    <div>
      <div className="dim" style={{ marginBottom: 6 }}>
        {translate("available commands — click or type:")}
      </div>
      {HELP.map(([k, v]) => (
        <div className="kv" key={`${k}-${v}`}>
          <button className="k" onClick={() => onRun(k)}>
            {k}
          </button>
          <span className="v">{translate(v)}</span>
        </div>
      ))}
    </div>
  );
}

export function OffersOutput({
  onRun,
  onAsk,
}: {
  onRun: (cmd: string) => void;
  onAsk: (query: string) => void;
}) {
  const { translate } = useLanguage();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: "70ch" }}>
      <div className="dim">{translate("active flash campaigns powering the live notification rail:")}</div>
      {FLASH_NOTIFICATIONS.map((n) => (
        <div key={n.id} className="cell" style={{ background: "var(--panel)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="green" style={{ fontSize: ".78em", letterSpacing: ".08em" }}>
              {translate(n.badge ?? "UPDATE")}
            </span>
            <span className="head">{translate(n.title)}</span>
          </div>
          <div className="dim" style={{ marginBottom: n.action ? 10 : 0 }}>
            {translate(n.message)}
          </div>
          {n.action && (
            <button
              className="btn ghost"
              style={{ padding: "7px 11px", fontSize: ".8em" }}
              onClick={() => {
                const action = n.action;
                if (!action) return;
                if (action.type === "command") onRun(action.value);
                else if (action.type === "ask") onAsk(action.value);
                else window.open(action.value, action.newTab === false ? "_self" : "_blank", "noopener,noreferrer");
              }}
            >
              {translate(n.action.label)}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function docStatus(doc: MarketplaceDoc): "locked" | "free" {
  return doc.priceCents ? "locked" : "free";
}

const MKT_CARD_GLOW = [
  { glow: "var(--accent)", angle: "215deg" },
  { glow: "var(--amber)", angle: "215deg" },
  { glow: "var(--cyan)", angle: "145deg" },
  { glow: "var(--blue)", angle: "215deg" },
];

function MarketplaceCard({
  doc,
  index,
  onRead,
  onBuy,
}: {
  doc: MarketplaceDoc;
  index: number;
  onRead: (slug: string) => void;
  onBuy: (slug: string) => void;
}) {
  const status = docStatus(doc);
  const meta = MKT_CARD_GLOW[index % MKT_CARD_GLOW.length];
  const price = status === "free" ? "free to read" : `$${(doc.priceCents! / 100).toFixed(2)}`;
  return (
    <div className="wcard mkt-wcard" style={{ "--wglow": meta.glow, "--wangle": meta.angle } as CSSProperties}>
      <div className="mkt-thumbnail">
        <Image src={doc.image} alt={`${doc.title} cover`} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" />
      </div>
      <div className="wtop">
        <span className="wtag">{doc.fileName}</span>
        <span className="wpill">{price}</span>
      </div>
      <div className="wtitle"><Link href={handbookPath(doc.slug)}>{doc.title}</Link></div>
      <div className="wsub">{doc.tags.join(" · ")}</div>
      <div className="mkt-preview-note">Free preview · {doc.freePages} of {doc.pageCount} pages</div>
      <div className="wfoot">
        <span className="mkt-wmeta">{doc.pageCount} pages · {doc.updated}</span>
      </div>
      <div className="mkt-actions">
        <button className="btn ghost" onClick={() => onRead(doc.slug)}>
          read {status === "free" ? "free" : "more"}
        </button>
        {status === "locked" && (
          <button className="btn primary" onClick={() => onBuy(doc.slug)}>
            buy now · ${(doc.priceCents! / 100).toFixed(2)}
          </button>
        )}
      </div>
    </div>
  );
}

function GenAiArticleCard({ topic, onRead, index }: { topic: (typeof topics)[number]; onRead: (topicId: string) => void; index: number }) {
  const meta = MKT_CARD_GLOW[index % MKT_CARD_GLOW.length];
  return (
    <article className="wcard mkt-wcard" style={{ "--wglow": meta.glow, "--wangle": meta.angle } as CSSProperties}>
      <div className="mkt-thumbnail">
        <Image src={topic.slides[0].src} alt={`${topic.title}: ${topic.slides[0].title}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" />
      </div>
      <div className="wtop">
        <span className="wtag">article</span>
        <span className="wpill">free</span>
      </div>
      <div className="wtitle"><Link href={topicPath(topic.id)}>{topic.title}</Link></div>
      <div className="wsub">GenAI · visual diagrams · {topic.slides.length} diagrams</div>
      <div className="mkt-preview-note">Open collection · all diagrams free</div>
      <div className="wfoot">
        <span className="mkt-wmeta">GenAI collection</span>
      </div>
      <div className="mkt-actions">
        <button className="btn ghost" onClick={() => onRead(topic.id)}>read more</button>
      </div>
    </article>
  );
}

function MarketplaceDetail({
  doc,
  onBack,
  onBuy,
}: {
  doc: MarketplaceDoc;
  onBack: () => void;
  onBuy: (slug: string) => void;
}) {
  const status = docStatus(doc);
  const lockedFrom = doc.freePages + 1;
  const price = status === "free" ? "free" : `$${(doc.priceCents! / 100).toFixed(2)}`;
  const ctaLabel = status === "free" ? "download free pdf" : `unlock ${price}`;

  return (
    <div>
      <button className="mkt-back" onClick={onBack}>
        ← back to marketplace
      </button>
      <div className="mkt-detail">
        <article className="mkt-detail-main">
          <div className="mkt-detail-head">
            <h1 className="mkt-detail-title">{doc.title}</h1>
            <p className="mkt-detail-blurb">{doc.description}</p>
            <ShareResource path={handbookPath(doc.slug)} />
            <div className="mkt-detail-meta">
              <span>updated {doc.updated}</span>
              <span className="sep">|</span>
              <span>{doc.pageCount} pages</span>
              <span className="sep">|</span>
              <span>{doc.format}</span>
            </div>
          </div>

          <div className="mkt-detail-divider" />

          <div className="mkt-detail-section">
            <div className="mkt-detail-eyebrow">What this {doc.format} covers</div>
            <p className="mkt-detail-intro">{doc.intro}</p>
          </div>

          <div className="mkt-detail-section">
            <div className="mkt-detail-eyebrow">Contents</div>
            <ol className="mkt-chapters">
              {doc.chapters.map((ch) => (
                <li className="mkt-chapter" key={ch.num}>
                  <span className="num">{ch.num}</span>
                  <span className="title">{ch.title}</span>
                  <span className="pages">{ch.pages}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mkt-detail-section">
            <div className="mkt-detail-eyebrow">Who it&apos;s for</div>
            <ul className="mkt-audience">
              {doc.audience.map((row) => (
                <li key={row}>
                  <span className="dot">·</span>
                  <span>{row}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="mkt-detail-side">
          <div className="mkt-price-box">
            <div className="mkt-price">
              <span className="amt">{price}</span>
              <span className="note">{status === "free" ? "" : "one-time"}</span>
            </div>
            {status === "free" ? (
              <a className="btn primary" href={`/api/download/${doc.slug}`}>
                {ctaLabel}
              </a>
            ) : (
              <button className="btn primary" onClick={() => onBuy(doc.slug)}>
                {ctaLabel}
              </button>
            )}
            <div className="mkt-detail-divider" />
            <ul className="mkt-price-feats">
              {status === "free" ? (
                <li>instant download · no account required</li>
              ) : (
                <li>pay via PayPal by email · PDF delivered to your inbox</li>
              )}
            </ul>
          </div>

          <div className="mkt-preview">
            <div className="mkt-preview-head">
              <div className="mkt-detail-eyebrow">Free preview</div>
              <span className="dim" style={{ fontSize: ".78em" }}>
                {status === "free" ? `all ${doc.pageCount} pages` : `pages 1–${doc.freePages} of ${doc.pageCount}`}
              </span>
            </div>
            <PdfPreview src={`/api/marketplace/preview/${doc.slug}`} pageCount={doc.freePages} />
            {status === "locked" && (
              <div className="mkt-unlock-box">
                <span>pages {lockedFrom}–{doc.pageCount} are locked.</span>
                <button className="btn ghost" onClick={() => onBuy(doc.slug)}>
                  unlock {price}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function MarketplaceOutput({ initialSlug, initialView }: { initialSlug?: string; initialView?: "cards" | "detail" } = {}) {
  const [view, setView] = useState<"cards" | "detail" | "genai">(initialView ?? (initialSlug ? "detail" : "cards"));
  const [filter, setFilter] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(initialSlug || MARKETPLACE[0]?.slug || "");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [buyTarget, setBuyTarget] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      MARKETPLACE.filter(
        (d) =>
          d.fileName.toLowerCase().includes(filter.toLowerCase()) ||
          d.title.toLowerCase().includes(filter.toLowerCase()),
      ),
    [filter],
  );
  const filteredTopics = useMemo(
    () => topics.filter((topic) => `${topic.title} ${topic.description} genai diagrams`.toLowerCase().includes(filter.trim().toLowerCase())),
    [filter],
  );

  const selectedDoc = MARKETPLACE.find((d) => d.slug === selectedSlug) ?? MARKETPLACE[0];
  const buyDoc = buyTarget ? MARKETPLACE.find((d) => d.slug === buyTarget) : null;

  const openDetail = (slug: string) => {
    setSelectedSlug(slug);
    setView("detail");
  };

  const openTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setView("genai");
  };

  return (
    <div lang="en" translate="no" data-marketplace style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {view === "cards" && (
        <div className="mkt-head">
          <div>
            <div className="mkt-title">
              <span>$</span>
              <span>marketplace</span>
            </div>
          </div>
          <div className="mkt-controls">
            <div className="mkt-filter">
              <span>grep</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="filter…"
                aria-label="filter documents"
              />
            </div>
          </div>
        </div>
      )}

      {view === "cards" ? (
        <div>
          <div className="mkt-lsline">
            <span>ls ~/marketplace</span>
            <span>{filtered.length + filteredTopics.length} of {MARKETPLACE.length + topics.length} articles</span>
          </div>
          <div className="mkt-grid" style={{ marginTop: 12 }}>
            {filtered.map((doc, i) => (
              <MarketplaceCard
                key={doc.slug}
                doc={doc}
                index={i}
                onRead={openDetail}
                onBuy={(slug) => { track("checkout_opened", { resource: slug }); setBuyTarget(slug); }}
              />
            ))}
            {filteredTopics.map((topic, i) => (
              <GenAiArticleCard key={topic.id} topic={topic} index={filtered.length + i} onRead={openTopic} />
            ))}
          </div>
        </div>
      ) : view === "genai" ? (
        <div>
          <div className="genai-topic-heading">
            <button className="icon-button" onClick={() => setView("cards")} aria-label="Back to Marketplace" title="Back to Marketplace"><ArrowLeft size={20} /></button>
            <span className="mkt-doc-path">~/marketplace/genai</span>
          </div>
          <GenAiLibrary initialTopicId={selectedTopicId} />
        </div>
      ) : (
        selectedDoc && (
          <MarketplaceDetail
            doc={selectedDoc}
            onBack={() => setView("cards")}
            onBuy={(slug) => { track("checkout_opened", { resource: slug }); setBuyTarget(slug); }}
          />
        )
      )}
      {buyDoc && (
        <BuyForm doc={buyDoc} onClose={() => setBuyTarget(null)} />
      )}
    </div>
  );
}


export function NotFoundOutput({ cmd, onRun }: { cmd: string; onRun: (cmd: string) => void }) {
  const { translate } = useLanguage();
  return (
    <div className="red">
      bash: {cmd}: {translate("command not found — try")}{" "}
      <span className="green" style={{ cursor: "pointer" }} onClick={() => onRun("help")}>
        help
      </span>
    </div>
  );
}

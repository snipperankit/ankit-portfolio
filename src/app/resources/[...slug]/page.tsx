import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { diagramPath, findResource, resourceParams, siteUrl, topicPath } from "@/lib/resources";
import { HandbookPreview, ShareResource } from "@/components/ResourceActions";

type Props = { params: Promise<{ slug: string[] }> };
export const generateStaticParams = resourceParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resource = findResource((await params).slug);
  if (!resource) notFound();
  return {
    title: `${resource.title} | Ankit Anand`, description: resource.description,
    alternates: { canonical: resource.path },
    openGraph: { title: resource.title, description: resource.description, url: resource.path, type: "article", images: [{ url: `/api/resource-image?path=${encodeURIComponent(resource.path)}`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: resource.title, description: resource.description, images: [`/api/resource-image?path=${encodeURIComponent(resource.path)}`] },
  };
}

export default async function ResourcePage({ params }: Props) {
  const resource = findResource((await params).slug);
  if (!resource) notFound();
  const structured = { "@context": "https://schema.org", "@type": resource.kind === "diagram" ? "ImageObject" : "CreativeWork", name: resource.title, description: resource.description, url: `${siteUrl}${resource.path}`, inLanguage: "en", ...(resource.kind === "diagram" ? { contentUrl: `${siteUrl}${resource.image}` } : {}) };
  return <article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <header className="section-header"><h1>{resource.title}</h1><p>{resource.description}</p><ShareResource path={resource.path} /></header>
    {resource.kind === "handbook" ? <>
      <p>{resource.doc.intro}</p><p>{resource.doc.pageCount} pages · Updated {resource.doc.updated}</p>
      <h2>Contents</h2><ol>{resource.doc.chapters.map((chapter) => <li key={chapter.num}>{chapter.title} <span className="dim">({chapter.pages})</span></li>)}</ol>
      <h2>Who it is for</h2><ul>{resource.doc.audience.map((item) => <li key={item}>{item}</li>)}</ul>
      <HandbookPreview doc={resource.doc} />
    </> : resource.kind === "topic" ? <div className="genai-grid">
      {resource.topic.slides.map((slide) => <Link className="genai-card" key={slide.src} href={diagramPath(resource.topic.id, slide.src)}>
        <span className="genai-thumbnail"><Image src={slide.src} alt={`${resource.topic.title}: ${slide.title}`} fill sizes="(max-width: 640px) 100vw, 33vw" /></span>
        <span className="genai-card-body"><strong>{slide.title}</strong></span>
      </Link>)}
    </div> : <>
      <a href={resource.slide.src} target="_blank" rel="noopener noreferrer" aria-label="Open full-size diagram">
        <Image className="resource-diagram" src={resource.slide.src} alt={resource.title} width={1600} height={1000} sizes="(max-width: 1000px) 100vw, 1000px" priority />
      </a>
      <a className="btn ghost" data-track="resource_download" data-resource={resource.path} href={resource.slide.src} download><Download size={16} /> Download original</a>
      <h2>More in {resource.topic.title}</h2>
      <Link href={topicPath(resource.topic.id)}>View the full collection</Link>
      <ul>{resource.topic.slides.filter((slide) => slide.src !== resource.slide.src).map((slide) => <li key={slide.src}><Link href={diagramPath(resource.topic.id, slide.src)}>{slide.title}</Link></li>)}</ul>
    </>}
  </article>;
}
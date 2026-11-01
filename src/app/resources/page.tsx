import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import topics from "@/lib/genai.json";
import { MARKETPLACE } from "@/lib/content";
import { handbookPath, topicPath } from "@/lib/resources";

export const metadata: Metadata = {
  title: "GenAI diagrams and technical handbooks | Ankit Anand",
  description: "Explore free diagrams on RAG, embeddings, chunking, MCP and Transformers, plus preview technical handbooks.",
  alternates: { canonical: "/resources" },
};

export default function Resources() {
  return <>
    <header className="section-header"><h1>Diagrams & handbooks</h1><p>Visual references for applied AI and distributed systems. Read the diagrams freely; preview handbooks before purchasing.</p></header>
    <div className="genai-grid">
      {topics.map((topic) => <Link className="genai-card" key={topic.id} href={topicPath(topic.id)}>
        <span className="genai-thumbnail"><Image src={topic.slides[0].src} alt={`${topic.title} overview`} fill sizes="(max-width: 640px) 100vw, 33vw" /></span>
        <span className="genai-card-body"><strong>{topic.title}</strong><span>{topic.description}</span><span>{topic.slides.length} free diagrams</span></span>
      </Link>)}
      {MARKETPLACE.map((doc) => <Link className="genai-card" key={doc.slug} href={handbookPath(doc.slug)}>
        <span className="genai-thumbnail"><Image src={doc.image} alt={doc.title} fill sizes="(max-width: 640px) 100vw, 33vw" /></span>
        <span className="genai-card-body"><strong>{doc.title}</strong><span>{doc.description}</span><span>{doc.pageCount} pages · Free preview</span></span>
      </Link>)}
    </div>
  </>;
}
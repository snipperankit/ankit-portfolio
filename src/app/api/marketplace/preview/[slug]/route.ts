import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { MARKETPLACE } from "@/lib/content";
import { readProtectedFile } from "@/lib/downloads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// generated previews never change per slug, so keep them in memory across requests
const previewCache = new Map<string, Uint8Array>();

async function buildPreview(doc: (typeof MARKETPLACE)[number]) {
  const cached = previewCache.get(doc.slug);
  if (cached) return cached;

  const bytes = await readProtectedFile(doc.fileName);
  const source = await PDFDocument.load(bytes);
  const preview = await PDFDocument.create();
  const pageCount = Math.min(doc.freePages, source.getPageCount());
  const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
  const pages = await preview.copyPages(source, pageIndices);
  pages.forEach((page) => preview.addPage(page));

  const previewBytes = await preview.save();
  previewCache.set(doc.slug, previewBytes);
  return previewBytes;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const doc = MARKETPLACE.find((item) => item.slug === slug);
  if (!doc) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }

  try {
    const previewBytes = await buildPreview(doc);
    return new NextResponse(Buffer.from(previewBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${doc.slug}-preview.pdf"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "This preview is being prepared. Please check back soon." },
      { status: 404 },
    );
  }
}

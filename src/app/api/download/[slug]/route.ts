import { NextRequest, NextResponse } from "next/server";
import { DOWNLOADS } from "@/lib/content";
import { readProtectedFile } from "@/lib/downloads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_DOWNLOADS_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(ip: string, slug: string) {
  const key = `${ip}:${slug}`;
  const now = Date.now();
  const validAttempts = (attempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (validAttempts.length >= MAX_DOWNLOADS_PER_WINDOW) {
    attempts.set(key, validAttempts);
    return true;
  }

  attempts.set(key, [...validAttempts, now]);
  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const resource = DOWNLOADS.find((item) => item.slug === slug);

  if (!resource) {
    return NextResponse.json({ error: "download not found" }, { status: 404 });
  }

  if (resource.priceCents) {
    return NextResponse.json(
      {
        error:
          "this handbook is sold by email — write to anand.ankit093@gmail.com to receive a PayPal payment link; the PDF is delivered to your inbox after payment",
      },
      { status: 402 },
    );
  }

  if (isRateLimited(clientIp(req), resource.slug)) {
    return NextResponse.json(
      { error: "download limit reached; please try again in a few minutes" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(WINDOW_MS / 1000)),
        },
      },
    );
  }

  try {
    const file = await readProtectedFile(resource.fileName);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resource.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "This free download is being prepared. Please check back soon.",
      },
      { status: 404 },
    );
  }
}

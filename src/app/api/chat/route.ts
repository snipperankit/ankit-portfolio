import { NextRequest, NextResponse } from "next/server";
import { PERSONA } from "../../../lib/content";
import { portfolioReply } from "../../../lib/portfolio-reply";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_SYSTEM_LENGTH = 20000;
const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "user" || v.role === "assistant") &&
    typeof v.content === "string" &&
    v.content.length > 0 &&
    v.content.length <= MAX_MESSAGE_LENGTH
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const {
    system,
    messages,
    language = "en",
  } = (body ?? {}) as {
    system?: unknown;
    messages?: unknown;
    language?: unknown;
  };

  if (language !== "en" && language !== "de") {
    return NextResponse.json({ error: "invalid language" }, { status: 400 });
  }
  if (typeof system !== "string" || system.length > MAX_SYSTEM_LENGTH) {
    return NextResponse.json(
      { error: "invalid system prompt" },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES
  ) {
    return NextResponse.json({ error: "invalid messages" }, { status: 400 });
  }
  if (!messages.every(isChatMessage)) {
    return NextResponse.json(
      { error: "invalid message shape" },
      { status: 400 },
    );
  }

  const latestQuestion =
    messages.filter((message) => message.role === "user").at(-1)?.content ?? "";
  const fallback = portfolioReply(latestQuestion, language);
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return NextResponse.json({ reply: fallback });
  }
  const model = process.env.CLOUDFLARE_AI_MODEL || DEFAULT_MODEL;

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: "POST",
        signal: AbortSignal.timeout(12000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `${PERSONA}\nRespond in ${language === "de" ? "German (informal du)" : "English"}. For scheduling, direct visitors to anand.ankit093@gmail.com.`,
            },
            ...messages,
          ],
          max_tokens: 1000,
        }),
      },
    );

    if (!res.ok) {
      return NextResponse.json({ reply: fallback });
    }

    const data = await res.json();
    const reply =
      typeof data?.result?.response === "string"
        ? data.result.response.trim()
        : "";

    return NextResponse.json({ reply: reply || fallback });
  } catch {
    return NextResponse.json({ reply: fallback });
  }
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function request(question: string, language = "en") {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: "Portfolio assistant",
      messages: [{ role: "user", content: question }],
      language,
    }),
  });
}

describe("chat route Next.js compatibility", () => {
  it("answers SmartReco questions without credentials or network calls", async () => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request("Tell me about your hackathon"));
    const { reply } = await response.json();
    expect(reply).toContain("Portfolio facts (live AI is offline)");
    expect(reply).toContain("2nd");
    expect(reply).toContain("77 tests");
    expect(reply).toContain("ChromaDB");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("includes missing CV skills in factual stack answers", async () => {
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
    const { reply } = await (
      await POST(request("What is your tech stack?"))
    ).json();
    for (const skill of [
      "Java 21",
      "MyBatis",
      "JPA",
      "Spinnaker",
      "MySQL",
      "Grafana",
      "Spring Reactive",
    ]) {
      expect(reply).toContain(skill);
    }
  });

  it("returns localized hackathon facts in German", async () => {
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
    const { reply } = await (
      await POST(request("Was hast du für SmartReco entwickelt?", "de"))
    ).json();
    expect(reply).toContain("Portfolio-Fakten");
    expect(reply).toContain("2. Platz");
    expect(reply).toContain("77 Tests");
    expect(reply).not.toContain("Placed 2nd");
  });

  it("does not invent answers to unsupported questions", async () => {
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
    const { reply } = await (
      await POST(request("What is your expected salary?"))
    ).json();
    expect(reply).toContain("don't have a verified answer");
  });

  it.each(["http", "empty", "network"])(
    "falls back on provider %s failures",
    async (failure) => {
      vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account");
      vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-token");
      vi.stubGlobal(
        "fetch",
        failure === "network"
          ? vi.fn().mockRejectedValue(new Error("timeout"))
          : vi
              .fn()
              .mockResolvedValue(
                failure === "http"
                  ? new Response("", { status: 503 })
                  : Response.json({ result: { response: " " } }),
              ),
      );
      const { reply } = await (await POST(request("SmartReco"))).json();
      expect(reply).toContain("77 tests");
      expect(reply).toContain("live AI is offline");
    },
  );

  it("uses server-owned facts and preserves successful AI replies", async () => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ result: { response: "A grounded reply." } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    expect(await (await POST(request("SmartReco"))).json()).toEqual({
      reply: "A grounded reply.",
    });
    const options = fetchMock.mock.calls[0][1];
    expect(JSON.parse(options.body).messages[0].content).toContain(
      "SmartReco Build Challenge 2026",
    );
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/chat", {
        method: "POST",
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid json" });
  });

  it.each(["en", "de"])(
    "returns a safe fallback without credentials in %s",
    async (language) => {
      vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
      vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
      const response = await POST(
        new NextRequest("http://localhost/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: "Portfolio assistant",
            messages: [{ role: "user", content: "Hello" }],
            language,
          }),
        }),
      );
      expect(response.status).toBe(200);
      expect((await response.json()).reply).toContain(
        "anand.ankit093@gmail.com",
      );
    },
  );
});

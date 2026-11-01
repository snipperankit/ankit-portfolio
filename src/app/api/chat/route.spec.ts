import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

afterEach(() => vi.unstubAllEnvs());

describe("chat route Next.js compatibility", () => {
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

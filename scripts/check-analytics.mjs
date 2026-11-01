import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const output = ts.transpileModule(readFileSync(new URL("../src/lib/analytics.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ consent = null, privacy = {}, domain = "example.com", debug = false, storageFails = false } = {}) {
  const exports = {};
  const requests = [];
  const events = [];
  vm.runInNewContext(output, {
    exports, URL,
    process: { env: { NODE_ENV: "production", NEXT_PUBLIC_ANALYTICS_DOMAIN: domain, NEXT_PUBLIC_ANALYTICS_DEBUG: String(debug) } },
    navigator: privacy,
    localStorage: { getItem() { if (storageFails) throw new Error("blocked"); return consent; } },
    document: { documentElement: { lang: "de" } },
    window: { location: { href: "https://example.com/?email=private%40example.com&session_id=secret#private" }, dispatchEvent(event) { events.push(event.detail); } },
    CustomEvent: class { constructor(name, options) { this.detail = options.detail; } },
    fetch(url, options) { requests.push({ url, ...options }); return Promise.resolve(); },
  });
  return { ...exports, requests, events };
}

test("analytics requires configuration and consent, and honors privacy signals", () => {
  for (const options of [{}, { consent: "deny" }, { consent: "allow", domain: "" }, { consent: "allow", storageFails: true }, { consent: "allow", privacy: { doNotTrack: "1" } }, { consent: "allow", privacy: { globalPrivacyControl: true } }]) {
    const analytics = setup(options);
    analytics.track("pageview");
    assert.equal(analytics.requests.length, 0);
  }
});

test("events exclude URL queries, hashes and unsupported properties", () => {
  const analytics = setup({ consent: "allow" });
  analytics.track("checkout_started", { resource: "kafka-systems-field-guide", section: "contact", email: "private@example.com", message: "secret" });
  assert.equal(analytics.requests.length, 1);
  const request = analytics.requests[0];
  const payload = JSON.parse(request.body);
  assert.deepEqual(payload, { n: "checkout_started", u: "https://example.com/", d: "example.com", props: { language: "de", resource: "kafka-systems-field-guide", section: "contact" } });
  assert.equal(request.credentials, "omit");
  assert.equal(request.referrerPolicy, "no-referrer");
  analytics.track("private@example.com");
  assert.equal(analytics.requests.length, 1);
});

test("free text is rejected and debug mode never sends network events", () => {
  const analytics = setup({ consent: "allow", debug: true });
  analytics.track("resource_share", { section: "my private question", resource: "private@example.com" });
  assert.equal(analytics.requests.length, 0);
  assert.equal(analytics.events.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(analytics.events[0].props)), { language: "de" });
});
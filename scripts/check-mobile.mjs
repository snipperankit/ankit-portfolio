import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require("../.tsupgrader/runtime-validation/node_modules/playwright");
const output = new URL("../.tsupgrader/runtime-validation/mobile/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const session = await context.newCDPSession(page);

async function swipe(locator, horizontal, vertical = 0) {
  await locator.scrollIntoViewIfNeeded();
  const bounds = await locator.boundingBox();
  const startX = bounds.x + bounds.width / 2 - horizontal / 2;
  const startY = bounds.y + Math.min(bounds.height / 2, 180) - vertical / 2;
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: startX, y: startY }] });
  for (let step = 1; step <= 8; step++) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: startX + horizontal * step / 8, y: startY + vertical * step / 8 }] });
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function pixels(locator) {
  const image = await locator.screenshot();
  return page.evaluate(async (bytes) => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: "image/png" }));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const drawing = canvas.getContext("2d");
    drawing.drawImage(bitmap, 0, 0);
    const data = drawing.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set();
    let checksum = 0;
    for (let index = 0; index < data.length; index += 16) {
      colors.add(`${data[index] >> 4},${data[index + 1] >> 4},${data[index + 2] >> 4}`);
      checksum = (checksum + data[index] * (index + 1) + data[index + 1]) % 2147483647;
    }
    return { colors: colors.size, checksum, width: canvas.width, height: canvas.height };
  }, [...image]);
}

async function assertLayout(cardCount = 7, groupCount = 3) {
  const result = await page.evaluate(() => {
    const content = document.querySelector("#content");
    const cards = [...document.querySelectorAll(".work-project")];
    return {
      width: innerWidth,
      offenders: [...document.querySelectorAll(".work-project *")].filter((element) => element.scrollWidth > element.clientWidth + 1).slice(0, 6).map((element) => ({ className: element.className, width: element.clientWidth, scroll: element.scrollWidth })),
      overflow: Math.max(document.documentElement.scrollWidth - innerWidth, content.scrollWidth - content.clientWidth),
      clipped: cards.filter((card) => card.scrollWidth > card.clientWidth + 1).length,
      count: cards.length,
      groups: document.querySelectorAll(".work-group").length,
      nodes: document.querySelectorAll(".work-architecture-node").length,
      links: document.querySelectorAll(".work-architecture-link").length,
    };
  });
  assert.equal(result.overflow, 0, JSON.stringify(result));
  assert.equal(result.clipped, 0, JSON.stringify(result));
  assert.equal(result.count, cardCount);
  assert.equal(result.groups, groupCount);
  assert.ok(result.nodes >= cardCount * 2);
  assert.equal(result.links, result.nodes - cardCount);
}

try {
  await page.goto(process.env.TEST_URL || "http://localhost:3000/");
  await page.locator(".desk-canvas[data-ready]").waitFor({ timeout: 60000 });
  assert.equal(await page.locator(".desk-tease-touch").isVisible(), true);
  assert.equal(await page.locator(".desk-tease-mouse").isVisible(), false);
  assert.equal(await page.locator(".desk-tease-touch").textContent(), "Whatever you do, don't swipe the desk.");
  await page.setViewportSize({ width: 320, height: 740 });
  const hintBounds = await page.locator(".desk-tease").boundingBox();
  const canvasBounds = await page.locator(".desk-canvas").boundingBox();
  assert.ok(hintBounds.x >= 0 && hintBounds.x + hintBounds.width <= 320);
  assert.ok(hintBounds.y >= canvasBounds.y + canvasBounds.height - 1, "Hint must stay below the canvas");
  await page.locator(".desk-canvas").evaluate((element) => { element.dataset.fallback = "true"; });
  assert.equal(await page.locator(".desk-tease").isVisible(), false);
  await page.locator(".desk-canvas").evaluate((element) => { delete element.dataset.fallback; });
  await page.setViewportSize({ width: 390, height: 844 });
  const scene = page.locator(".desk-canvas canvas");
  const before = await pixels(scene);
  assert.ok(before.colors > 20, `Scene is blank: ${JSON.stringify(before)}`);
  await swipe(scene, -130);
  const after = await pixels(scene);
  assert.notEqual(after.checksum, before.checksum, "Finger drag must rotate the scene");
  await swipe(scene, 0, 100);
  const tilted = await pixels(scene);
  assert.notEqual(tilted.checksum, after.checksum, "Vertical finger drag must tilt the scene");
  await page.screenshot({ path: new URL("home-phone.png", output).pathname.replace(/^\/(\w:)/, "$1") });
  console.log("PASS phone scene: nonblank, horizontal and vertical touch rotation");

  const skipTour = page.getByRole("button", { name: "Skip", exact: true });
  if (await skipTour.isVisible()) await skipTour.click();
  assert.equal(await page.locator(".desk-tease svg").isVisible(), true);
  await page.screenshot({ path: new URL("home-phone.png", output).pathname.replace(/^\/(\w:)/, "$1") });
  await page.locator("#ask-launch").click();
  await page.getByRole("button", { name: "What did you build for SmartReco?", exact: true }).click();
  await page.locator("#ask .m:not(.you) .tx").filter({ hasText: "77 tests" }).waitFor();
  assert.match(await page.locator("#ask .m:not(.you) .tx").last().textContent(), /Portfolio facts/);
  await page.locator("#ask").getByRole("button", { name: "Close", exact: true }).click();
  console.log("PASS chatbot: SmartReco suggestion returns labelled facts without AI credentials");
  await page.getByRole("button", { name: "About", exact: true }).click();
  assert.equal(await page.locator(".about-achievement-result").textContent(), "2nd place · 2026");
  assert.equal(await page.locator(".about-stack-group").count(), 6);
  for (const skill of ["Java 21", "MyBatis", "MySQL", "JPA", "Spinnaker", "Grafana", "Spring Reactive", "Spring Cloud", "Express (Node.js)", "Apache Tomcat", "GitHub Copilot"]) {
    assert.equal(await page.locator(".about-tag").filter({ hasText: new RegExp(`^${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }).count(), 1);
  }
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    assert.equal(await page.locator("#content").evaluate((element) => element.scrollWidth - element.clientWidth), 0);
    await page.locator(".about-stack-group summary").first().click();
    assert.equal(await page.locator(".about-stack-group").first().getAttribute("open"), null);
    await page.locator(".about-stack-group summary").first().click();
    await page.locator(".about-achievement").scrollIntoViewIfNeeded();
    await page.screenshot({ path: new URL(`about-${width}.png`, output).pathname.replace(/^\/(\w:)/, "$1") });
  }
  await page.getByRole("button", { name: "Deutsch", exact: true }).click();
  assert.equal(await page.locator(".about-achievement-result").textContent(), "2. Platz · 2026");
  await page.getByRole("button", { name: "English", exact: true }).click();
  console.log("PASS About: SmartReco achievement, complete grouped CV skills, collapse and 320-1440px layout");
  await page.getByRole("button", { name: "Work", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const projectDiagrams = page.locator(".work-project-disclosure");
  const expectedComponents = [
    ["Web app / Telegram", "LangGraph backend", "ChromaDB", "BM25", "Mesh API"],
    ["React frontend", "Chatbot backend", "Azure Cosmos DB", "Azure OpenAI", "Confluence / SharePoint"],
    ["Inventory notifications", "LangGraph / CrewAI", "SKN / SKU data"],
    ["GitHub Copilot", "Custom MCP servers"],
    ["Carrier partner portal", "Logistics microservices", "Cost-allocation library"],
    ["TikTok Shop", "Java / Spring Boot", "Apache Kafka", "Commerce services"],
    ["Trading client systems", "Apache Camel", "Freemarker", "Email alerts"],
  ];
  for (let index = 0; index < await projectDiagrams.count(); index++) {
    const disclosure = projectDiagrams.nth(index);
    await disclosure.locator("summary").click();
    const diagram = disclosure.locator(".work-flow");
    assert.deepEqual(await diagram.locator(".work-architecture-node strong").allTextContents(), expectedComponents[index]);
    const nodeCount = expectedComponents[index].length;
    await diagram.locator(".work-architecture-node").first().evaluate(async (element) => {
      const animation = element.getAnimations()[0];
      if (!animation) throw new Error("Missing stage animation");
      await animation.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    assert.equal(await diagram.locator(".work-architecture-link").count(), nodeCount - 1);
    assert.equal(await diagram.locator(".work-architecture-node").first().evaluate((element) => element.getAnimations()[0].playState), "running");
    const direction = await diagram.locator(".work-architecture-link[data-direction]").evaluate((element) => ({ direction: element.dataset.direction, animation: getComputedStyle(element, "::after").animationDirection }));
    assert.equal(direction.animation, direction.direction === "response" ? "reverse" : direction.direction === "both" ? "alternate" : "normal");
    const startTime = await diagram.locator(".work-architecture-node").first().evaluate((element) => element.getAnimations()[0].currentTime);
    await page.waitForFunction(({ index, startTime }) => document.querySelectorAll(".work-flow")[index].querySelector(".work-architecture-node").getAnimations()[0].currentTime > startTime + 50, { index, startTime });
    await diagram.getByRole("button", { name: "Pause diagram animation" }).click();
    const pausedTimes = await diagram.evaluate(async (element) => {
      const animations = element.getAnimations({ subtree: true });
      await Promise.all(animations.map((animation) => animation.ready));
      if (animations.some((animation) => animation.playState !== "paused")) throw new Error("All diagram animations must pause");
      return animations.map((animation) => animation.currentTime);
    });
    assert.equal(pausedTimes.length, nodeCount * 2 - 1);
    await diagram.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.deepEqual(await diagram.evaluate((element) => element.getAnimations({ subtree: true }).map((animation) => animation.currentTime)), pausedTimes);
    await diagram.getByRole("button", { name: "Play diagram animation" }).click();
    assert.equal(await diagram.locator(".work-architecture-node").first().evaluate((element) => element.getAnimations()[0].playState), "running");
    await disclosure.locator("summary").click();
    assert.equal(await diagram.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
  }
  await projectDiagrams.first().locator("summary").click();
  for (const width of [390, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator(".work-flow").first().scrollIntoViewIfNeeded();
    await assertLayout();
    await page.screenshot({ path: new URL(`work-animated-${width}.png`, output).pathname.replace(/^\/(\w:)/, "$1") });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.locator(".work-flow-toggle").first().isVisible(), false);
  assert.equal(await page.locator(".work-flow").first().evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
  await projectDiagrams.first().locator("summary").click();
  console.log("PASS all 7 diagrams: advancing animations, pause/resume, closed-state cleanup and reduced motion");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await assertLayout();
    assert.equal(await page.locator(".work-project-disclosure[open]").count(), 0);
    await page.screenshot({ path: new URL(`work-${width}.png`, output).pathname.replace(/^\/(\w:)/, "$1") });
    const disclosure = page.locator(".work-project-disclosure summary").first();
    await disclosure.focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".work-project-disclosure[open]").count(), 1);
    assert.equal(await page.locator(".work-flow").first().isVisible(), true);
    await assertLayout();
    await page.screenshot({ path: new URL(`work-expanded-${width}.png`, output).pathname.replace(/^\/(\w:)/, "$1") });
    await disclosure.press("Space");
    assert.equal(await page.locator(".work-project-disclosure[open]").count(), 0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const allCategories = page.locator('.work-filter-choice input[value="all"]');
  await allCategories.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator('.work-filter-choice input[value="genai"]').isChecked(), true);
  await assertLayout(3, 1);
  await page.keyboard.press("ArrowLeft");
  assert.equal(await allCategories.isChecked(), true);
  for (const category of ["genai", "fullstack", "distributed"]) {
    await page.locator(`.work-filter-choice`).filter({ has: page.locator(`input[value="${category}"]`) }).click();
    assert.equal(await page.locator(`.work-filter-choice input[value="${category}"]`).isChecked(), true);
    const expectedCount = category === "genai" ? 3 : 2;
    await assertLayout(expectedCount, 1);
    assert.equal(await page.locator(`.work-group--${category}`).count(), 1);
    assert.equal(await page.locator(".work-filter-count").textContent(), `${expectedCount} projects`);
  }
  await page.getByRole("radio", { name: "All projects", exact: true }).check();
  await page.locator(".work-row-details summary").first().click();
  assert.equal(await page.locator(".work-row-details[open]").count(), 1);
  await page.getByRole("button", { name: "Deutsch", exact: true }).click();
  await assertLayout();
  assert.equal(await page.getByRole("radio", { name: "Alle Projekte", exact: true }).isChecked(), true);
  await page.locator('.work-filter-choice input[value="fullstack"]').check();
  await assertLayout(2, 1);
  assert.equal(await page.locator(".work-filter-count").textContent(), "2 Projekte");
  await page.getByRole("radio", { name: "Alle Projekte", exact: true }).check();
  await page.setViewportSize({ width: 320, height: 844 });
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    await assertLayout();
    const filter = page.locator(".work-filter");
    await filter.scrollIntoViewIfNeeded();
    const appearance = await page.locator(".work-filter-choice input:checked + span").evaluate((element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return { color: style.color, accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(), height: bounds.height, overflow: element.scrollWidth - element.clientWidth };
    });
    assert.ok(appearance.height >= 44);
    assert.equal(appearance.overflow, 0);
    await page.screenshot({ path: new URL(`work-filter-${theme}-320-de.png`, output).pathname.replace(/^\/(\w:)/, "$1") });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "English", exact: true }).click();
  console.log("PASS category segments: touch selection, arrow keys, DE at 320px and both themes");
  console.log("PASS Work: category filtering, technical component diagrams, keyboard expand/collapse, no overflow at 320-1440px, DE/EN");

  await page.getByRole("button", { name: "CV", exact: true }).click();
  await page.locator('canvas[data-page="1"]').waitFor();
  assert.ok((await pixels(page.locator(".mkt-pdf-page"))).colors > 20, "CV must render real PDF pixels");
  assert.equal(await page.getByRole("button", { name: "previous page", exact: true }).isDisabled(), true);
  await swipe(page.locator(".mkt-pdf-pages"), -140);
  await page.locator('canvas[data-page="2"]').waitFor();
  assert.equal(await page.getByRole("button", { name: "next page", exact: true }).isDisabled(), true);
  await swipe(page.locator(".mkt-pdf-pages"), 140);
  await page.locator('canvas[data-page="1"]').waitFor();
  await swipe(page.locator(".mkt-pdf-pages"), 10, -100);
  assert.equal(await page.locator('canvas[data-page="1"]').count(), 1, "Vertical scrolling must not turn pages");
  await page.getByRole("button", { name: "fullscreen", exact: true }).click();
  await page.locator("dialog[open] canvas").waitFor();
  const bounds = await page.locator("dialog[open]").boundingBox();
  assert.equal(bounds.width, 390);
  assert.equal(bounds.height, 844);
  await swipe(page.locator("dialog .mkt-pdf-pages"), -140);
  await page.locator('dialog canvas[data-page="2"]').waitFor();
  await page.screenshot({ path: new URL("cv-fullscreen-phone.png", output).pathname.replace(/^\/(\w:)/, "$1") });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  await page.locator('canvas[data-page="2"]').waitFor();
  assert.equal(await page.getByRole("button", { name: "fullscreen", exact: true }).evaluate((element) => element === document.activeElement), true);
  await page.getByRole("button", { name: "Deutsch", exact: true }).click();
  await page.locator('canvas[data-page="1"]').waitFor();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.waitForFunction(() => {
    const canvas = document.querySelector(".mkt-pdf-page");
    return canvas && canvas.getBoundingClientRect().right <= innerWidth;
  });
  assert.ok((await pixels(page.locator(".mkt-pdf-page"))).colors > 20);
  console.log("PASS CV: real PDF, both swipe directions, scroll isolation, full-window modal, Escape/focus, DE and live resize");

  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.locator(".desk-canvas[data-ready]").waitFor();
  assert.ok((await pixels(scene)).colors > 20, "Desktop scene must be nonblank");
  await page.screenshot({ path: new URL("home-desktop.png", output).pathname.replace(/^\/(\w:)/, "$1") });
  assert.deepEqual(errors, [], "No browser runtime errors");
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(process.env.TEST_URL || "http://localhost:3000/");
  await desktopPage.locator(".desk-canvas[data-ready]").waitFor({ timeout: 60000 });
  assert.equal(await desktopPage.locator(".desk-tease-mouse").isVisible(), true);
  assert.equal(await desktopPage.locator(".desk-tease-touch").isVisible(), false);
  assert.equal(await desktopPage.locator(".desk-tease-mouse").textContent(), "Whatever you do, don't drag the desk.");
  const desktopSkip = desktopPage.getByRole("button", { name: "Skip", exact: true });
  if (await desktopSkip.isVisible()) await desktopSkip.click();
  await desktopPage.getByRole("button", { name: "Deutsch", exact: true }).click();
  assert.equal(await desktopPage.locator(".desk-tease-mouse").textContent(), "Bloß nicht am Schreibtisch ziehen.");
  await desktopPage.screenshot({ path: new URL("desk-hint-desktop.png", output).pathname.replace(/^\/(\w:)/, "$1") });
  await desktop.close();
  console.log("PASS desk hint: touch/mouse wording, German, 320px fit and fallback visibility");
  console.log("PASS desktop scene and browser runtime; screenshots in .tsupgrader/runtime-validation/mobile");
} finally {
  await browser.close();
}
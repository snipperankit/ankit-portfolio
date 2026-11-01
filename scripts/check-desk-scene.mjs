import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import * as THREE from "three";
import ts from "typescript";
import postcss from "postcss";

const loadDependency = createRequire(import.meta.url);
const labels = [];
const backgrounds = [];
const drawing = new Proxy({
  fillText(text) { labels.push(text); },
  fillRect() { backgrounds.push(this.fillStyle); },
  measureText(text) { return { width: (text ?? "").length * 9 }; },
  createLinearGradient() { return { addColorStop() {} }; },
}, {
  get(target, property) { return property in target ? target[property] : () => {}; },
});
const documentStub = { createElement: () => ({ width: 0, height: 0, getContext: () => drawing }) };

function loadSource(path, extra = "") {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source + extra, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    document: documentStub,
    Image: class {},
    require(name) {
      if (name === "three") return THREE;
      if (name === "./DeskWorkflow") return loadSource("../src/components/DeskWorkflow.ts");
      if (name === "three/addons/controls/OrbitControls.js") return {};
      return loadDependency(name);
    },
  });
  return compiledModule.exports;
}

test("caricature has expressive proportions, glasses and finite geometry in both modes", () => {
  const { buildDesk } = loadSource("../src/components/DeskScene.tsx", "\nexport { buildDesk };");
  for (const preview of [false, true]) {
    const desk = buildDesk(preview);
    assert.equal(desk.head.scale.x, 1.36);
    assert.ok(desk.head.getObjectByName("glasses-frame--1"));
    assert.ok(desk.head.getObjectByName("glasses-frame-1"));
    const desktop = desk.root.getObjectByName("rounded-desktop");
    assert.ok(desktop);
    assert.equal(desktop.geometry.type, "ExtrudeGeometry");
    assert.equal(desktop.geometry.parameters.options.bevelEnabled, true);
    assert.equal(desk.eyes.length, 2);
    assert.equal(desk.root.getObjectByName("tailored-jacket").geometry.type, "LatheGeometry");
    assert.ok(desk.root.getObjectByName("crew-neck-shirt"));
    assert.ok(desk.root.getObjectByName("jacket-collar-1"));
    assert.ok(desk.head.getObjectByName("sculpted-face"));
    for (let lock = 0; lock < 6; lock++) {
      assert.equal(desk.head.getObjectByName(`swept-hair-${lock}`).geometry.type, "SphereGeometry");
    }
    assert.equal(Boolean(desk.workflow), preview);
    for (const elapsed of [0, 1.5, 4.6, 6]) desk.generate(elapsed);
    desk.root.updateMatrixWorld(true);
    const monitor = desk.root.getObjectByName("monitor").getWorldPosition(new THREE.Vector3());
    const board = desk.board.getWorldPosition(new THREE.Vector3());
    assert.ok(board.z < monitor.z, "board must be physically behind the monitor");
    const bounds = new THREE.Box3().setFromObject(desk.root);
    assert.ok(!bounds.isEmpty());
    desk.root.traverse((object) => {
      assert.ok(object.matrixWorld.elements.every(Number.isFinite));
      const positions = object.geometry?.getAttribute("position");
      if (positions) assert.ok(positions.array.every(Number.isFinite));
    });
    desk.disposeSources();
  }
});

test("senior engineer caricature draws in without a door or walk-in", () => {
  const { buildDesk } = loadSource("../src/components/DeskScene.tsx", "\nexport { buildDesk };");
  const production = buildDesk(false);
  const preview = buildDesk(true, true);
  assert.ok(production.head.getObjectByName("swept-hair-0"));
  assert.ok(production.head.getObjectByName("sculpted-face"));
  for (const desk of [production, preview]) {
    assert.equal(desk.root.getObjectByName("studio-door"), undefined, "door must not be built");
    assert.equal(desk.root.getObjectByName("walking-developer"), undefined, "walker must not be built");
  }
  assert.equal(preview.head.getObjectByName("swept-hair-0"), undefined);
  assert.equal(preview.head.getObjectByName("sculpted-face"), undefined);
  for (const name of ["senior-face", "trimmed-beard", "moustache", "senior-hair-crown", "silver-temple-1", "senior-sweep", "brow-line-0", "brow-line-1"]) {
    const object = preview.root.getObjectByName(name);
    assert.ok(object, `${name} must exist in the preview`);
    if (object.geometry) assert.ok(object.geometry.getAttribute("position").array.every(Number.isFinite));
  }
  assert.equal(preview.generate(0), false, "sketch is still drawing in at t=0");
  assert.equal(preview.generate(3), false, "sketch is not finished mid-way through");
  assert.equal(preview.generate(4.6), true, "sketch has fully drawn in by 4.6s");
  assert.equal(preview.generate(6), true, "stays revealed once fully drawn");
  production.disposeSources();
  preview.disposeSources();
});

test("sketch keeps material programs stable and caps monitor texture updates", () => {
  const { buildDesk } = loadSource("../src/components/DeskScene.tsx", "\nexport { buildDesk };");
  const desk = buildDesk(true, true);
  const materials = new Map();
  assert.equal(desk.screen.map.image.width, 480);
  assert.equal(desk.screen.map.image.height, 300);
  assert.equal(desk.screen.map.generateMipmaps, false);
  desk.root.traverse((object) => {
    if (object.material) materials.set(object.material, object.material.version);
  });
  for (const time of [0.5, 1.5, 3, 4.6, 6]) desk.generate(time);
  for (const [material, version] of materials) assert.equal(material.version, version);
  const version = desk.screen.map.version;
  desk.generate(6.01);
  assert.equal(desk.screen.map.version, version);
  desk.generate(6.04);
  assert.ok(desk.screen.map.version > version);
  desk.disposeSources();
});

test("character gestures remain bounded, blink briefly and pause typing", () => {
  const { deskMotionAt } = loadSource("../src/components/DeskScene.tsx");
  assert.equal(deskMotionAt(0).blink, 1);
  assert.equal(deskMotionAt(0).turn, 0);
  assert.ok(deskMotionAt(4.95).blink < 0.1);
  assert.ok(deskMotionAt(5.2).blink > 0.99);
  assert.equal(deskMotionAt(5).typing, 0);
  assert.equal(deskMotionAt(7).typing, 1);
  for (let time = 0; time <= 120; time += 0.05) {
    const gesture = deskMotionAt(time);
    assert.ok(Object.values(gesture).every(Number.isFinite));
    // wider bound during the ~6.5-9.5s post-reveal left-right-left settle sweep, tight bound otherwise
    const inIntroSweep = time > 6.5 && time < 9.5;
    assert.ok(Math.abs(gesture.turn) <= (inIntroSweep ? 0.57 : 0.14));
    assert.ok(gesture.blink >= 0.079 && gesture.blink <= 1);
    assert.ok(gesture.typing >= 0 && gesture.typing <= 1);
  }
});

test("board labels survive missing icons, motion is throttled and themes remain green", () => {
  labels.length = 0;
  const { createDeskWorkflow } = loadSource("../src/components/DeskWorkflow.ts");
  const board = createDeskWorkflow();
  assert.equal(board.texture.image.width, 768);
  assert.equal(board.texture.image.height, 240);
  assert.equal(board.texture.generateMipmaps, false);
  assert.deepEqual([...new Set(labels)], ["Jira", "Docker", "Kubernetes", "Azure", "AWS", "ML", "GenAI", "GenAI Ops"]);
  assert.ok(backgrounds.includes("#111a15"));
  let version = board.texture.version;
  board.update(1, false, true);
  assert.ok(board.texture.version > version);
  version = board.texture.version;
  board.update(1.01, false, true);
  assert.equal(board.texture.version, version);
  for (const time of [3.2, 4.3, 6.7, 9.2, 14.7]) board.update(time, false, true);
  board.update(7, false, false);
  version = board.texture.version;
  board.update(9, false, false);
  assert.equal(board.texture.version, version);
  board.update(9, true, false);
  assert.ok(backgrounds.includes("#e9eee6"));
  assert.ok(board.texture.version > version);
  board.dispose();
  version = board.texture.version;
  board.update(10, false, true);
  assert.equal(board.texture.version, version);
});

test("mockup preserves site tokens and sends preview controls into the frame", () => {
  const html = readFileSync(new URL("../public/mockups/hero-workflow.html", import.meta.url), "utf8");
  assert.ok(html.includes("/?heroPreview=systems"));
  assert.ok(html.includes("revision=character-08"));
  assert.ok(html.includes("characterPreview=walk-in"));
  assert.ok(!/01 \/ PLAN|wf-stage-title|character-file|--accent:/.test(html));
  for (const match of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) postcss.parse(match[1]);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const elements = new Map();
  const events = [];
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, { style: {}, checked: true, addEventListener() {} });
    return elements.get(id);
  };
  const frameDocument = { readyState: "loading", documentElement: { dataset: {} } };
  class FrameEvent {
    constructor(type, options) { this.type = type; this.detail = options.detail; }
  }
  getElement("preview").contentDocument = frameDocument;
  getElement("preview").contentWindow = { CustomEvent: FrameEvent, dispatchEvent: (event) => events.push(event) };
  const sandbox = vm.createContext({
    document: {
      getElementById: getElement,
      querySelector: () => ({ getBoundingClientRect: () => ({ width: 720 }) }),
      querySelectorAll: () => [],
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    ResizeObserver: class { observe() {} },
    setTimeout() {},
  });
  vm.runInContext(script, sandbox);
  assert.equal(getElement("artboard").style.width, "720px");
  vm.runInContext('viewport = "mobile"; fitArtboard(); theme = "light"; applySettings();', sandbox);
  assert.equal(getElement("artboard").style.width, "390px");
  assert.equal(frameDocument.documentElement.dataset.theme, "light");
  getElement("background-toggle").checked = false;
  getElement("motion-toggle").checked = false;
  vm.runInContext("applySettings()", sandbox);
  assert.ok(events.at(-1) instanceof FrameEvent);
  assert.equal(events.at(-1).type, "desk-workflow-preview");
  assert.equal(events.at(-1).detail.visible, false);
  assert.equal(events.at(-1).detail.moving, false);
});
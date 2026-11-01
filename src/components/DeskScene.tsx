"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createDeskWorkflow } from "./DeskWorkflow";
import { useLanguage } from "./LanguageProvider";

type Point = [number, number, number];

// painted on the underside of the desktop slab, only visible once the scene is rotated to a bottom-up view
const FLIP_LINES = [
  "Stop messing with me — just flip me.",
  "Bad manners... at least ask before you flip me.",
  "Easy! I'm a desk, not a pancake.",
  "Flip responsibly, my coffee's about to slide off.",
  "Careful — the plant's watching you spin me.",
];

export function deskMotionAt(time: number) {
  const cycle = time % 6.8;
  // a clean blink every 2s, independent of the longer typing/turn cycle above
  const blinkCycle = time % 2;
  const blink = 1 - Math.sin(THREE.MathUtils.clamp(blinkCycle / 0.18, 0, 1) * Math.PI) * 0.92;
  const typing = 1 - THREE.MathUtils.smoothstep(cycle, 4.1, 4.5);
  const reveal = THREE.MathUtils.smootherstep(time, 3.5, 6.5);
  // one-shot post-reveal flourish: swings left-to-right then right-to-left, settling frontal
  const sweep = THREE.MathUtils.clamp((time - 6.5) / 3, 0, 1);
  const introSweep = Math.sin(sweep * Math.PI * 2) * 0.42;
  return {
    blink,
    typing,
    turn: Math.sin(time * 0.14) * 0.14 * reveal + introSweep,
    glance: Math.sin(time * 0.48) * 0.04,
    breathe: Math.sin(time * 1.5) * 0.005,
  };
}

function buildDesk(previewWorkflow: boolean, previewCharacter = false) {
  const root = new THREE.Group();
  const workflow = previewWorkflow ? createDeskWorkflow() : null;
  const stages: { group: THREE.Group; start: number; duration: number }[] = [];
  function stage(name: string, start: number, duration: number) {
    const group = new THREE.Group();
    group.name = name;
    root.add(group);
    stages.push({ group, start, duration });
    return group;
  }
  let assembly = stage("desk", previewCharacter ? 0.9 : 0, 1.15);
  const ink = new THREE.MeshStandardMaterial({ color: "#cfcec4", roughness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: "#24261f", roughness: 0.72 });
  const green = new THREE.MeshStandardMaterial({ color: "#95af99", roughness: 1 });
  const skin = new THREE.MeshStandardMaterial({ color: previewCharacter ? "#c68f63" : "#d6a07c", roughness: 0.82 });
  const hairMaterial = new THREE.MeshStandardMaterial({ color: previewCharacter ? "#15130f" : "#493022", roughness: 0.9 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: "#f5efe1", roughness: 0.4 });
  const iris = new THREE.MeshStandardMaterial({ color: "#67896e", roughness: 0.45 });
  const pupil = new THREE.MeshStandardMaterial({ color: "#161b18", roughness: 0.3 });
  const glasses = new THREE.MeshStandardMaterial({ color: "#28312c", roughness: 0.4, metalness: 0.15 });
  const desktop = new THREE.MeshStandardMaterial({ color: "#84998a", roughness: 0.62, metalness: 0.08 });
  const frameMetal = new THREE.MeshStandardMaterial({ color: "#343e39", roughness: 0.48, metalness: 0.45 });
  const trousers = new THREE.MeshStandardMaterial({ color: "#535952", roughness: 1 });
  const gold = new THREE.MeshStandardMaterial({ color: "#e2ba5b", roughness: 0.65 });
  const bulb = new THREE.MeshStandardMaterial({ color: "#f4f2e8", emissive: "#ffc440", emissiveIntensity: 0 });
  const outline = new THREE.LineBasicMaterial({ color: "#f4f2e8", transparent: true, opacity: 0.7 });
  const contour = new THREE.MeshBasicMaterial({ color: "#f4f2e8", side: THREE.BackSide });
  const textures: THREE.Texture[] = [];
  const hatchCanvas = document.createElement("canvas");
  hatchCanvas.width = hatchCanvas.height = 128;
  const hatchContext = hatchCanvas.getContext("2d");
  if (hatchContext) {
    hatchContext.fillStyle = "#ffffff";
    hatchContext.fillRect(0, 0, 128, 128);
    hatchContext.strokeStyle = "#bfc2bd";
    hatchContext.lineWidth = 0.65;
    for (let stroke = -128; stroke < 256; stroke += 9) {
      hatchContext.beginPath();
      hatchContext.moveTo(stroke, 0);
      hatchContext.bezierCurveTo(stroke + 39, 45, stroke + 91, 79, stroke + 128, 128);
      hatchContext.stroke();
    }
    const hatch = new THREE.CanvasTexture(hatchCanvas);
    hatch.wrapS = hatch.wrapT = THREE.RepeatWrapping;
    hatch.colorSpace = THREE.SRGBColorSpace;
    textures.push(hatch);
    for (const material of [ink, dark, green, trousers]) {
      material.map = hatch;
      material.roughness = 1;
    }
  }

  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 480;
  screenCanvas.height = 300;
  const screenContext = screenCanvas.getContext("2d");
  screenContext?.scale(0.5, 0.5);
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.generateMipmaps = false;
  screenTexture.minFilter = THREE.LinearFilter;
  textures.push(screenTexture);
  const screen = new THREE.MeshPhysicalMaterial({
    map: screenTexture,
    emissiveMap: screenTexture,
    emissive: "#ffffff",
    emissiveIntensity: 0.5,
    roughness: 0.22,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const screenPrograms: { indent: number; tokens: [string, string][] }[][] = [
    [
      { indent: 0, tokens: [["const", "#8fd9c9"], [" pipeline ", "#d7dbd2"], ["=", "#d7dbd2"], [" createPipeline", "#f2c675"], ["();", "#d7dbd2"]] },
      { indent: 1, tokens: [["await", "#8fd9c9"], [" deploy", "#f2c675"], ["(service, {", "#d7dbd2"]] },
      { indent: 2, tokens: [["region", "#9fb4ff"], [": ", "#d7dbd2"], ["\"eu-central\"", "#e3a06b"], [",", "#d7dbd2"]] },
      { indent: 2, tokens: [["replicas", "#9fb4ff"], [": ", "#d7dbd2"], ["6", "#e3a06b"], [",", "#d7dbd2"]] },
      { indent: 1, tokens: [["});", "#d7dbd2"]] },
      { indent: 0, tokens: [["// ship it", "#5c6b60"]] },
      { indent: 0, tokens: [["export", "#8fd9c9"], [" default pipeline;", "#d7dbd2"]] },
    ],
    [
      { indent: 0, tokens: [["export", "#8fd9c9"], [" async function ", "#d7dbd2"], ["healthCheck", "#f2c675"], ["() {", "#d7dbd2"]] },
      { indent: 1, tokens: [["const", "#8fd9c9"], [" status ", "#d7dbd2"], ["=", "#d7dbd2"], [" await probe", "#f2c675"], ["(endpoint);", "#d7dbd2"]] },
      { indent: 1, tokens: [["if", "#8fd9c9"], [" (status.ok) ", "#d7dbd2"], ["return", "#8fd9c9"], [" status;", "#d7dbd2"]] },
      { indent: 1, tokens: [["throw new", "#8fd9c9"], [" Error", "#f2c675"], ["(", "#d7dbd2"], ["\"unhealthy\"", "#e3a06b"], [");", "#d7dbd2"]] },
      { indent: 0, tokens: [["}", "#d7dbd2"]] },
      { indent: 0, tokens: [["// 200 OK", "#5c6b60"]] },
    ],
  ];
  function measureLineWidth(context: CanvasRenderingContext2D, tokens: [string, string][]) {
    return tokens.reduce((total, [text]) => total + context.measureText(text).width, 0);
  }
  // pacing for the perpetual type -> hold -> fade -> retype loop; step/dur mirror the
  // original one-shot intro cadence so the first pass still lines up with the ~4.6s "seated" beat
  const TYPE_STEP = 0.14;
  const TYPE_DUR = 0.3;
  const HOLD = 2.2;
  const FADE = 0.5;
  const INTRO_START = 3.5;
  const cycleLength = (program: { indent: number; tokens: [string, string][] }[]) =>
    program.length * TYPE_STEP + TYPE_DUR + HOLD + FADE;
  const loopPeriod = Math.max(...screenPrograms.map(cycleLength));
  let screenFrame = -1;
  function updateScreen(time: number) {
    const frame = Math.floor(time * 30);
    if (!screenContext || frame === screenFrame) return;
    screenFrame = frame;
    const width = 960;
    const height = 600;
    const backdrop = screenContext.createLinearGradient(0, 0, 0, height);
    backdrop.addColorStop(0, "#121b16");
    backdrop.addColorStop(1, "#0a0f0c");
    screenContext.fillStyle = backdrop;
    screenContext.fillRect(0, 0, width, height);
    screenContext.fillStyle = "#182019";
    screenContext.fillRect(0, 0, width, 46);
    const dotColors = ["#e08585", "#e0c185", "#8fd98f"];
    for (let dot = 0; dot < 3; dot++) {
      screenContext.beginPath();
      screenContext.arc(26 + dot * 26, 23, 7, 0, Math.PI * 2);
      screenContext.fillStyle = dotColors[dot];
      screenContext.fill();
    }
    screenContext.fillStyle = "#0e1512";
    screenContext.fillRect(0, 46, 64, height - 46);
    screenContext.font = "600 34px ui-monospace, Menlo, monospace";
    screenContext.textBaseline = "middle";
    const lineHeight = 68;
    const startY = 96;

    // program cycles forever on a repeating type -> hold -> fade schedule so the monitors
    // always read as actively-being-written code, not a one-shot animation that goes stale
    const sinceIntro = time - INTRO_START;
    let program: { indent: number; tokens: [string, string][] }[] | null = null;
    let localT = 0;
    let fade = 0;
    if (sinceIntro >= 0) {
      const loopIndex = Math.floor(sinceIntro / loopPeriod);
      localT = sinceIntro - loopIndex * loopPeriod;
      program = screenPrograms[loopIndex % screenPrograms.length];
      const fadeStart = loopPeriod - FADE;
      fade = localT > fadeStart ? THREE.MathUtils.smoothstep(localT, fadeStart, loopPeriod) : 0;
    }

    let lastCaretX = 0;
    let lastCaretY = 0;
    let stillTyping = false;
    for (let row = 0; program && row < program.length; row++) {
      const onset = row * TYPE_STEP;
      const progress = THREE.MathUtils.smoothstep(localT, onset, onset + TYPE_DUR);
      if (progress <= 0) continue;
      const y = startY + row * lineHeight;
      const alpha = 1 - fade;
      screenContext.globalAlpha = alpha;
      screenContext.fillStyle = "#42524a";
      screenContext.fillText(String(row + 1).padStart(2, "0"), 18, y);
      const line = program[row];
      const left = 82 + line.indent * 38;
      const lineWidth = measureLineWidth(screenContext, line.tokens);
      screenContext.save();
      screenContext.beginPath();
      screenContext.rect(0, y - lineHeight / 2, left + lineWidth * progress, lineHeight);
      screenContext.clip();
      let x = left;
      for (const [text, color] of line.tokens) {
        screenContext.fillStyle = color;
        screenContext.fillText(text, x, y);
        x += screenContext.measureText(text).width;
      }
      screenContext.restore();
      screenContext.globalAlpha = 1;
      if (progress < 1) stillTyping = true;
      lastCaretX = left + lineWidth * progress;
      lastCaretY = y;
    }
    // a caret keeps blinking at the write-head even while idle between keystrokes, so the
    // screen reads as "live" instead of freezing once the current line finishes typing
    if (program && fade < 1 && Math.sin(time * (stillTyping ? 8 : 3)) > 0) {
      screenContext.globalAlpha = 1 - fade;
      screenContext.fillStyle = "#d7ffe6";
      screenContext.fillRect(lastCaretX + 2, lastCaretY - 22, 3, 44);
      screenContext.globalAlpha = 1;
    }
    // soft diagonal sheen to sell a glossy glass panel over the code, independent of scene lighting
    const glare = screenContext.createLinearGradient(0, 0, width, height * 0.7);
    glare.addColorStop(0, "rgba(255,255,255,0.09)");
    glare.addColorStop(0.35, "rgba(255,255,255,0.02)");
    glare.addColorStop(0.5, "rgba(255,255,255,0)");
    screenContext.fillStyle = glare;
    screenContext.fillRect(0, 0, width, height);
    screenTexture.needsUpdate = true;
  }

  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, position: Point, parent: THREE.Object3D = assembly, edged = false) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.castShadow = true;
    object.receiveShadow = true;
    if (edged) object.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), outline));
    else if ([ink, dark, green, trousers].includes(material as THREE.MeshStandardMaterial)) {
      const silhouette = new THREE.Mesh(geometry, contour);
      silhouette.scale.setScalar(1.025);
      object.add(silhouette);
    }
    parent.add(object);
    return object;
  }
  function box(size: Point, position: Point, material: THREE.Material = dark, parent: THREE.Object3D = assembly) {
    return mesh(new THREE.BoxGeometry(...size), material, position, parent, true);
  }
  function sphere(radius: number, position: Point, material = ink, parent: THREE.Object3D = assembly) {
    return mesh(new THREE.SphereGeometry(radius, 24, 16), material, position, parent);
  }
  function roundedSlab(width: number, depth: number, thickness: number, position: Point, material: THREE.Material, parent: THREE.Object3D = assembly) {
    const shape = new THREE.Shape();
    const radius = Math.min(0.12, width / 5, depth / 5);
    shape.moveTo(-width / 2 + radius, -depth / 2);
    shape.lineTo(width / 2 - radius, -depth / 2);
    shape.quadraticCurveTo(width / 2, -depth / 2, width / 2, -depth / 2 + radius);
    shape.lineTo(width / 2, depth / 2 - radius);
    shape.quadraticCurveTo(width / 2, depth / 2, width / 2 - radius, depth / 2);
    shape.lineTo(-width / 2 + radius, depth / 2);
    shape.quadraticCurveTo(-width / 2, depth / 2, -width / 2, depth / 2 - radius);
    shape.lineTo(-width / 2, -depth / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -depth / 2, -width / 2 + radius, -depth / 2);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.015, bevelThickness: 0.012, curveSegments: 8 });
    geometry.translate(0, 0, -thickness / 2);
    geometry.rotateX(-Math.PI / 2);
    return mesh(geometry, material, position, parent);
  }
  // camera-facing rounded slab (screens, bezels, boards) - same corner treatment as
  // roundedSlab but extruded toward the viewer instead of lying flat on the desk
  function roundedPanel(width: number, height: number, thickness: number, position: Point, material: THREE.Material, parent: THREE.Object3D = assembly) {
    const shape = new THREE.Shape();
    const radius = Math.min(0.05, width / 8, height / 8);
    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
    // no bevel: bevelThickness would push the front face further out than `thickness`,
    // which is what previously let bezels/housings occlude the screen/diagram planes behind them
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, steps: 1, curveSegments: 8 });
    geometry.translate(0, 0, -thickness / 2);
    return mesh(geometry, material, position, parent);
  }
  function rod(start: Point, end: Point, radius: number, material = ink, parent: THREE.Object3D = assembly) {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const object = mesh(new THREE.CylinderGeometry(radius, radius, from.distanceTo(to), 12), material, [0, 0, 0], parent);
    object.position.copy(from).add(to).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.sub(from).normalize());
    return object;
  }
  function limb(start: Point, end: Point, radius: number, material: THREE.MeshStandardMaterial, parent: THREE.Object3D = assembly) {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const object = mesh(new THREE.CapsuleGeometry(radius, Math.max(0.01, from.distanceTo(to) - radius * 2), 8, 20), material, [0, 0, 0], parent);
    object.position.copy(from).add(to).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.sub(from).normalize());
    return object;
  }

  const deskTop = roundedSlab(4.45, 1.78, 0.12, [-0.4, 1.55, 0], desktop);
  deskTop.name = "rounded-desktop";
  const flipHintCanvas = document.createElement("canvas");
  flipHintCanvas.width = 1024;
  flipHintCanvas.height = 384;
  const flipHintContext = flipHintCanvas.getContext("2d");
  if (flipHintContext) {
    const message = FLIP_LINES[Math.floor(Math.random() * FLIP_LINES.length)];
    flipHintContext.font = "italic 600 58px Georgia, serif";
    flipHintContext.textAlign = "center";
    flipHintContext.textBaseline = "middle";
    flipHintContext.fillStyle = "#f4ede0";
    // simple greedy word-wrap so long lines break across two rows instead of overflowing the plane
    const words = message.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && flipHintContext.measureText(candidate).width > flipHintCanvas.width - 100) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    const lineHeight = 68;
    const startY = flipHintCanvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((text, index) => flipHintContext.fillText(text, flipHintCanvas.width / 2, startY + index * lineHeight));
  }
  const flipHintTexture = new THREE.CanvasTexture(flipHintCanvas);
  flipHintTexture.colorSpace = THREE.SRGBColorSpace;
  textures.push(flipHintTexture);
  const flipHintPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 1.5),
    new THREE.MeshBasicMaterial({
      map: flipHintTexture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    }),
  );
  flipHintPlane.rotation.x = Math.PI / 2;
  flipHintPlane.position.set(0, -0.065, 0);
  flipHintPlane.renderOrder = 5;
  flipHintPlane.name = "flip-hint";
  deskTop.add(flipHintPlane);
  roundedSlab(4.27, 1.62, 0.065, [-0.4, 1.46, 0], frameMetal);
  for (const horizontal of [-2.18, 1.38]) {
    const support = roundedSlab(0.2, 1.42, 0.085, [horizontal, 0.1, 0], frameMetal);
    support.name = `desk-foot-${horizontal}`;
    mesh(new THREE.BoxGeometry(0.13, 1.32, 0.24), frameMetal, [horizontal, 0.8, -0.15]);
    roundedSlab(0.26, 1.36, 0.065, [horizontal, 1.4, 0], frameMetal);
  }
  mesh(new THREE.BoxGeometry(3.5, 0.16, 0.13), frameMetal, [-0.4, 1.32, -0.53]);
  roundedSlab(3.08, 0.84, 0.014, [-0.17, 1.626, 0.13], dark);
  roundedSlab(0.44, 0.34, 0.045, [1.22, 1.66, 0.4], green);
  const mouse = sphere(0.09, [1.18, 1.682, 0.38], ink);
  mouse.scale.set(0.8, 0.42, 1.2);

  assembly = stage("workstation", previewCharacter ? 1.55 : 0.85, 1.15);
  const laptop = new THREE.Group();
  laptop.name = "laptop";
  laptop.position.set(-0.83, 1.65, -0.02);
  laptop.rotation.y = 0.12;
  assembly.add(laptop);
  roundedSlab(1.03, 0.68, 0.03, [0, 0, 0], dark, laptop);
  box([0.8, 0.008, 0.24], [0, 0.03, -0.07], ink, laptop);
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 10; column++) box([0.055, 0.009, 0.04], [-0.34 + column * 0.075, 0.038, -0.14 + row * 0.07], dark, laptop);
  }
  box([0.26, 0.01, 0.14], [0, 0.027, 0.22], ink, laptop);
  const lid = new THREE.Group();
  lid.position.set(0, 0.025, -0.32);
  lid.rotation.x = -0.18;
  laptop.add(lid);
  roundedPanel(1.0, 0.63, 0.022, [0, 0.345, 0], dark, lid);
  roundedPanel(0.965, 0.6, 0.007, [0, 0.345, 0.014], screen, lid);

  const monitor = new THREE.Group();
  monitor.name = "monitor";
  monitor.position.set(0.5, 1.62, -0.39);
  assembly.add(monitor);
  roundedSlab(0.4, 0.26, 0.02, [0, 0, 0], dark, monitor);
  rod([0, 0.02, 0], [0, 0.44, 0], 0.032, ink, monitor);
  roundedPanel(1.04, 0.68, 0.028, [0, 0.72, 0], dark, monitor);
  roundedPanel(1.01, 0.65, 0.007, [0, 0.72, 0.017], screen, monitor);
  const keyboard = new THREE.Group();
  keyboard.name = "keyboard";
  keyboard.position.set(0.5, 1.64, 0.4);
  assembly.add(keyboard);
  roundedSlab(0.8, 0.38, 0.025, [0, 0, 0], dark, keyboard);
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 10; column++) box([0.06, 0.012, 0.055], [-0.34 + column * 0.075, 0.025, -0.13 + row * 0.08], ink, keyboard);
  }

  assembly = stage("planning-board", previewCharacter ? 1.25 : 0.45, 1.4);
  const board = new THREE.Group();
  board.name = "planning-board";
  board.position.set(-0.4, 2.9, -1.02);
  if (workflow) {
    board.position.y = 3.12;
    board.scale.set(1.16, 1.25, 1);
  }
  assembly.add(board);
  const paper = new THREE.MeshStandardMaterial({ color: workflow ? "#15241a" : "#eeeee5", roughness: 1 });
  // thin unibody display housing with rounded corners, replaces the old thick picture-frame border
  roundedPanel(3.9, 1.24, 0.032, [0, 0, -0.008], paper, board);
  const boardCanvas = document.createElement("canvas");
  const boardResolution = 2;
  boardCanvas.width = 1536 * boardResolution;
  boardCanvas.height = 480 * boardResolution;
  const boardContext = boardCanvas.getContext("2d");
  boardContext?.scale(boardResolution, boardResolution);
  if (boardContext && !workflow) {
    boardContext.fillStyle = "#eeeee5";
    boardContext.fillRect(0, 0, 1536, 480);
    boardContext.strokeStyle = "#d6d9cf";
    boardContext.lineWidth = 1;
    for (let horizontal = 0; horizontal < 1536; horizontal += 32) {
      boardContext.beginPath();
      boardContext.moveTo(horizontal, 0);
      boardContext.lineTo(horizontal, 480);
      boardContext.stroke();
    }
    for (let vertical = 0; vertical < 480; vertical += 32) {
      boardContext.beginPath();
      boardContext.moveTo(0, vertical);
      boardContext.lineTo(1536, vertical);
      boardContext.stroke();
    }
    boardContext.fillStyle = "#303931";
    boardContext.font = 'italic 36px "Segoe Print", cursive';
    boardContext.fillText("PLAN / BUILD / SHIP", 42, 57);
    boardContext.font = '26px "Segoe Print", cursive';
    const columns = ["IDEAS", "IN PROGRESS", "DONE"];
    const tasks = [["User flows", "API design"], ["Build UI", "Write tests"], ["Research", "Prototype"]];
    for (let column = 0; column < 3; column++) {
      const left = 42 + column * 330;
      boardContext.fillStyle = "#303931";
      boardContext.fillText(columns[column], left, 115);
      boardContext.strokeStyle = "#626b61";
      boardContext.beginPath();
      boardContext.moveTo(left, 128);
      boardContext.lineTo(left + 280, 126);
      boardContext.stroke();
      for (let task = 0; task < 2; task++) {
        const top = 152 + task * 133;
        boardContext.save();
        boardContext.translate(left + 135, top + 50);
        boardContext.rotate((column + task) % 2 ? 0.018 : -0.02);
        boardContext.fillStyle = ["#dedbb3", "#c9deda", "#c9d9be"][column];
        boardContext.fillRect(-135, -50, 270, 103);
        boardContext.strokeRect(-134, -49, 268, 101);
        boardContext.fillStyle = "#303931";
        boardContext.fillText(tasks[column][task], -114, 10);
        boardContext.restore();
      }
    }
    boardContext.fillStyle = "#303931";
    boardContext.fillText("SYSTEM DESIGN", 1080, 115);
    boardContext.strokeStyle = "#626b61";
    for (const [label, left, top] of [["Client", 1090, 157], ["API", 1300, 157], ["Events", 1200, 328]] as const) {
      boardContext.strokeRect(left, top, 150, 65);
      boardContext.fillText(label, left + 18, top + 42);
    }
    for (const [startX, startY, endX, endY] of [[1240, 190, 1290, 190], [1375, 235, 1280, 314], [1190, 360, 1130, 235]]) {
      boardContext.beginPath();
      boardContext.moveTo(startX, startY);
      boardContext.lineTo(endX, endY);
      boardContext.lineTo(endX - 12, endY - 3);
      boardContext.moveTo(endX, endY);
      boardContext.lineTo(endX - 3, endY + 12);
      boardContext.stroke();
    }
    const boardTexture = new THREE.CanvasTexture(boardCanvas);
    boardTexture.colorSpace = THREE.SRGBColorSpace;
    textures.push(boardTexture);
    const drawing = new THREE.MeshPhysicalMaterial({ map: boardTexture, roughness: 0.55, metalness: 0.02, clearcoat: 0.85, clearcoatRoughness: 0.25 });
    mesh(new THREE.PlaneGeometry(3.8, 1.18), drawing, [0, 0, 0.01], board);
    const reverse = mesh(new THREE.PlaneGeometry(3.8, 1.18), drawing, [0, 0, -0.026], board);
    reverse.rotation.y = Math.PI;
  }

  if (workflow) {
    const drawing = new THREE.MeshPhysicalMaterial({ map: workflow.texture, roughness: 0.55, metalness: 0.02, clearcoat: 0.85, clearcoatRoughness: 0.25 });
    mesh(new THREE.PlaneGeometry(3.8, 1.18), drawing, [0, 0, 0.01], board);
    const reverse = mesh(new THREE.PlaneGeometry(3.8, 1.18), drawing, [0, 0, -0.026], board);
    reverse.rotation.y = Math.PI;
  }

  assembly = stage("plant", previewCharacter ? 1.9 : 1.5, 0.6);
  const potPosition: Point = [-1.92, 1.78, 0.08];
  mesh(new THREE.CylinderGeometry(0.19, 0.135, 0.32, 20), ink, potPosition);
  mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.012, 20), dark, [-1.92, 1.945, 0.08]);
  const growth = new THREE.Group();
  growth.name = "rose-growth";
  growth.position.set(-1.92, 1.95, 0.08);
  assembly.add(growth);
  const stem = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.04, 0.24, 0.01),
    new THREE.Vector3(0.035, 0.51, -0.02), new THREE.Vector3(0, 0.8, 0),
  ]);
  mesh(new THREE.TubeGeometry(stem, 24, 0.016, 8, false), green, [0, 0, 0], growth);
  for (let branch = 0; branch < 4; branch++) {
    const side = branch % 2 ? 1 : -1;
    const height = 0.17 + branch * 0.12;
    const end: Point = [side * 0.19, height + 0.1, (branch % 3 - 1) * 0.09];
    rod([0, height, 0], end, 0.009, green, growth);
    const leaf = sphere(0.105, end, green, growth);
    leaf.scale.set(1.5, 0.42, 0.65);
    leaf.rotation.z = side * 0.5;
    rod([end[0] - side * 0.12, end[1] - 0.045, end[2] + 0.035], [end[0] + side * 0.12, end[1] + 0.045, end[2] + 0.035], 0.004, dark, growth);
  }
  const flower = new THREE.Group();
  flower.name = "rose-bloom";
  flower.position.set(0, 0.8, 0);
  growth.add(flower);
  const rose = new THREE.MeshStandardMaterial({ color: "#c65b73", roughness: 1, side: THREE.DoubleSide });
  const roseCenter = new THREE.MeshStandardMaterial({ color: "#963e59", roughness: 1 });
  sphere(0.055, [0, 0.025, 0], roseCenter, flower).scale.set(1, 1.45, 1);
  const petals: { pivot: THREE.Group; angle: number; ring: number }[] = [];
  for (let ring = 0; ring < 3; ring++) {
    for (let petal = 0; petal < 5 + ring * 2; petal++) {
      const angle = petal * Math.PI * 2 / (5 + ring * 2) + ring * 0.7;
      const pivot = new THREE.Group();
      pivot.rotation.y = angle;
      flower.add(pivot);
      const petalMesh = sphere(0.09 + ring * 0.02, [0, 0.055, 0.035 + ring * 0.025], rose, pivot);
      petalMesh.scale.set(0.85, 1.05, 0.25);
      petals.push({ pivot, angle, ring });
    }
  }

  assembly = stage("chair", previewCharacter ? 1.55 : 1.85, 0.9);
  assembly.rotation.y = -Math.PI / 2;
  assembly.position.set(0.62, 0, -0.55);
  box([0.72, 0.12, 0.85], [2, 0.95, 0.12], dark);
  const back = sphere(0.47, [2.38, 1.42, 0.12], dark);
  back.scale.set(0.2, 1.14, 0.9);
  back.rotation.z = -0.12;
  rod([2.03, 0.16, 0.12], [2.03, 0.92, 0.12], 0.055);
  for (let spoke = 0; spoke < 5; spoke++) {
    const angle = spoke * Math.PI * 2 / 5;
    const end: Point = [2.03 + Math.cos(angle) * 0.55, 0.1, 0.12 + Math.sin(angle) * 0.55];
    rod([2.03, 0.19, 0.12], end, 0.035);
    sphere(0.075, end, dark);
  }
  assembly = stage("developer", previewCharacter ? 2.6 : 2.35, previewCharacter ? 0.85 : 1.15);
  assembly.rotation.y = -Math.PI / 2;
  assembly.position.set(0.62, 0, -0.55);
  limb([2.02, 1.12, -0.15], [1.34, 1.03, -0.15], 0.14, trousers);
  limb([1.34, 1.03, -0.15], [1.16, 0.19, -0.15], 0.105, trousers);
  limb([2.06, 1.12, 0.4], [1.42, 0.99, 0.4], 0.15, trousers);
  limb([1.42, 0.99, 0.4], [1.36, 0.19, 0.4], 0.11, trousers);
  for (const position of [[1.05, 0.12, -0.15], [1.24, 0.12, 0.4]] as Point[]) {
    const shoe = sphere(0.16, position, ink);
    shoe.scale.set(1.5, 0.65, 0.72);
  }

  const engineer = new THREE.Group();
  engineer.position.set(1.94, 1.12, 0.12);
  assembly.add(engineer);
  const jacket = new THREE.MeshStandardMaterial({ color: "#547f65", roughness: 0.92 });
  const shirt = new THREE.MeshStandardMaterial({ color: "#d5d5c6", roughness: 1 });
  const torsoProfile = [
    [0, -0.3], [0.17, -0.3], [0.245, -0.25], [0.255, -0.13],
    [0.235, 0.04], [0.29, 0.18], [0.26, 0.25], [0.16, 0.29], [0.095, 0.3], [0, 0.3],
  ].map(([radius, height]) => new THREE.Vector2(radius, height));
  const torso = mesh(new THREE.LatheGeometry(torsoProfile, 40), jacket, [-0.09, 0.38, 0], engineer);
  torso.name = "tailored-jacket";
  torso.scale.set(0.81, 1.25, 1.2);
  torso.rotation.z = 0.16;
  const chest = sphere(0.16, [-0.272, 0.48, 0], shirt, engineer);
  chest.name = "crew-neck-shirt";
  chest.scale.set(0.16, 1.28, 0.78);
  for (const side of [-1, 1]) {
    const collar = limb([-0.245, 0.69, side * 0.065], [-0.29, 0.49, side * 0.135], 0.041, jacket, engineer);
    collar.name = `jacket-collar-${side}`;
    rod([-0.288, 0.4, side * 0.12], [-0.275, 0.17, side * 0.1], 0.008, jacket, engineer);
  }
  limb([-0.17, 0.72, 0], [-0.24, 0.94, 0], 0.09, skin, engineer);
  const head = new THREE.Group();
  head.name = "developer-head";
  head.position.set(-0.31, 1.08, 0);
  head.scale.setScalar(1.36);
  head.rotation.z = 0.12;
  engineer.add(head);
  const face = sphere(0.235, [0, 0, 0], skin, head);
  const facePositions = face.geometry.getAttribute("position");
  if (previewCharacter) {
    face.name = "senior-face";
    for (let vertex = 0; vertex < facePositions.count; vertex++) {
      const height = facePositions.getY(vertex);
      if (height < -0.05) facePositions.setZ(vertex, facePositions.getZ(vertex) * THREE.MathUtils.mapLinear(height, -0.235, -0.05, 0.72, 1));
    }
    face.geometry.computeVertexNormals();
    face.scale.set(1, 1.08, 1.03);
    const chin = sphere(0.09, [-0.095, -0.185, 0], skin, head);
    chin.scale.set(0.85, 0.72, 0.95);
    for (const side of [-1, 1]) {
      const cheekbone = sphere(0.06, [-0.165, -0.012, side * 0.152], skin, head);
      cheekbone.scale.set(0.55, 0.72, 1);
    }
    const beard = sphere(0.205, [-0.028, -0.145, 0], skin, head);
    beard.name = "trimmed-beard";
    beard.scale.set(0.82, 0.52, 0.98);
    const moustache = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.196, -0.072, -0.062),
      new THREE.Vector3(-0.216, -0.056, 0),
      new THREE.Vector3(-0.196, -0.072, 0.062),
    ]);
    const lip = new THREE.Mesh(new THREE.TubeGeometry(moustache, 16, 0.017, 6, false), skin);
    lip.name = "moustache";
    head.add(lip);
    const creaseMaterial = new THREE.MeshStandardMaterial({ color: "#a87a55", roughness: 1 });
    for (let line = 0; line < 2; line++) {
      const crease = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.192, 0.165 + line * 0.038, -0.088),
        new THREE.Vector3(-0.208, 0.176 + line * 0.038, 0),
        new THREE.Vector3(-0.192, 0.165 + line * 0.038, 0.088),
      ]);
      const brow = new THREE.Mesh(new THREE.TubeGeometry(crease, 16, 0.0035, 6, false), creaseMaterial);
      brow.name = `brow-line-${line}`;
      head.add(brow);
    }
  } else {
    face.name = "sculpted-face";
    for (let vertex = 0; vertex < facePositions.count; vertex++) {
      const height = facePositions.getY(vertex);
      const taper = height < -0.04 ? THREE.MathUtils.mapLinear(height, -0.235, -0.04, 0.64, 1) : 1;
      facePositions.setZ(vertex, facePositions.getZ(vertex) * taper);
      if (facePositions.getX(vertex) < -0.12 && height > -0.08 && height < 0.13) {
        facePositions.setX(vertex, -0.205 + (facePositions.getX(vertex) + 0.205) * 0.3);
      }
    }
    face.geometry.computeVertexNormals();
    face.scale.set(1, 1.05, 1.07);
    const jaw = sphere(0.125, [-0.075, -0.14, 0], skin, head);
    jaw.scale.set(0.82, 0.68, 0.9);
    for (const side of [-1, 1]) {
      const cheek = sphere(0.073, [-0.17, -0.058, side * 0.134], skin, head);
      cheek.scale.set(0.5, 0.82, 1);
    }
  }
  if (previewCharacter) {
    const crown = mesh(new THREE.SphereGeometry(0.238, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.44), hairMaterial, [0.08, 0.052, 0], head);
    crown.name = "senior-hair-crown";
    crown.scale.set(0.96, 0.88, 1.03);
    // continues the crown down the back/nape so the occiput isn't bare when viewed from behind
    const nape = mesh(new THREE.SphereGeometry(0.238, 40, 20, Math.PI * 0.58, Math.PI * 0.84, Math.PI * 0.44, Math.PI * 0.4), hairMaterial, [0.08, 0.052, 0], head);
    nape.name = "senior-hair-nape";
    nape.scale.set(0.96, 0.88, 1.03);
    for (const side of [-1, 1]) {
      const temple = sphere(0.098, [0.055, 0.055, side * 0.205], hairMaterial, head);
      temple.name = `silver-temple-${side}`;
      temple.scale.set(1.05, 1, 0.34);
    }
    const sweep = sphere(0.125, [0.02, 0.245, 0], hairMaterial, head);
    sweep.name = "senior-sweep";
    sweep.scale.set(1.3, 0.5, 1.2);
  } else {
    const hair = sphere(0.235, [0.045, 0.125, 0], hairMaterial, head);
    hair.scale.set(0.96, 0.76, 1.08);
    for (let lock = 0; lock < 6; lock++) {
      const depth = -0.18 + lock * 0.068;
      const tuft = sphere(0.12, [-0.065 + lock * 0.018, 0.245 + Math.sin(lock * 0.55) * 0.065, depth], hairMaterial, head);
      tuft.name = `swept-hair-${lock}`;
      tuft.rotation.z = -0.95;
      tuft.rotation.x = (lock - 2.5) * 0.2;
      tuft.scale.set(0.82, 1.72, 0.73);
    }
    const fringe = sphere(0.15, [-0.115, 0.205, 0.065], hairMaterial, head);
    fringe.scale.set(0.9, 0.7, 1.4);
    fringe.rotation.x = -0.42;
  }
  const nose = sphere(previewCharacter ? 0.062 : 0.05, [-0.215, -0.015, 0], skin, head);
  nose.scale.set(1.15, 0.8, 0.75);
  const eyes: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const ear = sphere(0.053, [0.025, -0.015, side * 0.238], skin, head);
    ear.scale.set(0.7, 1.2, 0.6);
    const eye = new THREE.Group();
    eye.name = `expressive-eye-${side}`;
    eye.position.set(0, 0.055, side * 0.118);
    head.add(eye);
    sphere(0.068, [-0.198, 0, 0], eyeWhite, eye).scale.set(0.4, 1.02, 0.95);
    sphere(0.034, [-0.226, -0.004, 0], iris, eye).scale.set(0.35, 1, 1);
    sphere(0.019, [-0.24, -0.004, 0], pupil, eye).scale.set(0.35, 1, 1);
    sphere(0.007, [-0.25, 0.01, -0.009], eyeWhite, eye);
    eyes.push(eye);
    rod([-0.19, 0.15, side * 0.07], [-0.181, 0.156, side * 0.17], previewCharacter ? 0.022 : 0.014, hairMaterial, head);
    const lensCenter = side * 0.126;
    const frame = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.266, 0.134, lensCenter - 0.069),
      new THREE.Vector3(-0.27, 0.116, lensCenter - 0.098),
      new THREE.Vector3(-0.27, -0.018, lensCenter - 0.098),
      new THREE.Vector3(-0.266, -0.039, lensCenter - 0.069),
      new THREE.Vector3(-0.266, -0.039, lensCenter + 0.069),
      new THREE.Vector3(-0.27, -0.018, lensCenter + 0.098),
      new THREE.Vector3(-0.27, 0.116, lensCenter + 0.098),
      new THREE.Vector3(-0.266, 0.134, lensCenter + 0.069),
    ], true, "centripetal");
    const spectacle = new THREE.Mesh(new THREE.TubeGeometry(frame, 56, 0.009, 8, true), glasses);
    spectacle.name = `glasses-frame-${side}`;
    head.add(spectacle);
    rod([-0.263, 0.09, side * 0.225], [0.052, 0.035, side * 0.249], 0.01, glasses, head);
  }
  rod([-0.267, 0.074, -0.027], [-0.267, 0.074, 0.027], 0.011, glasses, head);
  const smile = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.189, -0.1, -0.055),
    new THREE.Vector3(-0.2, -0.119, 0),
    new THREE.Vector3(-0.189, -0.1, 0.055),
  ]);
  head.add(new THREE.Mesh(new THREE.TubeGeometry(smile, 16, 0.006, 6, false), hairMaterial));
  const hands: THREE.Group[] = [];
  for (const depth of [-0.24, 0.28]) {
    limb([-0.14, 0.64, depth], [-0.4, 0.35, depth], 0.095, jacket, engineer);
    limb([-0.4, 0.35, depth], [-0.67, 0.46, depth], 0.077, jacket, engineer);
    limb([-0.64, 0.448, depth], [-0.7, 0.475, depth], 0.083, jacket, engineer);
    limb([-0.7, 0.475, depth], [-0.89, 0.55, depth], 0.055, skin, engineer);
    const hand = new THREE.Group();
    hand.position.set(-0.94, 0.55, depth);
    engineer.add(hand);
    const palm = sphere(0.08, [0, 0, 0], skin, hand);
    palm.scale.set(1.4, 0.48, 0.8);
    for (let finger = 0; finger < 4; finger++) rod([-0.04, 0, -0.045 + finger * 0.03], [-0.14, -0.015, -0.045 + finger * 0.03], 0.013, skin, hand);
    hands.push(hand);
  }
  assembly = stage("pendant", 3.1, 0.75);
  rod([-0.4, 3.92, 0.05], [-0.4, 3.58, 0.05], 0.014, dark);
  mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.14, 24), gold, [-0.4, 3.55, 0.05]);
  mesh(new THREE.CylinderGeometry(0.055, 0.09, 0.12, 24), bulb, [-0.4, 3.43, 0.05]);
  sphere(0.16, [-0.4, 3.3, 0.05], bulb);
  const light = new THREE.SpotLight("#ffd24b", 0, 6, Math.PI / 3.8, 0.85, 1.4);
  light.position.set(-0.4, 3.14, 0.05);
  light.target.position.set(-0.4, 1.55, 0.05);
  light.castShadow = false;
  light.shadow.mapSize.set(512, 512);
  light.shadow.normalBias = 0.025;
  assembly.add(light, light.target);
  const beamMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { strength: { value: 0 }, visibility: { value: 0.3 }, beamColor: { value: new THREE.Color("#ffcf58") } },
    vertexShader: `
      varying vec2 beamUv;
      varying vec3 beamNormal;
      varying vec3 beamView;
      void main() {
        beamUv = uv;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        beamNormal = normalize(normalMatrix * normal);
        beamView = -viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      varying vec2 beamUv;
      varying vec3 beamNormal;
      varying vec3 beamView;
      uniform float strength;
      uniform float visibility;
      uniform vec3 beamColor;
      void main() {
        float feather = pow(abs(dot(normalize(beamNormal), normalize(beamView))), 1.4);
        float fade = smoothstep(0.0, 0.4, beamUv.y) * (1.0 - smoothstep(0.88, 1.0, beamUv.y));
        gl_FragColor = vec4(beamColor, fade * feather * strength * visibility);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const beam = mesh(new THREE.ConeGeometry(1.3, 1.59, 64, 1, true), beamMaterial, [-0.4, 2.345, 0.05]);
  beam.castShadow = beam.receiveShadow = false;
  const haloMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { strength: { value: 0 }, glowColor: { value: new THREE.Color("#ffc440") } },
    vertexShader: "varying vec2 glowUv; void main() { glowUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec2 glowUv; uniform float strength; uniform vec3 glowColor; void main() { float radius = length(glowUv - 0.5) * 2.0; float alpha = pow(max(0.0, 1.0 - radius), 3.0) * strength; gl_FragColor = vec4(glowColor, alpha); }",
  });
  const halo = mesh(new THREE.PlaneGeometry(1.45, 1.45), haloMaterial, [-0.4, 3.3, 0.05]);
  halo.castShadow = false;
  halo.receiveShadow = false;
  halo.renderOrder = 1;

  const reveals = stages.map(({ group, start, duration }) => {
    const materials = new Map<THREE.Material, THREE.Material>();
    const strokes: { object: THREE.Mesh | THREE.LineSegments; source: THREE.Material; material: THREE.Material; delay: number; pencil: boolean; count: number }[] = [];
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.LineSegments) || object === halo || object === beam) return;
      const source = object.material as THREE.Material;
      source.transparent = true;
      const material = source.clone();
      const pencil = object instanceof THREE.LineSegments || source === contour;
      materials.set(material, source);
      strokes.push({ object, source, material, delay: (strokes.length * 0.618 % 1) * 0.25, pencil, count: object.geometry.getAttribute("position").count });
      object.material = material;
    });
    return { group, start, duration, strokes, materials };
  });
  // sketch is fully drawn in (desk, board, plant, chair, developer, pendant and the flower bloom
  // all finish by ~4.55s) — once true, `generate` skips its per-stroke recompute forever after,
  // so the render loop isn't redoing this work on every frame for the rest of the session
  let settled = false;
  const generate = (time: number, screenTime = time) => {
    if (!settled) {
      for (const reveal of reveals) {
        reveal.group.visible = time >= reveal.start;
        for (const stroke of reveal.strokes) {
          const onset = reveal.start + stroke.delay + (stroke.pencil ? 0 : 0.24);
          const progress = THREE.MathUtils.smootherstep(time, onset, onset + reveal.duration * 0.7);
          stroke.material.opacity = stroke.source.opacity * progress;
          stroke.material.depthWrite = stroke.source.depthWrite;
          stroke.object.visible = progress > 0;
          if (stroke.object instanceof THREE.LineSegments) {
            stroke.object.geometry.setDrawRange(0, Math.floor(stroke.count * progress / 2) * 2);
          }
        }
      }
      const stemProgress = THREE.MathUtils.smoothstep(time, 2.05, 3.8);
      growth.visible = stemProgress > 0;
      growth.scale.set(0.55 + stemProgress * 0.45, Math.max(0.001, stemProgress), 0.55 + stemProgress * 0.45);
      const bloomProgress = THREE.MathUtils.smoothstep(time, 3.75, 4.55);
      flower.scale.setScalar(0.22 + bloomProgress * 0.78);
      for (const { pivot, ring } of petals) pivot.rotation.x = bloomProgress * (0.22 + ring * 0.28);
      if (time >= 4.6) {
        settled = true;
        for (const reveal of reveals) {
          for (const stroke of reveal.strokes) stroke.object.material = stroke.source;
        }
      }
    }
    updateScreen(screenTime);
    return time >= 4.6;
  };
  const syncMaterials = () => {
    for (const { materials } of reveals) {
      for (const [target, source] of materials) {
        if (source instanceof THREE.MeshStandardMaterial && target instanceof THREE.MeshStandardMaterial) {
          target.color.copy(source.color);
          target.emissiveIntensity = source.emissiveIntensity;
        } else if ((source instanceof THREE.LineBasicMaterial && target instanceof THREE.LineBasicMaterial) || (source instanceof THREE.MeshBasicMaterial && target instanceof THREE.MeshBasicMaterial)) {
          target.color.copy(source.color);
        }
      }
    }
  };
  const disposeSources = () => {
    const sources = new Set(reveals.flatMap(({ materials }) => [...materials.values()]));
    for (const { materials } of reveals) materials.forEach((_, material) => material.dispose());
    sources.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    workflow?.dispose();
  };
  generate(0);
  return { root, board, workflow, head, eyes, torso, hands, screen, bulb, light, halo, haloMaterial, beamMaterial, ink, dark, green, trousers, outline, contour, generate, syncMaterials, disposeSources };
}

export default function DeskScene({ onSeated }: { onSeated?: () => void } = {}) {
  const { translate } = useLanguage();
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seatedRef = useRef(false);
  const onSeatedRef = useRef(onSeated);
  useEffect(() => {
    onSeatedRef.current = onSeated;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      host.dataset.fallback = "true";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
    const target = new THREE.Vector3(-0.4, 1.85, 0.1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = true;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    renderer.domElement.style.touchAction = "none";
    // Wide vertical orbit range so dragging up/down can swing all the way to a top-down
    // and a bottom-up view of the desk, not just a shallow tilt around eye level.
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    const previewParams = new URLSearchParams(window.location.search);
    const previewWorkflow = previewParams.get("heroPreview") !== "off";
    const previewCharacter = previewParams.get("characterPreview") !== "off";
    const desk = buildDesk(previewWorkflow, previewCharacter);
    scene.add(desk.root);
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    desk.root.traverse((object) => {
      const material = (object as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (material?.map) material.map.anisotropy = maxAnisotropy;
      if (material?.emissiveMap) material.emissiveMap.anisotropy = maxAnisotropy;
    });
    const ambient = new THREE.HemisphereLight("#f4f2e8", "#6fd2c5", 2.3);
    scene.add(ambient);
    const key = new THREE.DirectionalLight("#ffffff", 3);
    key.position.set(-3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.normalBias = 0.03;
    scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.16 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.015;
    floor.receiveShadow = true;
    scene.add(floor);

    let distance = 8;
    let active = true;
    let lost = false;
    let disposed = false;
    let prepared = false;
    let elapsed = 0;
    // sketch reveal runs on its own faster clock so the caricature draws in quickly without speeding up ambient breathing/gestures
    let genElapsed = 0;
    const GEN_SPEED = 1.8;
    const GENERATION_SPIN_DURATION = 1.8;
    const GENERATION_SPIN_ANGLE = Math.PI * 6;
    let generationSpinStart: number | null = null;
    let generationSpinAngle = 0;
    let previous = 0;
    let pointer = 0;
    let scroll = 0;
    let bulbStrength = 0;
    let workflowMotion = true;
    // cached on resize only, so raw pointermove events (which can fire far more often than
    // the render loop) never force a synchronous layout read and stutter the whole page
    let hostBounds = host.getBoundingClientRect();
    const content = host.closest("#content");
    const reset = () => {
      pointer = 0;
      // side-on framing: rose reads at the left, the developer and both screens read to the right
      camera.position.set(target.x - distance * 0.16, 3.05, target.z + distance * 0.94);
      camera.position.sub(target).multiplyScalar(0.82).add(target);
      controls.target.copy(target);
      controls.update();
    };
    const resize = () => {
      hostBounds = host.getBoundingClientRect();
      const { width, height } = hostBounds;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.setViewOffset(width, height, width * (width < 500 ? 0.03 : 0.06), 0, width, height);
      camera.updateProjectionMatrix();
      // floor raised from 9.5 so the chair's wheel base (the nearest, lowest point to camera)
      // keeps clearance from the bottom edge through rotation and the idle sway
      distance = Math.max(11.6, 6.5 / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.aspect));
      renderer.setSize(width, height);
      reset();
    };
    const theme = () => {
      const lightMode = document.documentElement.dataset.theme === "light";
      desk.ink.color.set(lightMode ? "#d8ded5" : "#cfcec4");
      desk.dark.color.set(lightMode ? "#454c48" : "#24261f");
      desk.green.color.set(lightMode ? "#789982" : "#95af99");
      desk.trousers.color.set(lightMode ? "#66726d" : "#535952");
      desk.outline.color.set(lightMode ? "#35453e" : "#e2e2d7");
      desk.outline.opacity = lightMode ? 0.6 : 0.55;
      desk.contour.color.copy(desk.outline.color);
      desk.beamMaterial.uniforms.beamColor.value.set(lightMode ? "#eab32f" : "#ffcf58");
      desk.beamMaterial.uniforms.visibility.value = lightMode ? 0.46 : 0.3;
      desk.haloMaterial.uniforms.glowColor.value.set(lightMode ? "#eab32f" : "#ffc440");
      ambient.intensity = lightMode ? 1.8 : 2.3;
      key.intensity = lightMode ? 2 : 3;
      floor.material.opacity = lightMode ? 0.13 : 0.16;
      desk.syncMaterials();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const themeObserver = new MutationObserver(theme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const intersection = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; });
    intersection.observe(host);
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.buttons) return;
      pointer = ((event.clientX - hostBounds.left) / hostBounds.width - 0.5) * 0.12;
    };
    const onLeave = () => { pointer = 0; };
    const onScroll = () => { scroll = Math.min((content?.scrollTop ?? 0) / 500, 1); };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      delete host.dataset.ready;
      host.dataset.fallback = "true";
    };
    const onRestored = () => { lost = false; delete host.dataset.fallback; };
    const onWorkflowPreview = (event: Event) => {
      if (!previewWorkflow || !(event instanceof CustomEvent)) return;
      const detail = event.detail;
      if (typeof detail?.visible === "boolean") desk.board.visible = detail.visible;
      if (typeof detail?.moving === "boolean") workflowMotion = detail.moving;
    };
    if (previewWorkflow) window.addEventListener("desk-workflow-preview", onWorkflowPreview);
    host.addEventListener("pointermove", onPointer);
    host.addEventListener("pointerleave", onLeave);
    content?.addEventListener("scroll", onScroll, { passive: true });
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    renderer.domElement.addEventListener("webglcontextrestored", onRestored);
    resize();
    theme();
    const visibility = new Map<THREE.Object3D, boolean>();
    scene.traverse((object) => { visibility.set(object, object.visible); object.visible = true; });
    const compilation = renderer.compileAsync(scene, camera);
    visibility.forEach((visible, object) => { object.visible = visible; });
    void compilation.then(() => { if (!disposed) prepared = true; }).catch(() => { if (!disposed) prepared = true; });
    renderer.setAnimationLoop((time) => {
      const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
      previous = time;
      if (!prepared || !active || document.hidden || lost) return;
      const gesture = deskMotionAt(motion.matches ? 0 : elapsed);
      if (!motion.matches) {
        elapsed += delta;
        genElapsed += delta * GEN_SPEED;
      }
      desk.hands.forEach((hand, index) => { hand.position.y = 0.55 + (motion.matches ? 0 : Math.sin(elapsed * 8 + index * 2.2) * 0.008 * gesture.typing); });
      desk.eyes.forEach((eye) => { eye.scale.y = gesture.blink; });
      desk.head.rotation.z = 0.12 + gesture.breathe * 2;
      desk.head.rotation.y = -0.12 + gesture.glance;
      desk.torso.scale.y = 1.25 + gesture.breathe;
      desk.screen.emissiveIntensity = 0.12 + gesture.breathe;
      const generationComplete = desk.generate(motion.matches ? 6 : genElapsed, motion.matches ? 6 : elapsed);
      if (generationComplete && !motion.matches && generationSpinStart === null) generationSpinStart = elapsed;
      if (generationSpinStart !== null) {
        const progress = Math.min((elapsed - generationSpinStart) / GENERATION_SPIN_DURATION, 1);
        generationSpinAngle = GENERATION_SPIN_ANGLE * (1 - (1 - progress) ** 3);
      }
      const idleTurn = gesture.turn + pointer * 0.6 + scroll * 0.06;
      desk.root.rotation.y = motion.matches
        ? 0
        : THREE.MathUtils.damp(desk.root.rotation.y - generationSpinAngle, idleTurn, 3, delta) + generationSpinAngle;
      if (generationComplete && !seatedRef.current) {
        seatedRef.current = true;
        onSeatedRef.current?.();
      }
      desk.workflow?.update(elapsed, document.documentElement.dataset.theme === "light", !motion.matches && workflowMotion);
      controls.update(delta);
      const bulbTarget = genElapsed >= 4.6 || motion.matches ? 1 : 0;
      if (motion.matches) bulbStrength = bulbTarget;
      else bulbStrength = THREE.MathUtils.damp(bulbStrength, bulbTarget, 4, delta);
      desk.light.intensity = bulbStrength * 13;
      desk.bulb.emissiveIntensity = bulbStrength * 2.5;
      desk.haloMaterial.uniforms.strength.value = bulbStrength * 0.55;
      desk.beamMaterial.uniforms.strength.value = bulbStrength;
      desk.halo.quaternion.copy(desk.root.quaternion).invert().multiply(camera.quaternion);
      renderer.render(scene, camera);
      host.dataset.ready = "true";
    });
    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("desk-workflow-preview", onWorkflowPreview);
      intersection.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
      content?.removeEventListener("scroll", onScroll);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onRestored);
      controls.dispose();
      const release = () => {
        const geometries = new Set<THREE.BufferGeometry>();
        const materials = new Set<THREE.Material>();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
            geometries.add(object.geometry);
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
          }
        });
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        desk.disposeSources();
        desk.light.shadow.dispose();
        key.shadow.dispose();
        renderer.dispose();
      };
      void compilation.then(release, release);
      renderer.domElement.remove();
      delete host.dataset.ready;
      delete host.dataset.fallback;
    };
  }, []);

  return (
    <div className="desk-scene">
      <div className="desk-canvas" ref={hostRef} role="img" aria-label="A pencil-sketch scene of a senior engineer with black swept hair, a trimmed beard and glasses, drawing itself in at a desk, with a digital systems board behind the monitors, a growing rose and a warm suspended bulb">
        <video ref={videoRef} className="desk-fallback hero-video" src="/videos/hero-avatar.mp4" muted playsInline preload="auto" aria-label="Engineer at a desk" onLoadedData={() => { if (videoRef.current) videoRef.current.currentTime = 7.3; }} />
      </div>
      <p className="desk-tease">
        <ArrowUp size={20} aria-hidden="true" />
        <span className="desk-tease-mouse">{translate("Whatever you do, don't drag the desk.")}</span>
        <span className="desk-tease-touch">{translate("Whatever you do, don't swipe the desk.")}</span>
      </p>
    </div>
  );
}
import * as THREE from "three";

const nodes = [
  { id: "jira", label: "Jira", x: 185, y: 108, icon: "jira/jira-original.svg" },
  {
    id: "docker",
    label: "Docker",
    x: 575,
    y: 108,
    icon: "docker/docker-original.svg",
  },
  {
    id: "k8s",
    label: "Kubernetes",
    x: 965,
    y: 108,
    icon: "kubernetes/kubernetes-plain.svg",
  },
  {
    id: "azure",
    label: "Azure",
    x: 1310,
    y: 108,
    icon: "azure/azure-original.svg",
  },
  {
    id: "aws",
    label: "AWS",
    x: 1310,
    y: 355,
    icon: "amazonwebservices/amazonwebservices-original-wordmark.svg",
  },
  { id: "ml", label: "ML", x: 965, y: 355 },
  { id: "genai", label: "GenAI", x: 575, y: 355 },
  { id: "ops", label: "GenAI Ops", x: 185, y: 355 },
];

const connections = [
  {
    points: [
      [263, 108],
      [480, 108],
    ],
    start: 0,
  },
  {
    points: [
      [655, 108],
      [850, 108],
    ],
    start: 0.8,
  },
  {
    points: [
      [1090, 108],
      [1208, 108],
    ],
    start: 1.6,
  },
  {
    points: [
      [1060, 138],
      [1145, 138],
      [1145, 355],
      [1230, 355],
    ],
    start: 1.6,
  },
  {
    points: [
      [1295, 145],
      [1295, 224],
      [775, 224],
      [775, 297],
    ],
    start: 2.4,
  },
  {
    points: [
      [1295, 322],
      [1295, 224],
    ],
    start: 2.4,
  },
  {
    points: [
      [775, 297],
      [965, 297],
      [965, 319],
    ],
    start: 3.2,
  },
  {
    points: [
      [775, 297],
      [575, 297],
      [575, 319],
    ],
    start: 3.2,
  },
  {
    points: [
      [864, 385],
      [864, 438],
      [292, 438],
      [292, 375],
    ],
    start: 4,
  },
  {
    points: [
      [470, 355],
      [312, 355],
    ],
    start: 4,
  },
  {
    points: [
      [118, 330],
      [62, 330],
      [62, 132],
      [100, 132],
    ],
    start: 4.8,
  },
];

const routes = connections.map((connection) => {
  const points = connection.points.map(
    ([horizontal, vertical]) => new THREE.Vector2(horizontal, vertical),
  );
  const path = new THREE.CurvePath<THREE.Vector2>();
  let cursor = points[0];
  for (let index = 1; index < points.length - 1; index++) {
    const corner = points[index];
    const radius = Math.min(
      22,
      cursor.distanceTo(corner) / 2,
      corner.distanceTo(points[index + 1]) / 2,
    );
    const entry = corner
      .clone()
      .add(cursor.clone().sub(corner).normalize().multiplyScalar(radius));
    const exit = corner
      .clone()
      .add(
        points[index + 1]
          .clone()
          .sub(corner)
          .normalize()
          .multiplyScalar(radius),
      );
    path.add(new THREE.LineCurve(cursor, entry));
    path.add(new THREE.QuadraticBezierCurve(entry, corner, exit));
    cursor = exit;
  }
  path.add(new THREE.LineCurve(cursor, points.at(-1)!));
  return { path, start: connection.start, samples: path.getSpacedPoints(80) };
});

export function createDeskWorkflow() {
  const width = 1536;
  const height = 480;
  const resolution = 0.5;
  const canvas = document.createElement("canvas");
  canvas.width = width * resolution;
  canvas.height = height * resolution;
  const context = canvas.getContext("2d");
  context?.scale(resolution, resolution);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  const icons = new Map<string, HTMLImageElement>();
  const loading: HTMLImageElement[] = [];
  let lastFrame = -1;
  let lastTheme: boolean | undefined;
  let dirty = true;
  let disposed = false;

  for (const node of nodes) {
    if (!node.icon) continue;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (disposed) return;
      icons.set(node.id, image);
      dirty = true;
    };
    image.onerror = () => {
      dirty = true;
    };
    image.src = `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${node.icon}`;
    loading.push(image);
  }

  function update(time: number, lightMode: boolean, moving: boolean) {
    if (!context || disposed) return;
    const frame = moving ? Math.floor(time * 24) : 0;
    if (frame === lastFrame && lightMode === lastTheme && !dirty) return;
    lastFrame = frame;
    lastTheme = lightMode;
    dirty = false;
    const progress = moving ? THREE.MathUtils.smoothstep(time, 0.4, 2.2) : 1;
    const foreground = lightMode ? "#255b39" : "#8fd98f";
    const line = lightMode ? "#99b6a0" : "#355e40";
    context.globalAlpha = 1;
    context.fillStyle = lightMode ? "#e9eee6" : "#111a15";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = lightMode ? "#d9e2d6" : "#1b2b21";
    context.lineWidth = 1;
    context.globalAlpha = 0.35;
    for (let horizontal = 24; horizontal < width; horizontal += 96) {
      context.beginPath();
      context.moveTo(horizontal, 20);
      context.lineTo(horizontal, 460);
      context.stroke();
    }
    for (let vertical = 24; vertical < height; vertical += 96) {
      context.beginPath();
      context.moveTo(20, vertical);
      context.lineTo(1516, vertical);
      context.stroke();
    }
    for (const route of routes) {
      context.globalAlpha = progress;
      context.strokeStyle = line;
      context.lineWidth = 1.6;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      const revealed = moving
        ? THREE.MathUtils.smootherstep(
            time,
            0.8 + route.start * 0.25,
            2.4 + route.start * 0.25,
          )
        : 1;
      route.samples
        .slice(0, Math.max(1, Math.ceil(route.samples.length * revealed)))
        .forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
      context.stroke();
      const phase = ((time - 3 - route.start) % 9) / 3;
      if (!moving || time < 3 + route.start || phase > 1.12) continue;
      for (let trail = 0; trail < 12; trail++) {
        const amount = phase - trail * 0.01;
        if (amount <= 0 || amount > 1) continue;
        const start = route.path.getPointAt(Math.max(0, amount - 0.012));
        const end = route.path.getPointAt(amount);
        context.globalAlpha = Math.pow(1 - trail / 12, 1.5) * 0.85;
        context.strokeStyle = foreground;
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
      }
    }
    nodes.forEach((node, index) => {
      context.globalAlpha = moving
        ? THREE.MathUtils.smoothstep(
            time,
            0.5 + index * 0.14,
            1.5 + index * 0.14,
          )
        : 1;
      context.font = '500 28px "Segoe UI", sans-serif';
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = foreground;
      const icon = icons.get(node.id);
      if (icon) {
        const ratio = Math.min(38 / icon.naturalWidth, 38 / icon.naturalHeight);
        const width = icon.naturalWidth * ratio;
        const height = icon.naturalHeight * ratio;
        context.save();
        if (node.id === "aws" && !lightMode)
          context.filter = "brightness(0) invert(0.85)";
        context.drawImage(
          icon,
          node.x - width / 2,
          node.y - 48 - height / 2,
          width,
          height,
        );
        context.restore();
      } else if (!node.icon) {
        context.strokeStyle = foreground;
        context.lineWidth = 1.8;
        context.beginPath();
        if (node.id === "ml") {
          for (const offset of [-12, 0, 12]) {
            context.moveTo(node.x - 18, node.y - 48 + offset);
            context.lineTo(node.x, node.y - 60);
            context.lineTo(node.x + 18, node.y - 48 + offset);
            context.moveTo(node.x - 18, node.y - 48 + offset);
            context.lineTo(node.x, node.y - 36);
            context.lineTo(node.x + 18, node.y - 48 + offset);
          }
        } else if (node.id === "genai") {
          context.moveTo(node.x - 18, node.y - 48);
          context.quadraticCurveTo(
            node.x,
            node.y - 78,
            node.x + 18,
            node.y - 48,
          );
          context.quadraticCurveTo(
            node.x,
            node.y - 18,
            node.x - 18,
            node.y - 48,
          );
          context.moveTo(node.x, node.y - 64);
          context.lineTo(node.x, node.y - 32);
        } else {
          context.moveTo(node.x - 20, node.y - 48);
          context.lineTo(node.x - 10, node.y - 48);
          context.lineTo(node.x - 4, node.y - 62);
          context.lineTo(node.x + 4, node.y - 34);
          context.lineTo(node.x + 10, node.y - 48);
          context.lineTo(node.x + 20, node.y - 48);
        }
        context.stroke();
      }
      context.fillText(node.label, node.x, node.y);
    });
    context.globalAlpha = 1;
    texture.needsUpdate = true;
  }

  function dispose() {
    disposed = true;
    for (const image of loading) {
      image.onload = null;
      image.onerror = null;
    }
    icons.clear();
    texture.dispose();
  }

  update(0, false, false);
  return { texture, update, dispose };
}

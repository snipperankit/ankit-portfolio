// keeps public/pdf.worker.min.mjs and pdf.js font/cmap assets in sync with the installed pdfjs-dist version
import { copyFile, cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.join(root, "..", "node_modules", "pdfjs-dist");
const publicDir = path.join(root, "..", "public");

await mkdir(publicDir, { recursive: true });
await copyFile(
  path.join(pkgDir, "build", "pdf.worker.min.mjs"),
  path.join(publicDir, "pdf.worker.min.mjs"),
);
await cp(
  path.join(pkgDir, "standard_fonts"),
  path.join(publicDir, "standard_fonts"),
  { recursive: true },
);
await cp(
  path.join(pkgDir, "cmaps"),
  path.join(publicDir, "cmaps"),
  { recursive: true },
);
console.log("copied pdf.js worker, standard_fonts, and cmaps to public/");

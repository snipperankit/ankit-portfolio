import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-genai.mjs "path/to/GenAI"');
const root = fileURLToPath(new URL("../", import.meta.url));
const topics = [
  ["Chunking", "chunking", "Chunking", "Document ingestion, chunking strategies, and quality metrics."],
  ["Embedding", "embeddings", "Embeddings & search", "Vector representations, index selection, and retrieval evaluation."],
  ["MCP", "mcp", "MCP fundamentals", "Tool calls, resource access, protocols, and authorization."],
  ["MCP_2", "mcp-production", "MCP in production", "Zero trust, sandboxing, infrastructure, and observability."],
  ["RAG", "rag", "RAG systems", "Retrieval quality, generation, safety, and system design."],
  ["Transformer", "transformers", "Transformers", "From tokenisation and attention to output probabilities."],
];
const acronyms = new Set(["mcp", "rag", "rbac", "hnsw", "ivf", "pq", "ffn", "github"]);
const catalog = [];
for (const [folder, id, title, description] of topics) {
  const files = (await readdir(path.join(source, folder)))
    .filter((name) => name.toLowerCase().endsWith(".png"))
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
  const seen = new Set();
  const slides = [];
  const destination = path.join(root, "public", "genai", id);
  await mkdir(destination, { recursive: true });
  for (const file of files) {
    const origin = path.join(source, folder, file);
    const digest = createHash("sha256").update(await readFile(origin)).digest("hex");
    if (seen.has(digest)) continue;
    seen.add(digest);
    const filename = file.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-\.png$/, ".png");
    const words = file.replace(/\.png$/i, "").replace(/^\d+[a-z]?[-_]/i, "").replace(/\s*\(\d+\)$/, "").split(/[_-]+/);
    const label = words.map((word, index) => acronyms.has(word.toLowerCase()) ? word.toUpperCase() : index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join(" ");
    await copyFile(origin, path.join(destination, filename));
    slides.push({ title: label, src: `/genai/${id}/${filename}` });
  }
  if (!slides.length) throw new Error(`No PNG diagrams found in ${folder}`);
  catalog.push({ id, title, description, slides });
}
await writeFile(path.join(root, "src", "lib", "genai.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log(`Imported ${catalog.reduce((total, topic) => total + topic.slides.length, 0)} unique diagrams in ${catalog.length} topics.`);
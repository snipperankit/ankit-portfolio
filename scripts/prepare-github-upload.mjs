import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destination = path.join(root, "github-upload");
const rootFiles = [
  ".gitignore", ".node-version", "package.json", "package-lock.json",
  "tsconfig.json", "eslint.config.mjs", "next.config.ts",
  "open-next.config.ts", "wrangler.jsonc", "DEPLOYMENT.md",
];
const generatedAssets = new Set([
  "public/cmaps", "public/standard_fonts", "public/pdf.worker.min.mjs",
]);

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (generatedAssets.has(relative)) continue;
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${relative}`);
    if (entry.isDirectory()) files.push(...await collect(relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

const batches = [
  { name: "batch-01-code", files: [...rootFiles, ...await collect("src"), ...await collect("scripts")] },
  { name: "batch-02-assets", files: await collect("public") },
];
const secrets = [];
for (const name of (await readdir(root)).filter(name => /^\.env(?:\.|$)/.test(name) && !name.endsWith(".example"))) {
  const environment = parseEnv(await readFile(path.join(root, name), "utf8"));
  for (const [key, value] of Object.entries(environment)) {
    if (!key.startsWith("NEXT_PUBLIC_") && /TOKEN|SECRET|PASSWORD|PASS|KEY/.test(key) && value.length >= 8) {
      secrets.push(value);
    }
  }
}

for (const batch of batches) {
  if (batch.files.length > 100) throw new Error(`${batch.name} exceeds GitHub's 100-file upload limit`);
  for (const relative of batch.files) {
    if (/(^|\/)(\.env[^/]*|\.dev\.vars[^/]*|node_modules|private)(\/|$)|\.(pem|key|pfx|log)$/i.test(relative)) {
      throw new Error(`Unsafe upload path: ${relative}`);
    }
    const bytes = await readFile(path.join(root, relative));
    if (bytes.length > 25 * 1024 * 1024) throw new Error(`File exceeds GitHub's browser limit: ${relative}`);
    if (secrets.some(secret => bytes.includes(Buffer.from(secret))) || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(bytes.toString("utf8"))) {
      throw new Error(`Potential credential in ${relative}; no upload folder created`);
    }
  }
}

await mkdir(destination);
for (const batch of batches) {
  let totalBytes = 0;
  for (const relative of batch.files) {
    const target = path.join(destination, batch.name, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(root, relative), target);
    totalBytes += (await stat(target)).size;
  }
  console.log(`${batch.name}: ${batch.files.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB`);
}
await copyFile(path.join(root, "DEPLOYMENT.md"), path.join(destination, "START-HERE.md"));
await writeFile(path.join(destination, "manifest.json"), JSON.stringify(batches, null, 2) + "\n");
console.log(`Upload folder: ${destination}`);
console.log("Upload the CONTENTS of each batch at repository root, not the batch folders themselves.");
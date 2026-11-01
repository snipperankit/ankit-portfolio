import { readFile } from "node:fs/promises";
import path from "node:path";

// R2 is optional: when the four vars below aren't set, this falls back to reading
// private/downloads/ from local disk, so dev and non-Cloudflare hosts keep working.
function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET,
  );
}

let clientPromise: Promise<import("@aws-sdk/client-s3").S3Client> | null = null;

function getClient() {
  if (!clientPromise) {
    clientPromise = import("@aws-sdk/client-s3").then(
      ({ S3Client }) =>
        new S3Client({
          region: "auto",
          endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
          },
        }),
    );
  }
  return clientPromise;
}

async function readFromR2(fileName: string): Promise<Buffer> {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getClient();
  const result = await client.send(
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: fileName }),
  );
  const bytes = await result.Body?.transformToByteArray();
  if (!bytes) throw new Error(`empty R2 object: ${fileName}`);
  return Buffer.from(bytes);
}

// Single read path shared by every route that serves a protected PDF (download,
// full-doc, email attachment, preview), so switching storage backends is a one-file change.
export async function readProtectedFile(fileName: string): Promise<Buffer> {
  if (r2Configured()) return readFromR2(fileName);
  const filePath = path.join(process.cwd(), "private", "downloads", fileName);
  return readFile(filePath);
}

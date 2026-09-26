import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaStorageSetting } from "@/lib/db/schema";
import { CMS_CONFIG } from "@/lib/cms/config";

/**
 * Pluggable media storage: local disk (default) or Cloudflare R2 with BYOK
 * credentials configured by an admin. R2 uses the S3-compatible API.
 */

export type StorageProvider = "local" | "r2";

export interface StorageSettings {
  provider: StorageProvider;
  r2AccountId: string | null;
  r2AccessKeyId: string | null;
  r2SecretAccessKey: string | null;
  r2Bucket: string | null;
  r2PublicUrl: string | null;
}

const DEFAULTS: StorageSettings = {
  provider: "local",
  r2AccountId: null,
  r2AccessKeyId: null,
  r2SecretAccessKey: null,
  r2Bucket: null,
  r2PublicUrl: null,
};

export async function getStorageSettings(): Promise<StorageSettings> {
  const [row] = await db
    .select()
    .from(mediaStorageSetting)
    .where(eq(mediaStorageSetting.id, "default"))
    .limit(1);
  if (!row) return DEFAULTS;
  return {
    provider: (row.provider as StorageProvider) ?? "local",
    r2AccountId: row.r2AccountId,
    r2AccessKeyId: row.r2AccessKeyId,
    r2SecretAccessKey: row.r2SecretAccessKey,
    r2Bucket: row.r2Bucket,
    r2PublicUrl: row.r2PublicUrl,
  };
}

export function isR2Configured(s: StorageSettings): boolean {
  return Boolean(
    s.provider === "r2" &&
      s.r2AccountId &&
      s.r2AccessKeyId &&
      s.r2SecretAccessKey &&
      s.r2Bucket,
  );
}

async function getS3Client(s: StorageSettings) {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${s.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: s.r2AccessKeyId!,
      secretAccessKey: s.r2SecretAccessKey!,
    },
  });
}

/** Public URL for a stored asset (custom domain → proxy → local /uploads). */
export function assetUrl(s: StorageSettings, filename: string): string {
  if (s.provider === "r2") {
    const base = s.r2PublicUrl?.replace(/\/+$/, "");
    return base ? `${base}/${filename}` : `/api/media/f/${filename}`;
  }
  return `/uploads/${filename}`;
}

export interface PutResult {
  url: string;
}

/** Store an object under `key`; returns its public URL. */
export async function putObject(
  s: StorageSettings,
  key: string,
  body: Buffer,
  contentType: string,
): Promise<PutResult> {
  if (isR2Configured(s)) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3Client(s);
    await client.send(
      new PutObjectCommand({
        Bucket: s.r2Bucket!,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const base = s.r2PublicUrl?.replace(/\/+$/, "");
    return { url: base ? `${base}/${key}` : `/api/media/f/${key}` };
  }
  const dir = path.join(process.cwd(), CMS_CONFIG.uploadDir, path.dirname(key));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), CMS_CONFIG.uploadDir, key), body);
  return { url: `/uploads/${key}` };
}

/** Delete an object; best-effort on both providers. */
export async function deleteObject(s: StorageSettings, key: string): Promise<void> {
  if (isR2Configured(s)) {
    try {
      const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      const client = await getS3Client(s);
      await client.send(new DeleteObjectCommand({ Bucket: s.r2Bucket!, Key: key }));
    } catch {
      // already gone / transient — ignore
    }
    return;
  }
  try {
    await unlink(path.join(process.cwd(), CMS_CONFIG.uploadDir, key));
  } catch {
    // already gone — ignore
  }
}

/** Round-trip check used by the "Test connection" button (R2 only). */
export async function testR2Connection(s: StorageSettings): Promise<{ ok: boolean; error?: string }> {
  if (!isR2Configured(s)) {
    return { ok: false, error: "R2 is not fully configured (account ID, access key, secret, and bucket are required)" };
  }
  try {
    const probeKey = `.cms-connection-test/${crypto.randomUUID()}`;
    const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3Client(s);
    await client.send(new PutObjectCommand({ Bucket: s.r2Bucket!, Key: probeKey, Body: Buffer.from("ok"), ContentType: "text/plain" }));
    await client.send(new GetObjectCommand({ Bucket: s.r2Bucket!, Key: probeKey }));
    await client.send(new DeleteObjectCommand({ Bucket: s.r2Bucket!, Key: probeKey }));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
  }
}

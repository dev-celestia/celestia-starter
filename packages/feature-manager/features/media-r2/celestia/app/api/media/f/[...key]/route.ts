import { getStorageSettings, isR2Configured } from "@/lib/media/storage";

type RouteContext = { params: Promise<{ key: string[] }> };

/**
 * Streams R2 objects when no public bucket domain is configured:
 * /api/media/f/<object-key> → GetObject → binary response.
 * Configured domains serve files directly and never hit this route.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { key: segments } = await params;
  const key = segments.join("/");
  if (!key || key.includes("..")) {
    return new Response("Bad key", { status: 400 });
  }

  const settings = await getStorageSettings();
  if (!isR2Configured(settings)) {
    return new Response("R2 storage is not configured", { status: 404 });
  }

  try {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${settings.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: settings.r2AccessKeyId!,
        secretAccessKey: settings.r2SecretAccessKey!,
      },
    });
    const obj = await client.send(
      new GetObjectCommand({ Bucket: settings.r2Bucket!, Key: key }),
    );
    return new Response(obj.Body as ReadableStream, {
      headers: {
        "content-type": obj.ContentType ?? "application/octet-stream",
        "content-length": obj.ContentLength ? String(obj.ContentLength) : "",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

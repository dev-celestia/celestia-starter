import { z } from "zod";
import sharp from "sharp";
import { db } from "@/lib/db";
import { mediaAsset } from "@/lib/db/schema";
import { requireCmsSession } from "@/lib/cms/rbac";
import { CMS_CONFIG } from "@/lib/cms/config";
import { getStorageSettings, isR2Configured, putObject } from "@/lib/media/storage";

/**
 * Drag-and-drop image upload (PRD 3.1): converts to WebP with responsive
 * variants, then stores via the configured provider — local disk by default,
 * or Cloudflare R2 with admin-supplied BYOK credentials.
 */
export async function POST(request: Request) {
  let session;
  try {
    session = await requireCmsSession();
  } catch (e) {
    return e as Response;
  }

  const form = await request.formData();
  const file = form.get("file");
  const altRaw = form.get("alt");
  const alt = z.string().max(500).safeParse(typeof altRaw === "string" ? altRaw : "");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image uploads are supported" }, { status: 400 });
  }
  if (file.size > CMS_CONFIG.maxUploadBytes) {
    return Response.json({ error: "Image exceeds the 10 MB limit" }, { status: 400 });
  }

  const storage = await getStorageSettings();
  const useR2 = isR2Configured(storage);

  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input).metadata();

  const masterWidth = Math.min(CMS_CONFIG.masterWidth, metadata.width ?? CMS_CONFIG.masterWidth);
  const masterBuffer = await sharp(input)
    .rotate() // respect EXIF orientation
    .resize({ width: masterWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const masterInfo = await sharp(masterBuffer).metadata();

  const id = `med_${crypto.randomUUID().slice(0, 12)}`;
  const filename = `${id}.webp`; // local filename / R2 object key (shared id space)

  const { url: masterUrl } = await putObject(storage, filename, masterBuffer, "image/webp");

  const variants: { url: string; width: number; height: number | null }[] = [];
  for (const width of CMS_CONFIG.variantWidths) {
    if (width >= masterWidth) continue;
    const variantBuffer = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const info = await sharp(variantBuffer).metadata();
    const variantKey = `${id}-${width}.webp`;
    const { url: variantUrl } = await putObject(storage, variantKey, variantBuffer, "image/webp");
    variants.push({ url: variantUrl, width, height: info.height ?? null });
  }

  const [asset] = await db
    .insert(mediaAsset)
    .values({
      id,
      filename,
      storage: useR2 ? "r2" : "local",
      objectKey: useR2 ? filename : null,
      originalName: file.name,
      mimeType: file.type,
      width: masterInfo.width ?? null,
      height: masterInfo.height ?? null,
      bytes: masterBuffer.byteLength,
      variants,
      altText: alt.success && alt.data ? alt.data : null,
      uploadedBy: session.user.id,
    })
    .returning();

  return Response.json(
    {
      id: asset.id,
      url: masterUrl,
      width: asset.width,
      height: asset.height,
      altText: asset.altText,
      variants,
      storage: asset.storage,
    },
    { status: 201 },
  );
}

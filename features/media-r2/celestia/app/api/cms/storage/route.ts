import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaStorageSetting } from "@/lib/db/schema";
import { requireCmsAdmin } from "@/lib/cms/rbac";
import { getStorageSettings, isR2Configured } from "@/lib/media/storage";

/** BYOK storage settings (admin only). Secrets are returned masked. */
export async function GET() {
  try {
    await requireCmsAdmin();
  } catch (e) {
    return e as Response;
  }
  const s = await getStorageSettings();
  return Response.json({
    provider: s.provider,
    r2AccountId: s.r2AccountId,
    r2AccessKeyId: s.r2AccessKeyId,
    r2SecretAccessKeyLast4: s.r2SecretAccessKey ? s.r2SecretAccessKey.slice(-4) : null,
    r2Bucket: s.r2Bucket,
    r2PublicUrl: s.r2PublicUrl,
    r2Configured: isR2Configured(s),
  });
}

const putSchema = z.object({
  provider: z.enum(["local", "r2"]),
  r2AccountId: z.string().max(120).nullish(),
  r2AccessKeyId: z.string().max(200).nullish(),
  // optional on update: omit / empty keeps the stored secret
  r2SecretAccessKey: z.string().max(200).nullish(),
  r2Bucket: z.string().max(200).nullish(),
  r2PublicUrl: z.string().max(300).nullish(),
});

export async function PUT(request: Request) {
  let session;
  try {
    session = await requireCmsAdmin();
  } catch (e) {
    return e as Response;
  }
  const parsed = putSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await getStorageSettings();
  const secret =
    data.r2SecretAccessKey && data.r2SecretAccessKey.length > 0
      ? data.r2SecretAccessKey
      : existing.r2SecretAccessKey;
  if (data.provider === "r2" && !(secret && data.r2AccountId && data.r2AccessKeyId && data.r2Bucket)) {
    return Response.json(
      { error: "R2 requires account ID, access key ID, secret access key, and bucket" },
      { status: 400 },
    );
  }

  await db
    .insert(mediaStorageSetting)
    .values({
      id: "default",
      provider: data.provider,
      r2AccountId: data.r2AccountId ?? null,
      r2AccessKeyId: data.r2AccessKeyId ?? null,
      r2SecretAccessKey: secret ?? null,
      r2Bucket: data.r2Bucket ?? null,
      r2PublicUrl: data.r2PublicUrl?.replace(/\/+$/, "") || null,
      updatedBy: session.user.id,
    })
    .onConflictDoUpdate({
      target: mediaStorageSetting.id,
      set: {
        provider: data.provider,
        r2AccountId: data.r2AccountId ?? null,
        r2AccessKeyId: data.r2AccessKeyId ?? null,
        r2SecretAccessKey: secret ?? null,
        r2Bucket: data.r2Bucket ?? null,
        r2PublicUrl: data.r2PublicUrl?.replace(/\/+$/, "") || null,
        updatedBy: session.user.id,
      },
    });

  return Response.json({ ok: true });
}

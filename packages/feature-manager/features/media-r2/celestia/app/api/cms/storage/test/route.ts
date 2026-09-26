import { z } from "zod";
import { requireCmsAdmin } from "@/lib/cms/rbac";
import { getStorageSettings, isR2Configured, testR2Connection } from "@/lib/media/storage";

const testSchema = z.object({
  r2AccountId: z.string().max(120).optional(),
  r2AccessKeyId: z.string().max(200).optional(),
  r2SecretAccessKey: z.string().max(200).optional(),
  r2Bucket: z.string().max(200).optional(),
  r2PublicUrl: z.string().max(300).optional(),
});

/**
 * "Test connection" for the BYOK R2 form: runs a put/get/delete round-trip
 * against the bucket. Accepts the form's current values (falling back to
 * stored settings) so users can test before saving.
 */
export async function POST(request: Request) {
  try {
    await requireCmsAdmin();
  } catch (e) {
    return e as Response;
  }

  const parsed = testSchema.safeParse(await request.json().catch(() => ({})));
  const stored = await getStorageSettings();
  const form = parsed.success ? parsed.data : {};

  const candidate = {
    provider: "r2" as const,
    r2AccountId: form.r2AccountId ?? stored.r2AccountId,
    r2AccessKeyId: form.r2AccessKeyId ?? stored.r2AccessKeyId,
    r2SecretAccessKey:
      form.r2SecretAccessKey && form.r2SecretAccessKey.length > 0
        ? form.r2SecretAccessKey
        : stored.r2SecretAccessKey,
    r2Bucket: form.r2Bucket ?? stored.r2Bucket,
    r2PublicUrl: form.r2PublicUrl ?? stored.r2PublicUrl,
  };

  if (!isR2Configured(candidate)) {
    return Response.json({ ok: false, error: "Account ID, access key ID, secret access key, and bucket are all required" });
  }
  const result = await testR2Connection(candidate);
  return Response.json(result);
}

// ---------------------------------------------------------------------------
// Media storage (BYOK Cloudflare R2) — added by the media-r2 feature
// ---------------------------------------------------------------------------

export const mediaStorageSetting = pgTable("media_storage_setting", {
  id: text("id").primaryKey(), // always "default" (single global config)
  provider: text("provider").default("local").notNull(), // local | r2
  r2AccountId: text("r2_account_id"),
  r2AccessKeyId: text("r2_access_key_id"),
  r2SecretAccessKey: text("r2_secret_access_key"), // BYOK — prototype stores it; production would use a vault
  r2Bucket: text("r2_bucket"),
  r2PublicUrl: text("r2_public_url"), // e.g. https://cdn.example.com or https://pub-<hash>.r2.dev (optional)
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

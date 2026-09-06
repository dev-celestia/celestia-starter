// ---------------------------------------------------------------------------
// CMS (blog post management)
// ---------------------------------------------------------------------------

export const POST_STATUSES = [
  "draft",
  "pending_review",
  "scheduled",
  "published",
  "archived",
] as const;

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    parentId: text("parent_id").references((): AnyPgColumn => category.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("category_parentId_idx").on(table.parentId)],
);

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    contentBody: text("content_body").default("").notNull(), // markdown
    excerpt: text("excerpt"),
    featuredImageUrl: text("featured_image_url"),
    featuredImageAlt: text("featured_image_alt"),
    status: text("status").default("draft").notNull(), // draft | pending_review | scheduled | published | archived
    primaryCategoryId: text("primary_category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at"), // scheduled go-live time / actual publish time
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogImageUrl: text("og_image_url"),
    canonicalUrl: text("canonical_url"),
    noindex: boolean("noindex").default(false).notNull(),
    nofollow: boolean("nofollow").default(false).notNull(),
    guestAuthorName: text("guest_author_name"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by"),
    lockedBy: text("locked_by"), // soft-lock: user id currently editing
    lockedAt: timestamp("locked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_status_idx").on(table.status),
    index("post_createdBy_idx").on(table.createdBy),
    index("post_primaryCategoryId_idx").on(table.primaryCategoryId),
  ],
);

export const postTag = pgTable(
  "post_tag",
  {
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export const postAuthor = pgTable(
  "post_author",
  {
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    position: integer("position").default(0).notNull(), // byline order
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const postRevision = pgTable(
  "post_revision",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    snapshot: jsonb("snapshot").notNull(), // full editable-fields snapshot
    label: text("label"), // "Manual save" | "Status: published" | "Rollback to …"
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("postRevision_postId_idx").on(table.postId)],
);

export const slugRedirect = pgTable("slug_redirect", {
  id: text("id").primaryKey(),
  oldSlug: text("old_slug").notNull().unique(),
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mediaAsset = pgTable("media_asset", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull().unique(), // local filename or R2 object key
  storage: text("storage").default("local").notNull(), // local | r2
  objectKey: text("object_key"), // object key when stored in R2

  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(), // original upload mime
  width: integer("width"),
  height: integer("height"),
  bytes: integer("bytes").default(0).notNull(),
  variants: jsonb("variants"), // [{ url, width, height }]
  altText: text("alt_text"),
  uploadedBy: text("uploaded_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// CMS relations
// ---------------------------------------------------------------------------

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, { fields: [post.createdBy], references: [user.id] }),
  primaryCategory: one(category, {
    fields: [post.primaryCategoryId],
    references: [category.id],
  }),
  postTags: many(postTag),
  postAuthors: many(postAuthor),
  revisions: many(postRevision),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "category_parent",
  }),
  children: many(category, { relationName: "category_parent" }),
  posts: many(post),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  postTags: many(postTag),
}));

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, { fields: [postTag.postId], references: [post.id] }),
  tag: one(tag, { fields: [postTag.tagId], references: [tag.id] }),
}));

export const postAuthorRelations = relations(postAuthor, ({ one }) => ({
  post: one(post, { fields: [postAuthor.postId], references: [post.id] }),
  user: one(user, { fields: [postAuthor.userId], references: [user.id] }),
}));

export const postRevisionRelations = relations(postRevision, ({ one }) => ({
  post: one(post, { fields: [postRevision.postId], references: [post.id] }),
  user: one(user, { fields: [postRevision.createdBy], references: [user.id] }),
}));

export const slugRedirectRelations = relations(slugRedirect, ({ one }) => ({
  post: one(post, { fields: [slugRedirect.postId], references: [post.id] }),
}));

export const mediaAssetRelations = relations(mediaAsset, ({ one }) => ({
  user: one(user, { fields: [mediaAsset.uploadedBy], references: [user.id] }),
}));
export const apiKey = pgTable(
  "api_key",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(), // e.g. "marketing-site"
    key: text("key").notNull().unique(), // cms_… bearer token for the Delivery API
    active: boolean("active").default(true).notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("apiKey_createdBy_idx").on(table.createdBy)],
);

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  user: one(user, { fields: [apiKey.createdBy], references: [user.id] }),
}));


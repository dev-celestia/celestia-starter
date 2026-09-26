import { randomUUID } from "node:crypto"

import { zValidator } from "@hono/zod-validator"
import { desc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { z } from "zod"

import { db, posts } from "@workspace/db"

import { auth } from "../../auth"

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(10000).default(""),
  published: z.boolean().default(false),
})

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(10000).optional(),
  published: z.boolean().optional(),
})

export const blogRoutes = new Hono()
  // List the current user's posts (newest first)
  .get("/api/posts", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const rows = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, session.user.id))
      .orderBy(desc(posts.createdAt))
    return c.json(rows)
  })
  // Get a single post (author only)
  .get("/api/posts/:id", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, c.req.param("id")))
    if (!post || post.authorId !== session.user.id) {
      return c.json({ error: "Not found" }, 404)
    }
    return c.json(post)
  })
  // Create a post
  .post("/api/posts", zValidator("json", createPostSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const data = c.req.valid("json")
    const [post] = await db
      .insert(posts)
      .values({
        id: randomUUID(),
        title: data.title,
        content: data.content,
        published: data.published,
        authorId: session.user.id,
      })
      .returning()
    return c.json(post, 201)
  })
  // Update a post (author only)
  .patch("/api/posts/:id", zValidator("json", updatePostSchema), async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, c.req.param("id")))
    if (!existing || existing.authorId !== session.user.id) {
      return c.json({ error: "Not found" }, 404)
    }
    const data = c.req.valid("json")
    const [post] = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, c.req.param("id")))
      .returning()
    return c.json(post)
  })
  // Delete a post (author only)
  .delete("/api/posts/:id", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, c.req.param("id")))
    if (!existing || existing.authorId !== session.user.id) {
      return c.json({ error: "Not found" }, 404)
    }
    await db.delete(posts).where(eq(posts.id, c.req.param("id")))
    return c.json({ success: true })
  })

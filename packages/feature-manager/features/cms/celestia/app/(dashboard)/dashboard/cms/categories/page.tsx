"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleNotch, Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@celestia-project/ui";
import { useSession } from "@/lib/auth-client";
import type { Category } from "@/components/cms/types";

function treeLabel(categories: Category[], id: string): string {
  let current = categories.find((c) => c.id === id);
  const parts: string[] = [];
  const seen = new Set<string>();
  while (current && !seen.has(current.id) && parts.length < 3) {
    seen.add(current.id);
    parts.unshift(current.name);
    current = current.parentId ? categories.find((c) => c.id === current!.parentId) : undefined;
  }
  return parts.join(" › ");
}

/** Hierarchical category management (PRD 3.3) — editors and admins. */
export default function CategoriesPage() {
  const { data: session } = useSession();
  const role = session?.user.role;
  const canManage = role === "admin" || role === "editor";

  const [categories, setCategories] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", parentId: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/api/cms/categories")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setCategories(d.categories ?? []))
      .catch((e) => {
        toast.error(String(e.message));
        setCategories([]);
      });
  }, []);

  useEffect(load, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", parentId: "" });
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      parentId: category.parentId ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    setBusy(true);
    const body: Record<string, unknown> = {
      name: form.name,
      description: form.description || null,
      parentId: form.parentId || null,
    };
    const res = editing
      ? await fetch(`/api/cms/categories/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/cms/categories", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Save failed");
      return;
    }
    toast.success(editing ? "Category updated" : "Category created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/cms/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      toast.error(d.error ?? "Delete failed");
      return;
    }
    toast.success("Category deleted");
    load();
  };

  const parentItems: Record<string, string> = { "": "No parent (top level)" };
  for (const c of categories ?? []) {
    if (c.id !== editing?.id) parentItems[c.id] = treeLabel(categories ?? [], c.id);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Hierarchical taxonomy — the primary category drives canonical URLs.
          </p>
        </div>
        {canManage && (
          <Button onClick={openNew}>
            <Plus className="size-4" /> New category
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          {!categories ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              <CircleNotch className="mx-auto size-4 animate-spin" />
            </p>
          ) : categories.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No categories yet.
            </p>
          ) : (
            <ul className="grid gap-1">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{treeLabel(categories, category.id)}</p>
                    <p className="text-xs text-muted-foreground">
                      /{category.slug}
                      {category.description ? ` — ${category.description}` : ""}
                    </p>
                  </div>
                  {category.parentId && <Badge variant="secondary">child</Badge>}
                  {canManage && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(category)}>
                        <PencilSimple className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => void remove(category.id)}>
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>Categories can nest one or more levels deep.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Parent category</Label>
              <Select
                value={form.parentId}
                items={parentItems}
                onValueChange={(v) => setForm({ ...form, parentId: v ?? "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(parentItems).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <Button disabled={busy || !form.name.trim()} onClick={() => void submit()}>
              {busy ? <CircleNotch className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {!canManage && (
        <p className="text-xs text-muted-foreground">
          Only editors and admins can manage categories.
        </p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleNotch, Copy, Key, Plus, Trash } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui";
import { useSession } from "@/lib/auth-client";
import { siteUrl } from "@/lib/cms/config";
import { timeAgo } from "@/lib/ui";

interface ApiKeyRow {
  id: string;
  name: string;
  key: string;
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

const USAGE_EXAMPLE = `const res = await fetch(
  "${siteUrl()}/api/public/v1/posts?limit=10",
  { headers: { Authorization: "Bearer cms_<your-key>" } },
);
const { posts } = await res.json();
// posts[].contentBody is markdown — render it with any markdown renderer`;

/** Delivery API keys (admin only): centralize content, expose it to external websites. */
export default function CmsSettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";

  const [keys, setKeys] = useState<ApiKeyRow[] | null>(null);
  const [name, setName] = useState("");
  const [created, setCreated] = useState<ApiKeyRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!isAdmin) return;
    fetch("/api/cms/keys")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setKeys(d.keys ?? []))
      .catch((e) => {
        toast.error(String(e.message));
        setKeys([]);
      });
  }, [isAdmin]);

  useEffect(load, [load]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const res = await fetch("/api/cms/keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not create key");
      return;
    }
    setCreated(data);
    setName("");
    toast.success("API key created — copy it now, it is shown once");
    load();
  };

  const revoke = async (id: string) => {
    const res = await fetch(`/api/cms/keys/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      toast.error(d.error ?? "Revoke failed");
      return;
    }
    toast.success("Key revoked");
    load();
  };

  if (!isAdmin) {
    return (
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content API</h1>
          <p className="text-sm text-muted-foreground">Only admins can manage API keys.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content API</h1>
        <p className="text-sm text-muted-foreground">
          Issue keys so external websites can pull published content from this central CMS.
        </p>
      </div>

      {created && (
        <Card className="border-primary/50">
          <CardContent className="space-y-2 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Key className="size-4" /> “{created.name}” — copy this key now, it is stored
              recoverable but treat it as a secret:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
                {created.key}
              </code>
              <Button
                variant="outline"
                size="icon"
                aria-label="Copy API key"
                onClick={() => {
                  void navigator.clipboard.writeText(created.key);
                  toast.success("Key copied");
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Key name — e.g. “marketing-site”"
              className="max-w-xs"
            />
            <Button disabled={busy || !name.trim()} onClick={() => void create()}>
              {busy ? <CircleNotch className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create key
            </Button>
          </div>

          {!keys ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              <CircleNotch className="mx-auto size-4 animate-spin" />
            </p>
          ) : keys.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No keys yet — create one for each external website.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {k.key.slice(0, 12)}…
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {k.lastUsedAt ? timeAgo(k.lastUsedAt) : "never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(k.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Revoke ${k.name}`}
                        onClick={() => void revoke(k.id)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Delivery API</Badge>
            <code className="text-xs text-muted-foreground">GET {siteUrl()}/api/public/v1/posts</code>
          </div>
          <p className="text-sm text-muted-foreground">
            Endpoints: <code>/api/public/v1/posts</code> (supports <code>page</code>,{" "}
            <code>limit</code>, <code>category</code>, <code>tag</code>, <code>q</code>,{" "}
            <code>content=0</code>) and <code>/api/public/v1/posts/&lt;slug&gt;</code>. CORS is
            enabled for browser-based consumers.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-5">
            {USAGE_EXAMPLE}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

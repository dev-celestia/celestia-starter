"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleNotch, CloudArrowUp, PlugsConnected } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@celestia-project/ui";

interface StorageSettingsResponse {
  provider: "local" | "r2";
  r2AccountId: string | null;
  r2AccessKeyId: string | null;
  r2SecretAccessKeyLast4: string | null;
  r2Bucket: string | null;
  r2PublicUrl: string | null;
  r2Configured: boolean;
}

/**
 * BYOK Cloudflare R2 connection (admin only): bring your own account ID,
 * access key, secret, bucket, and optional public domain. Credentials are
 * stored server-side; the secret is never returned to the client.
 */
export function StorageSettingsDialog({ trigger }: { trigger?: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [provider, setProvider] = useState<"local" | "r2">("local");
  const [form, setForm] = useState({
    r2AccountId: "",
    r2AccessKeyId: "",
    r2SecretAccessKey: "",
    r2Bucket: "",
    r2PublicUrl: "",
  });
  const [secretLast4, setSecretLast4] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      fetch("/api/cms/storage")
        .then(async (r) => {
          if (!r.ok) throw new Error((await r.json()).error ?? "Failed to load");
          return r.json();
        })
        .then((d: StorageSettingsResponse) => {
          if (cancelled) return;
          setProvider(d.provider);
          setForm({
            r2AccountId: d.r2AccountId ?? "",
            r2AccessKeyId: d.r2AccessKeyId ?? "",
            r2SecretAccessKey: "",
            r2Bucket: d.r2Bucket ?? "",
            r2PublicUrl: d.r2PublicUrl ?? "",
          });
          setSecretLast4(d.r2SecretAccessKeyLast4);
        })
        .catch((e) => toast.error(String(e.message)))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const test = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/cms/storage/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.ok) toast.success("R2 connection works");
      else toast.error(d.error ?? "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/storage", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, ...form }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? "Save failed");
        return;
      }
      toast.success(
        provider === "r2" ? "Cloudflare R2 connected" : "Using local disk storage",
      );
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="outline">
              <CloudArrowUp className="size-4" /> Storage
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Media storage (BYOK)</DialogTitle>
          <DialogDescription>
            Connect your own Cloudflare R2 bucket. New uploads are stored there; local disk
            remains the fallback.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            <CircleNotch className="mx-auto size-4 animate-spin" />
          </p>
        ) : (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Provider</Label>
              <Select
                value={provider}
                items={{ local: "Local disk (default)", r2: "Cloudflare R2" }}
                onValueChange={(v) => setProvider((v as "local" | "r2") ?? "local")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local disk (default)</SelectItem>
                  <SelectItem value="r2">Cloudflare R2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {provider === "r2" && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="r2-account">R2 account ID</Label>
                  <Input
                    id="r2-account"
                    value={form.r2AccountId}
                    onChange={(e) => setForm({ ...form, r2AccountId: e.target.value })}
                    placeholder="32-character account id"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="r2-key">Access key ID</Label>
                    <Input
                      id="r2-key"
                      value={form.r2AccessKeyId}
                      onChange={(e) => setForm({ ...form, r2AccessKeyId: e.target.value })}
                      placeholder="R2 access key id"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="r2-secret">Secret access key</Label>
                    <Input
                      id="r2-secret"
                      type="password"
                      value={form.r2SecretAccessKey}
                      onChange={(e) => setForm({ ...form, r2SecretAccessKey: e.target.value })}
                      placeholder={secretLast4 ? `Stored (••••${secretLast4}) — leave blank to keep` : "Secret access key"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="r2-bucket">Bucket</Label>
                    <Input
                      id="r2-bucket"
                      value={form.r2Bucket}
                      onChange={(e) => setForm({ ...form, r2Bucket: e.target.value })}
                      placeholder="my-cms-media"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="r2-url">Public URL (optional)</Label>
                    <Input
                      id="r2-url"
                      value={form.r2PublicUrl}
                      onChange={(e) => setForm({ ...form, r2PublicUrl: e.target.value })}
                      placeholder="https://cdn.example.com"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Without a public URL, files are served through /api/media/f/&lt;key&gt;. Create
                  an R2 token in the Cloudflare dashboard → R2 → Manage API tokens.
                </p>
              </>
            )}

            <div className="flex gap-2">
              {provider === "r2" && (
                <Button variant="outline" disabled={testing} onClick={() => void test()}>
                  {testing ? <CircleNotch className="size-4 animate-spin" /> : <PlugsConnected className="size-4" />}
                  Test connection
                </Button>
              )}
              <Button
                className="flex-1"
                disabled={saving}
                onClick={() => void save()}
              >
                {saving ? <CircleNotch className="size-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

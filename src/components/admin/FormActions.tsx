"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  slug: string;
  status: string;
  url: string;
  compact?: boolean;
};

export function FormActions({ id, slug, status, url, compact }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = async (action: "status" | "duplicate" | "delete") => {
    setBusy(action);
    setError(null);
    try {
      if (action === "status") {
        const nextStatus = status === "published" ? "draft" : "published";
        const response = await fetch(`/api/admin/forms/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (!response.ok) throw new Error("Unable to update status.");
      }
      if (action === "duplicate") {
        const response = await fetch(`/api/admin/forms/${id}/duplicate`, { method: "POST" });
        if (!response.ok) throw new Error("Unable to duplicate.");
      }
      if (action === "delete") {
        if (!window.confirm("Delete this form and all of its submissions? This cannot be undone.")) {
          setBusy(null);
          return;
        }
        const response = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Unable to delete.");
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Link
          href={`/form/${slug}`}
          target="_blank"
          className={cn("neu-btn !px-3 !py-2 !text-[11.5px]", compact && "!px-2.5")}
          title="Open public form"
        >
          <Icon.external size={13} />
          {compact ? null : "View"}
        </Link>
        <CopyButton value={url} label="Copy link" copiedLabel="Copied" compact variant="button" />
        <Link
          href={`/admin/forms/${id}`}
          className="neu-btn !px-3 !py-2 !text-[11.5px]"
          title="Edit form"
        >
          <Icon.settings size={13} />
          {compact ? null : "Edit"}
        </Link>
        <button
          type="button"
          onClick={() => call("status")}
          disabled={busy !== null}
          title={status === "published" ? "Unpublish" : "Publish"}
          className="neu-btn !px-3 !py-2 !text-[11.5px]"
        >
          {busy === "status" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-300/40 border-t-navy-500" />
          ) : status === "published" ? (
            <Icon.eye size={13} />
          ) : (
            <Icon.bolt size={13} />
          )}
          {compact ? null : status === "published" ? "Unpublish" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => call("duplicate")}
          disabled={busy !== null}
          title="Duplicate"
          className="neu-btn !px-2.5 !py-2"
        >
          {busy === "duplicate" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-300/40 border-t-navy-500" />
          ) : (
            <Icon.copy size={13} />
          )}
        </button>
        <button
          type="button"
          onClick={() => call("delete")}
          disabled={busy !== null}
          title="Delete"
          className="neu-btn !px-2.5 !py-2 text-navy-300 hover:!text-rose-500"
        >
          {busy === "delete" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-300/40 border-t-navy-500" />
          ) : (
            <Icon.trash size={13} />
          )}
        </button>
      </div>
      {error ? <span className="text-[11px] font-semibold text-rose-600">{error}</span> : null}
    </div>
  );
}

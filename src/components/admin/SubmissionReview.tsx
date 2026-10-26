"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function SubmissionReview({
  id,
  status,
  notes,
}: {
  id: string;
  status: string;
  notes: string;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [noteText, setNoteText] = useState(notes);
  const [savedNotes, setSavedNotes] = useState(notes);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async (payload: { status?: string; notes?: string }, key: string) => {
    setBusy(key);
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to update this submission.");
      if (payload.status) setCurrentStatus(payload.status);
      if (payload.notes !== undefined) setSavedNotes(payload.notes);
      setFeedback("Saved");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this submission permanently?")) return;
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete.");
      router.push("/admin/submissions");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="neu rounded-neu-lg p-4 sm:p-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">Review status</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { value: "new", label: "New", icon: "inbox" as const },
            { value: "reviewed", label: "Reviewed", icon: "check" as const },
            { value: "archived", label: "Archived", icon: "layers" as const },
          ].map((item) => {
            const Glyph = Icon[item.icon];
            const active = currentStatus === item.value;
            return (
              <button
                key={item.value}
                type="button"
                disabled={busy !== null}
                onClick={() => send({ status: item.value }, `status-${item.value}`)}
                data-active={active}
                className={cn("neu-chip flex-1 justify-center !py-2.5 !text-[12px]")}
              >
                {busy === `status-${item.value}` ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current/40 border-t-current" />
                ) : (
                  <Glyph size={13} />
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="neu rounded-neu-lg p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">
            Internal notes
          </p>
          <span className="text-[10.5px] font-semibold text-navy-300">{noteText.length}/4000</span>
        </div>
        <textarea
          value={noteText}
          onChange={(event) => setNoteText(event.target.value.slice(0, 4000))}
          rows={5}
          placeholder="Call the owner, verify the map pin, request menu photos…"
          className="neu-input mt-2.5 resize-y !text-[12.5px]"
        />
        <div className="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            disabled={busy !== null || noteText === savedNotes}
            onClick={() => send({ notes: noteText }, "notes")}
            className="neu-btn flex-1 !py-2.5 !text-[12px]"
          >
            {busy === "notes" ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-300/40 border-t-navy-500" />
            ) : (
              <Icon.check size={13} />
            )}
            Save note
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={remove}
            aria-label="Delete submission"
            className="neu-btn h-10 w-10 !px-0 text-navy-300 hover:!text-rose-500"
          >
            {busy === "delete" ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-300/40 border-t-navy-500" />
            ) : (
              <Icon.trash size={14} />
            )}
          </button>
        </div>
        {error ? <p className="mt-2 text-[11.5px] font-semibold text-rose-600">{error}</p> : null}
        {feedback && !error ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600">
            <Icon.check size={12} />
            {feedback}
          </p>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markThreadRead } from "@/app/consultation/actions";
import { AttachmentView } from "@/components/attachment-view";
import type { Attachment, Message } from "@/lib/supabase/types";

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

/** Union by id; a row with read_at set wins over its unread twin. */
function merge(a: Message[], b: Message[]): Message[] {
  const byId = new Map<string, Message>();
  for (const m of [...a, ...b]) {
    const existing = byId.get(m.id);
    byId.set(m.id, existing && existing.read_at && !m.read_at ? existing : m);
  }
  return [...byId.values()].sort(
    (x, y) => new Date(x.created_at).getTime() - new Date(y.created_at).getTime()
  );
}

export function MessageList({
  consultationId,
  initialMessages,
  viewerId,
  patientId,
  patientName,
  doctorName,
  isDoctor,
  emptyText,
}: {
  consultationId: string;
  initialMessages: Message[];
  viewerId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  isDoctor: boolean;
  emptyText: string | null;
}) {
  const router = useRouter();
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  const messages = useMemo(
    () => merge(initialMessages, liveMessages),
    [initialMessages, liveMessages]
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`consultation-${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `consultation_id=eq.${consultationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setLiveMessages((prev) => merge(prev, [m]));
          // Only auto-mark read if this tab is actually the one on screen —
          // a background/inactive tab still receives the Realtime push and
          // must not silently mark messages as read nobody has seen yet.
          if (m.sender_id !== viewerId && document.visibilityState === "visible") {
            void markThreadRead(consultationId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `consultation_id=eq.${consultationId}`,
        },
        (payload) => {
          setLiveMessages((prev) => merge(prev, [payload.new as Message]));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultations",
          filter: `id=eq.${consultationId}`,
        },
        // Status changed (paid / closed / refunded) — re-render the page shell
        () => router.refresh()
      )
      .subscribe();

    // Catches messages that arrived while this tab was backgrounded — the
    // INSERT handler above skipped marking them read at the time.
    function onVisible() {
      if (document.visibilityState === "visible") void markThreadRead(consultationId);
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [consultationId, viewerId, router]);

  if (messages.length === 0) {
    return emptyText ? (
      <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        {emptyText}
      </p>
    ) : null;
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => {
        const mine = m.sender_id === viewerId;
        const senderIsPatient = m.sender_id === patientId;
        const senderLabel = senderIsPatient
          ? isDoctor
            ? patientName
            : "You"
          : isDoctor
            ? "You"
            : doctorName;
        const attachments = (m.attachments ?? []) as Attachment[];
        return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                senderIsPatient
                  ? "border border-stone-200 bg-white"
                  : "bg-teal-700 text-white"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  senderIsPatient ? "text-stone-500" : "text-teal-100"
                }`}
              >
                {senderLabel} · {fmt(m.created_at)}
              </p>
              {m.body && (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {m.body}
                </p>
              )}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((a) => (
                    <AttachmentView key={a.path} attachment={a} />
                  ))}
                </div>
              )}
              {mine && (
                <p
                  className={`mt-1 text-right text-[11px] ${
                    senderIsPatient ? "text-stone-400" : "text-teal-200"
                  }`}
                  title={m.read_at ? `Read ${fmt(m.read_at)}` : "Delivered"}
                >
                  {m.read_at ? "✓✓ Read" : "✓ Sent"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

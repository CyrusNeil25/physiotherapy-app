"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/consultation/actions";
import type { Attachment } from "@/lib/supabase/types";

const MAX_FILES = 5;
const MAX_FILE_MB = 10;

export function MessageComposer({ consultationId }: { consultationId: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  function pickFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_FILES);
    const tooBig = next.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is over ${MAX_FILE_MB} MB.`);
      return;
    }
    setError("");
    setFiles(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && files.length === 0) return;
    setStatus("sending");
    setError("");

    try {
      const supabase = createClient();
      const attachments: Attachment[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
        const path = `${consultationId}/${crypto.randomUUID()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("consultation-files")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw new Error(`Upload failed for ${file.name}`);
        attachments.push({ path, name: file.name, type: file.type, size: file.size });
      }

      const result = await sendMessage({ consultationId, body, attachments });
      if (!result.ok) throw new Error(result.error);

      setBody("");
      setFiles([]);
      if (fileInput.current) fileInput.current.value = "";
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-stone-200 bg-white p-4">
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your message…"
        className="w-full resize-y rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      />

      {files.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
            >
              {f.name}
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="font-bold text-stone-400 hover:text-stone-700"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex items-center justify-between">
        <label className="cursor-pointer text-sm font-medium text-teal-700 hover:text-teal-800">
          + Attach photos / reports
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => pickFiles(e.target.files)}
            className="hidden"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

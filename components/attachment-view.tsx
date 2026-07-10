"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Attachment } from "@/lib/supabase/types";

const SIGNED_URL_TTL_SECONDS = 60 * 30;

/** Renders a message attachment: inline preview for images, download link otherwise. */
export function AttachmentView({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.type.startsWith("image/");
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const supabase = createClient();
    supabase.storage
      .from("consultation-files")
      .createSignedUrl(attachment.path, SIGNED_URL_TTL_SECONDS)
      .then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [attachment.path, isImage]);

  async function open() {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("consultation-files")
      .createSignedUrl(attachment.path, SIGNED_URL_TTL_SECONDS);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  if (isImage) {
    return (
      <button type="button" onClick={open} className="block" title={attachment.name}>
        {url ? (
          // Signed URLs expire, so next/image optimization caching doesn't fit here
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={attachment.name}
            className="max-h-48 max-w-full rounded-lg border border-stone-200 object-contain"
          />
        ) : (
          <span className="block h-24 w-32 animate-pulse rounded-lg bg-stone-100" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-teal-700 hover:border-teal-300"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      {attachment.name}
    </button>
  );
}

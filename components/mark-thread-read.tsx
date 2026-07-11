"use client";

import { useEffect } from "react";
import { markThreadRead } from "@/app/consultation/actions";

/**
 * Marks the other party's messages as read — deliberately client-side only.
 * Doing this in the server component body instead would fire on ANY server
 * render of the page, including Next.js's <Link> prefetch of every row in
 * the admin inbox list, silently marking messages read before anyone
 * actually looked at them. A useEffect only runs after real hydration in a
 * browser, so this only fires when someone genuinely opens the thread.
 */
export function MarkThreadRead({ consultationId }: { consultationId: string }) {
  useEffect(() => {
    void markThreadRead(consultationId);
  }, [consultationId]);

  return null;
}

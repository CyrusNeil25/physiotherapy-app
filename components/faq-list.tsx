import { faqs } from "@/lib/site";

export function FaqList({ items = faqs }: { items?: typeof faqs }) {
  return (
    <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
      {items.map((f) => (
        <details key={f.question} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-stone-900 [&::-webkit-details-marker]:hidden">
            {f.question}
            <svg
              className="h-5 w-5 shrink-0 text-teal-700 transition-transform group-open:rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {f.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

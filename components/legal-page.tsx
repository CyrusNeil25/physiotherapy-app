export function LegalPage({
  title,
  updated = "July 2026",
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: {updated}</p>
      <div className="prose-sm mt-8 space-y-5 leading-relaxed text-stone-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-stone-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about physiotherapy visits, online consultations, pricing and policies.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-lg text-stone-600">
        Can&apos;t find your answer?{" "}
        <Link href="/contact" className="font-semibold text-teal-700 hover:text-teal-800">
          Contact us
        </Link>{" "}
        — or ask on WhatsApp using the green button.
      </p>
      <div className="mt-10">
        <FaqList />
      </div>
    </div>
  );
}

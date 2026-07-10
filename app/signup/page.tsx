import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Create your account
      </h1>
      <p className="mt-2 text-stone-600">
        Book appointments and message us online.
      </p>

      <Suspense fallback={<div className="mt-8 h-96" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}

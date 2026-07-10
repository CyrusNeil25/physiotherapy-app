import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Sign in
      </h1>
      <p className="mt-2 text-stone-600">
        Sign in to book appointments and message us online.
      </p>

      <Suspense fallback={<div className="mt-8 h-64" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

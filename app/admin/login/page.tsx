import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Staff sign in
      </h1>
      <p className="mt-2 text-stone-600">Restore Physiotherapy — admin.</p>

      <Suspense fallback={<div className="mt-8 h-64" />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}

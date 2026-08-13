import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Geraldino
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel de administración
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <LoginForm next={next ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}

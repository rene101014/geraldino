import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/admin/set-password-form";

export const metadata: Metadata = {
  title: "Definir contraseña — Admin",
  robots: { index: false, follow: false },
};

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Geraldino
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
            Definí tu contraseña de administrador
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <SetPasswordForm />
        </div>
      </div>
    </div>
  );
}

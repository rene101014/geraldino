import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordGate({
  token,
  title,
  error,
}: {
  token: string;
  title: string;
  error?: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Lock className="size-5 text-muted-foreground" />
          </span>
          <h1 className="font-heading text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Esta galería es privada. Ingresa la contraseña que te compartieron.
          </p>
        </div>

        <form action={`/api/g/${token}/access`} method="post" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoFocus required />
            {error && (
              <p className="text-sm text-destructive">Contraseña incorrecta.</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}

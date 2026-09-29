import { HardDrive, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { disconnectGoogleDrive } from "@/app/admin/(dashboard)/galerias/actions";

export function GoogleConnect({
  connected,
  email,
}: {
  connected: boolean;
  email: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <HardDrive className="size-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Google Drive</p>
          {connected ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-green-500" />
              Conectado{email ? ` como ${email}` : ""}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Conéctalo para leer las carpetas de tus sesiones.
            </p>
          )}
        </div>
      </div>

      {connected ? (
        <form action={disconnectGoogleDrive}>
          <Button type="submit" variant="outline" size="sm">
            Desconectar
          </Button>
        </form>
      ) : (
        <Button asChild size="sm">
          <a href="/api/google/oauth/start">Conectar Google Drive</a>
        </Button>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { getGoogleConnection } from "@/lib/google/oauth";
import { GalleryForm } from "@/components/admin/gallery-form";
import { GalleriesList } from "@/components/admin/galleries-list";
import { GoogleConnect } from "@/components/admin/google-connect";

export default async function AdminGalleriesPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;
  const supabase = await createClient();

  const res = await supabase
    .from("galleries")
    .select("*")
    .order("created_at", { ascending: false });
  const galleries = unwrap(res, "las galerías");

  const connection = await getGoogleConnection(supabase);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Galerías
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entrega trabajos y deja que tus clientes seleccionen fotos.
          </p>
        </div>
        <GalleryForm />
      </div>

      {google === "connected" && (
        <p className="mt-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-600 dark:text-green-400">
          Google Drive conectado correctamente.
        </p>
      )}
      {(google === "error" || google === "denied") && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          No se pudo conectar Google Drive. Intenta de nuevo.
        </p>
      )}

      <div className="mt-6">
        <GoogleConnect connected={connection.connected} email={connection.email} />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        ¿Trabajas con Lightroom Classic?{" "}
        <a
          href="/lightroom/geraldino-seleccion-lrplugin.zip"
          className="text-primary hover:underline"
          download
        >
          Descarga el plugin de selección
        </a>{" "}
        para marcar por bandera las fotos que elija el cliente.
      </p>

      <GalleriesList galleries={galleries ?? []} />
    </div>
  );
}

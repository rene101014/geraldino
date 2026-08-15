import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { ContentForm } from "@/components/admin/content-form";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const res = await supabase.from("site_content").select("*").eq("id", 1).single();
  const content = unwrap(res, "el contenido del sitio");

  if (!content) return null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Inicio y bio
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Edita el contenido de la página de Inicio, tu biografía y los datos
        de contacto del sitio.
      </p>

      <div className="mt-8">
        <ContentForm content={content} />
      </div>
    </div>
  );
}

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { unwrap } from "@/lib/data/fetch-or-throw";
import type { Database } from "@/types/database.types";

export type SiteContent = Database["public"]["Tables"]["site_content"]["Row"];

export const getSiteContent = unstable_cache(
  async (): Promise<SiteContent | null> => {
    const supabase = createPublicClient();
    const res = await supabase
      .from("site_content")
      .select("*")
      .eq("id", 1)
      .single();
    return unwrap(res, "el contenido del sitio");
  },
  ["site-content"],
  { tags: ["site-content"], revalidate: 300 },
);

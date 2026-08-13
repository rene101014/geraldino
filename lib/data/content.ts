import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database.types";

export type SiteContent = Database["public"]["Tables"]["site_content"]["Row"];

export const getSiteContent = unstable_cache(
  async (): Promise<SiteContent | null> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_content")
      .select("*")
      .eq("id", 1)
      .single();
    return data;
  },
  ["site-content"],
  { tags: ["site-content"] },
);

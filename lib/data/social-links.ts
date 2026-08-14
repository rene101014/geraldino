import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { unwrap } from "@/lib/data/fetch-or-throw";
import type { Database } from "@/types/database.types";

export type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

export const getSocialLinks = unstable_cache(
  async (): Promise<SocialLink[]> => {
    const supabase = createPublicClient();
    const res = await supabase
      .from("social_links")
      .select("*")
      .eq("visible", true)
      .order("order_index", { ascending: true });
    return unwrap(res, "las redes sociales") ?? [];
  },
  ["social-links"],
  { tags: ["social-links"], revalidate: 300 },
);

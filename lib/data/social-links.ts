import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database.types";

export type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

export const getSocialLinks = unstable_cache(
  async (): Promise<SocialLink[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .eq("visible", true)
      .order("order_index", { ascending: true });
    return data ?? [];
  },
  ["social-links"],
  { tags: ["social-links"] },
);

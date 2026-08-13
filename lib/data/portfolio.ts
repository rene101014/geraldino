import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database.types";

export type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];

export const getPortfolioItems = unstable_cache(
  async (): Promise<PortfolioItem[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });
    return data ?? [];
  },
  ["portfolio-items"],
  { tags: ["portfolio-items"] },
);

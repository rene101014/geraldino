import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database.types";

export type Service = Database["public"]["Tables"]["services"]["Row"];

export const getServices = unstable_cache(
  async (): Promise<Service[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });
    return data ?? [];
  },
  ["services"],
  { tags: ["services"] },
);

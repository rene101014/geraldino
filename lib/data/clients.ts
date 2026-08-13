import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database.types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];

export const getClients = unstable_cache(
  async (): Promise<Client[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });
    return data ?? [];
  },
  ["clients"],
  { tags: ["clients"] },
);

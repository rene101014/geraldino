import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { unwrap } from "@/lib/data/fetch-or-throw";
import type { Database } from "@/types/database.types";

export type Service = Database["public"]["Tables"]["services"]["Row"];

export const getServices = unstable_cache(
  async (): Promise<Service[]> => {
    const supabase = createPublicClient();
    const res = await supabase
      .from("services")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });
    return unwrap(res, "los servicios") ?? [];
  },
  ["services"],
  { tags: ["services"], revalidate: 300 },
);

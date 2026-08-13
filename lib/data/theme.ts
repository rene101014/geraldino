import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_THEME, type SiteTheme } from "@/lib/theme/defaults";

export const getSiteTheme = unstable_cache(
  async (): Promise<SiteTheme> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_theme")
      .select("*")
      .eq("id", 1)
      .single();

    return data ?? DEFAULT_THEME;
  },
  ["site-theme"],
  { tags: ["site-theme"] },
);

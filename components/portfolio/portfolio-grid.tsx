"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Lightbox } from "@/components/portfolio/lightbox";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import type { PortfolioItem } from "@/lib/data/portfolio";

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean) as string[]);
    return ["Todo", ...Array.from(set)];
  }, [items]);

  const active = searchParams.get("categoria") ?? "Todo";
  const [openItem, setOpenItem] = useState<PortfolioItem | null>(null);

  function setActive(category: string) {
    const params = new URLSearchParams(searchParams);
    if (category === "Todo") params.delete("categoria");
    else params.set("categoria", category);
    router.replace(params.size > 0 ? `?${params}` : "?", { scroll: false });
  }

  const filtered =
    active === "Todo" ? items : items.filter((i) => i.category === active);

  return (
    <div>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground/60 hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mx-auto mt-16 max-w-6xl px-6 text-sm text-muted-foreground">
          Todavía no hay piezas publicadas en esta categoría.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3">
          {filtered.map((item, index) => (
            <PortfolioCard
              key={item.id}
              item={item}
              index={index}
              onOpen={() => setOpenItem(item)}
            />
          ))}
        </div>
      )}

      <Lightbox item={openItem} onOpenChange={(open) => !open && setOpenItem(null)} />
    </div>
  );
}

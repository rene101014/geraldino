"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Lightbox } from "@/components/portfolio/lightbox";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import type { PortfolioItem } from "@/lib/data/portfolio";

export function FeaturedWork({ items }: { items: PortfolioItem[] }) {
  const [openItem, setOpenItem] = useState<PortfolioItem | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="px-6 pt-24 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            02 — Trabajo
          </p>
          <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Lo último producido
          </h2>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3">
        {items.map((item, index) => (
          <PortfolioCard
            key={item.id}
            item={item}
            index={index}
            onOpen={() => setOpenItem(item)}
          />
        ))}

        <Link
          href="/portafolio"
          className="group relative flex aspect-[4/5] w-full flex-col items-start justify-center gap-3 bg-foreground p-6 text-background transition-colors sm:aspect-square"
        >
          <ArrowUpRight
            aria-hidden="true"
            className="size-6 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
          <p className="font-heading text-xl font-medium leading-tight">
            Ver el
            <br />
            portafolio completo
          </p>
        </Link>
      </div>

      <Lightbox item={openItem} onOpenChange={(open) => !open && setOpenItem(null)} />
    </section>
  );
}

"use client";

import { motion, useAnimation, useInView, type Variants } from "motion/react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_QUART },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
      return;
    }
    // Some mobile Safari builds fail to redeliver IntersectionObserver
    // callbacks while the URL bar collapses mid-scroll, leaving content
    // stuck at opacity:0 forever. Force it visible after a short delay so
    // a missed trigger never permanently hides real content.
    const timeout = setTimeout(() => controls.start("visible"), 1800);
    return () => clearTimeout(timeout);
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

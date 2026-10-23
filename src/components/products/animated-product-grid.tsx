"use client";

import { motion } from "motion/react";

interface AnimatedProductGridProps {
  children: React.ReactNode;
}

export function AnimatedProductGrid({
  children,
}: AnimatedProductGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.045,
            delayChildren: 0.05,
          },
        },
      }}
      className="
        grid
        grid-cols-2
        gap-x-3
        gap-y-8
        sm:gap-x-4
        sm:gap-y-10
        md:grid-cols-3
        lg:grid-cols-3
        lg:gap-x-5
        xl:grid-cols-4
        xl:gap-x-6
      "
    >
      {children}
    </motion.div>
  );
}

export function AnimatedProductItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 12,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}

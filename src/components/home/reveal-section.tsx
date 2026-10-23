"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface RevealSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

export function RevealSection({
  children,
  id,
  className = "",
}: RevealSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

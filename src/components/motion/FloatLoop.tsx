"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatLoopProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
}

export default function FloatLoop({
  children,
  amplitude = 8,
  duration = 3,
  className,
}: FloatLoopProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

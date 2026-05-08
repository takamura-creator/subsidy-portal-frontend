"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = "up",
  distance = 30,
  delay = 0,
  duration = 0.6,
  scale = 1,
  className,
  once = true,
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "down" || direction === "right" ? -1 : 1;

  return (
    <motion.div
      initial={{
        opacity: 0,
        [axis]: distance * sign,
        scale: scale < 1 ? scale : 1,
      }}
      whileInView={{
        opacity: 1,
        [axis]: 0,
        scale: 1,
      }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

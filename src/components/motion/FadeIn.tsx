"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const getVariants = (
  direction: FadeInProps["direction"],
  distance: number,
): Variants => {
  const axis =
    direction === "left" || direction === "right" ? "x" : "y";
  const sign =
    direction === "down" || direction === "right" ? -1 : 1;

  return {
    hidden: {
      opacity: 0,
      ...(direction !== "none" && { [axis]: distance * sign }),
    },
    visible: {
      opacity: 1,
      ...(direction !== "none" && { [axis]: 0 }),
    },
  };
};

export default function FadeIn({
  children,
  direction = "up",
  distance = 24,
  delay = 0,
  duration = 0.5,
  className,
  once = true,
}: FadeInProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={getVariants(direction, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
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

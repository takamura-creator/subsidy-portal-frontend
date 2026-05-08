"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

interface ScrollProgressProps {
  color?: string;
  height?: number;
}

export default function ScrollProgress({
  color = "var(--hc-primary)",
  height = 3,
}: ScrollProgressProps) {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: "0%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height,
        background: color,
        zIndex: 9999,
      }}
    />
  );
}

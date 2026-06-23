"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASING } from "@/lib/motion-tokens";
import type { ReactNode } from "react";

interface ButtonPulseProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
}

export default function ButtonPulse({
  children,
  className,
  glowColor = "color-mix(in srgb, var(--hc-primary) 30%, transparent)",
  delay = 0,
}: ButtonPulseProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay, ease: EASING.spring }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      <motion.div
        animate={{
          boxShadow: [
            `0 0 0 0 ${glowColor}`,
            `0 0 0 8px transparent`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: delay + 1.5,
        }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "8px",
          pointerEvents: "none",
        }}
      />
      {children}
    </motion.div>
  );
}

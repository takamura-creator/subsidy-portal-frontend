"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  glowColor = "rgba(21, 128, 61, 0.3)",
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
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
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

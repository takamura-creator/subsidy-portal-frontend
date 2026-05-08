"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  colors?: [string, string, string];
  duration?: number;
  className?: string;
}

export default function GradientText({
  children,
  colors = [
    "var(--hc-brand-hojyo)",
    "var(--hc-primary)",
    "var(--hc-brand-came)",
  ],
  duration = 4,
  className,
}: GradientTextProps) {
  const prefersReduced = useReducedMotion();

  const gradient = `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`;

  if (prefersReduced) {
    return (
      <span
        className={className}
        style={{
          backgroundImage: gradient,
          backgroundSize: "100%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      animate={{ backgroundPosition: ["0% 50%", "-300% 50%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      style={{
        backgroundImage: gradient,
        backgroundSize: "300% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
      }}
    >
      {children}
    </motion.span>
  );
}

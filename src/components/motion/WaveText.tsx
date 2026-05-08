"use client";

import { motion, useReducedMotion } from "framer-motion";

interface WaveTextProps {
  text: string;
  className?: string;
  hoverColor?: string;
}

export default function WaveText({
  text,
  className,
  hoverColor = "var(--hc-primary)",
}: WaveTextProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text} style={{ display: "inline-block" }}>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : undefined,
            cursor: "default",
          }}
          whileHover={{
            y: -4,
            color: hoverColor,
            scale: 1.15,
            transition: { type: "spring", stiffness: 500, damping: 15 },
          }}
          aria-hidden="true"
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}

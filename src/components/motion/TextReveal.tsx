"use client";

import { motion, useReducedMotion } from "framer-motion";

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  splitBy?: "char" | "word";
  stagger?: number;
  delay?: number;
  duration?: number;
  className?: string;
  charClassName?: string;
  once?: boolean;
}

export default function TextReveal({
  text,
  as: Tag = "span",
  splitBy = "char",
  stagger = 0.03,
  delay = 0,
  duration = 0.4,
  className,
  charClassName,
  once = true,
}: TextRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const units =
    splitBy === "word" ? text.split(/(\s+)/) : text.split("");

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-30px" }}
        variants={{
          visible: {
            transition: { staggerChildren: stagger, delayChildren: delay },
          },
        }}
        style={{ display: "inline-block" }}
      >
        {units.map((unit, i) => (
          <motion.span
            key={`${unit}-${i}`}
            className={charClassName}
            variants={{
              hidden: { opacity: 0, y: 20, rotateX: -40 },
              visible: {
                opacity: 1,
                y: 0,
                rotateX: 0,
                transition: { duration, ease: [0.25, 0.1, 0.25, 1] },
              },
            }}
            style={{
              display: "inline-block",
              whiteSpace: unit === " " ? "pre" : undefined,
            }}
            aria-hidden="true"
          >
            {unit === " " ? " " : unit}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

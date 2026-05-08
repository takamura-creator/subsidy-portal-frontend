"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursorColor?: string;
  showCursor?: boolean;
  once?: boolean;
}

export default function TypeWriter({
  text,
  speed = 50,
  delay = 0,
  className,
  cursorColor = "var(--hc-primary)",
  showCursor = true,
  once = true,
}: TypeWriterProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-30px" });
  const [displayedCount, setDisplayedCount] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!isInView || prefersReduced) return;

    const startTimeout = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setDisplayedCount(count);
        if (count >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(startTimeout);
  }, [isInView, text, speed, delay, prefersReduced]);

  useEffect(() => {
    if (!showCursor) return;
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, [showCursor]);

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.slice(0, displayedCount)}
      </span>
      {showCursor && (
        <span
          aria-hidden="true"
          style={{
            borderRight: `2px solid ${cursorColor}`,
            opacity: cursorVisible ? 1 : 0,
            marginLeft: 1,
            transition: "opacity 0.1s",
          }}
        />
      )}
    </span>
  );
}

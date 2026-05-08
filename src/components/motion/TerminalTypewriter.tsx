"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface TerminalTypewriterProps {
  lines: string[];
  typeSpeed?: number;
  holdDuration?: number;
  fadeDuration?: number;
  pauseDuration?: number;
  className?: string;
}

export default function TerminalTypewriter({
  lines,
  typeSpeed = 90,
  holdDuration = 3000,
  fadeDuration = 800,
  pauseDuration = 500,
  className,
}: TerminalTypewriterProps) {
  const prefersReduced = useReducedMotion();
  const [displayText, setDisplayText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const lineIndex = useRef(0);
  const phase = useRef<"typing" | "holding" | "fading" | "pausing">("typing");
  const charIndex = useRef(0);

  const tick = useCallback(() => {
    const currentLine = lines[lineIndex.current];

    if (phase.current === "typing") {
      if (charIndex.current < currentLine.length) {
        charIndex.current++;
        setDisplayText(currentLine.slice(0, charIndex.current));
        return typeSpeed;
      }
      phase.current = "holding";
      return holdDuration;
    }

    if (phase.current === "holding") {
      phase.current = "fading";
      setFading(true);
      return fadeDuration;
    }

    if (phase.current === "fading") {
      setFading(false);
      setDisplayText("");
      charIndex.current = 0;
      phase.current = "pausing";
      return pauseDuration;
    }

    lineIndex.current = (lineIndex.current + 1) % lines.length;
    phase.current = "typing";
    return typeSpeed;
  }, [lines, typeSpeed, holdDuration, fadeDuration, pauseDuration]);

  useEffect(() => {
    if (prefersReduced) return;

    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      const delay = tick();
      timer = setTimeout(run, delay);
    };
    timer = setTimeout(run, 800);

    return () => clearTimeout(timer);
  }, [tick, prefersReduced]);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  if (prefersReduced) {
    return (
      <div className={`terminal-window ${className ?? ""}`}>
        <div className="terminal-body">
          <span className="terminal-prompt">&gt; </span>
          <span className="terminal-text">{lines[0]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`terminal-window ${className ?? ""}`}>
      <div className="terminal-body">
        <span className="terminal-prompt">&gt; </span>
        <span
          className="terminal-text"
          style={{
            opacity: fading ? 0 : 1,
            transition: fading ? `opacity ${fadeDuration}ms ease-out` : "none",
          }}
        >
          {displayText}
        </span>
        <span
          className="terminal-cursor"
          style={{ opacity: cursorVisible ? 1 : 0 }}
        >
          |
        </span>
      </div>
    </div>
  );
}

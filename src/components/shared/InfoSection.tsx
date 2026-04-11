import type { ReactNode } from "react";

interface InfoSectionProps {
  title: string;
  children: ReactNode;
}

export default function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <section className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
      <h3 className="font-medium text-text mb-3">{title}</h3>
      {children}
    </section>
  );
}

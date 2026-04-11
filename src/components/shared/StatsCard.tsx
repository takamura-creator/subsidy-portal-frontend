import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  href?: string;
}

export default function StatsCard({ label, value, icon: Icon, trend, href }: StatsCardProps) {
  const content = (
    <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] transition-[box-shadow,transform] duration-200 hover:shadow-[var(--portal-shadow-md)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text2">{label}</span>
        <Icon className="w-5 h-5 text-text2" />
      </div>
      <div className="text-2xl font-medium text-text tabular-nums">{value}</div>
      {trend && (
        <div className="text-xs text-text2 mt-1">{trend}</div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

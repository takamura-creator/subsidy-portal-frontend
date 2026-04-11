import { TrendingUp } from "lucide-react";

interface MonthlySummaryProps {
  month: string;
  received: number;
  completed: number;
}

export default function MonthlySummary({ month, received, completed }: MonthlySummaryProps) {
  return (
    <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] flex items-center gap-4">
      <TrendingUp className="w-5 h-5 text-accent shrink-0" />
      <div>
        <div className="text-sm font-medium text-text">{month}</div>
        <div className="text-xs text-text2 mt-0.5">
          受注 {received}件 / 完了 {completed}件
        </div>
      </div>
    </div>
  );
}

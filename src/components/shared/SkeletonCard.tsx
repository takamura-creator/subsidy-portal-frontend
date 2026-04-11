interface SkeletonCardProps {
  variant?: "card" | "row" | "stats";
}

export default function SkeletonCard({ variant = "card" }: SkeletonCardProps) {
  if (variant === "stats") {
    return (
      <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
        <div className="flex items-center justify-between mb-2">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-5 w-5 rounded" />
        </div>
        <div className="skeleton h-7 w-12 mt-1" />
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <div className="skeleton h-4 w-8" />
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-4 w-20 ml-auto" />
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-5 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2 mb-4" />
      <div className="skeleton h-10 w-full rounded-[10px]" />
    </div>
  );
}

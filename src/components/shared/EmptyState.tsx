import Link from "next/link";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <Inbox className="w-12 h-12 text-border mx-auto mb-4" />
      <h3 className="font-medium text-text mb-2">{title}</h3>
      <p className="text-sm text-text2 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary inline-block">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

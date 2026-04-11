type ApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected" | "suspended" | "active";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
  draft: {
    label: "下書き",
    className: "bg-border/30 text-text2",
  },
  submitted: {
    label: "提出済み",
    className: "bg-primary/10 text-primary",
  },
  reviewing: {
    label: "審査中",
    className: "bg-warning/10 text-warning",
  },
  approved: {
    label: "承認",
    className: "bg-success/10 text-success",
  },
  rejected: {
    label: "却下",
    className: "bg-error/10 text-error",
  },
  suspended: {
    label: "停止中",
    className: "bg-error/10 text-error",
  },
  active: {
    label: "有効",
    className: "bg-success/10 text-success",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

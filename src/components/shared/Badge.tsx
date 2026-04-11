type StatusVariant = "open" | "closed" | "upcoming";
type RoleVariant = "owner" | "contractor" | "admin";

type BadgeProps = {
  variant: StatusVariant | RoleVariant;
  children: React.ReactNode;
};

const variantStyles: Record<StatusVariant | RoleVariant, string> = {
  open: "bg-success/10 text-success",
  closed: "bg-error/10 text-error",
  upcoming: "bg-warning/10 text-warning",
  owner: "bg-primary/10 text-primary",
  contractor: "bg-accent/10 text-accent",
  admin: "bg-secondary/10 text-secondary",
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-snug ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}

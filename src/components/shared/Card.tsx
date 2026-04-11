type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] transition-[box-shadow,transform] duration-200 hover:shadow-[var(--portal-shadow-md)] hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </div>
  );
}

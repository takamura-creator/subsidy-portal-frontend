type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-[#0d6c4a] hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-transparent text-text border border-border hover:bg-bg-surface",
  accent:
    "bg-accent text-white hover:bg-accent/90 hover:-translate-y-px active:translate-y-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-5 py-3 text-[15px]",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-[8px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

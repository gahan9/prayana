import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 hover:bg-brand-700 text-white shadow-sm",
  secondary:
    "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-600",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

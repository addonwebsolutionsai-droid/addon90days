import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: false;
};

// Base classes applied to every button variant
const BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-12 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-40 select-none";

const VARIANTS: Record<ButtonVariant, string> = {
  // Violet filled — primary CTA
  default:
    "bg-violet-500 text-white hover:bg-violet-600 active:bg-violet-700 shadow-violet-sm hover:shadow-violet-md",
  // Transparent — secondary action / nav links
  ghost:
    "bg-transparent text-white/70 hover:text-white hover:bg-bg-s2 active:bg-bg-s3",
  // Border only — tertiary / "View on GitHub" style
  outline:
    "border border-border bg-transparent text-white/80 hover:text-white hover:border-violet-500/60 hover:bg-bg-s2 active:bg-bg-s3",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function Button({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

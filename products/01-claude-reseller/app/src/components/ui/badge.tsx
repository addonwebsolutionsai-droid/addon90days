import { cn } from "@/lib/utils";

// Matches the category enum from packages/toolkit/src/types/skill.ts
type BadgeCategory = "developer" | "iot" | "business" | "finance" | "content" | "research";
type BadgeVariant = BadgeCategory | "default";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

// Each category gets a color that maps to the design system's 10% accent rule.
// Text is the mid-tone, background is the deep dark tint.
const CATEGORY_STYLES: Record<BadgeVariant, string> = {
  developer: "bg-blue-900/60 text-blue-400 border-blue-500/20",
  iot:       "bg-cyan-900/60 text-cyan-400 border-cyan-500/20",
  business:  "bg-green-900/40 text-green-400 border-green-500/20",
  finance:   "bg-amber-900/40 text-amber-400 border-amber-500/20",
  content:   "bg-violet-900/40 text-violet-400 border-violet-500/20",
  research:  "bg-pink-900/40 text-pink-400 border-pink-500/20",
  default:   "bg-bg-s2 text-white/50 border-border-subtle",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-4 text-xs font-medium border",
        CATEGORY_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

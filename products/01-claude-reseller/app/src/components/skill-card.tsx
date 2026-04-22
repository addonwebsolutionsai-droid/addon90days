import { ShoppingCart, Zap } from "lucide-react";
import { cn, formatPriceDollars } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mirrors the category enum from packages/toolkit/src/types/skill.ts
type SkillCategory = "developer" | "iot" | "content" | "business" | "research" | "finance";

export type SkillCardProps = {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  priceUsd: number;
  tags: string[];
  // Optional: highlight this card (e.g. featured / bestseller)
  featured?: boolean;
  onAddToCart?: (id: string) => void;
};

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  developer: "Developer",
  iot:       "IoT",
  content:   "Content",
  business:  "Business",
  research:  "Research",
  finance:   "Finance",
};

export function SkillCard({
  id,
  name,
  description,
  category,
  priceUsd,
  tags,
  featured = false,
  onAddToCart,
}: SkillCardProps) {
  return (
    <article
      className={cn(
        // Base card — dark surface, subtle border, 8px radius scale
        "group relative flex flex-col gap-4 rounded-16 border p-5 transition-all duration-200",
        "bg-bg-surface border-border-subtle",
        // Hover: lift the border color toward violet, subtle glow
        "hover:border-violet-500/30 hover:shadow-violet-md",
        // Featured cards get a persistent violet tint on the left edge
        featured && "border-l-2 border-l-violet-500"
      )}
    >
      {/* Aurora glow on hover — absolutely positioned, pointer-events-none */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-violet-glow pointer-events-none"
      />

      {/* Header row: category badge + featured tag */}
      <div className="flex items-center justify-between gap-2 relative">
        <Badge variant={category}>{CATEGORY_LABELS[category]}</Badge>
        {featured && (
          <span className="flex items-center gap-1 text-xs text-violet-400 font-medium">
            <Zap size={11} className="fill-violet-400" />
            Popular
          </span>
        )}
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-1.5 relative">
        <h3 className="font-semibold text-white text-sm leading-snug">{name}</h3>
        <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{description}</p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 relative" aria-label="Skill tags">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-4 bg-bg-s3 border border-border-subtle text-white/40 text-xs font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: price + CTA */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle relative">
        <div className="flex flex-col">
          <span className="text-base font-bold text-white">
            {formatPriceDollars(priceUsd)}
          </span>
          <span className="text-[10px] text-white/30 uppercase tracking-wider">one-time</span>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => onAddToCart?.(id)}
          aria-label={`Add ${name} to cart`}
        >
          <ShoppingCart size={13} />
          Add to Cart
        </Button>
      </div>
    </article>
  );
}

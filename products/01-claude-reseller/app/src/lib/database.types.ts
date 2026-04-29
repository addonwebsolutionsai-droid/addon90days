export type SkillDifficulty = "beginner" | "intermediate" | "advanced";
export type SkillCategory =
  | "ai-llm"
  | "iot"
  | "developer-tools"
  | "startup-product"
  | "ui-ux"
  | "indian-business"
  | "data-analytics"
  | "devops-infra"
  | "communication-protocols"
  | "marketing-growth"
  | "trading-finance";

export type SkillStep = {
  number: number;
  title: string;
  description: string;
  code?: string;
  language?: string;
};

export type Skill = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: SkillCategory;
  subcategory: string | null;
  tags: string[];
  difficulty: SkillDifficulty;
  price_inr: number;
  price_usd: number;
  is_free: boolean;
  steps: SkillStep[];
  video_url: string | null;
  video_thumbnail: string | null;
  trending_score: number;
  view_count: number;
  purchase_count: number;
  is_trending: boolean;
  is_new: boolean;
  is_featured: boolean;
  pack_id: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
};

// Flat Insert type (no Omit expressions — required for Supabase generic typing)
export type SkillInsertRow = {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: SkillCategory;
  subcategory?: string | null;
  tags?: string[];
  difficulty?: SkillDifficulty;
  price_inr?: number;
  price_usd?: number;
  is_free?: boolean;
  steps?: SkillStep[];
  video_url?: string | null;
  video_thumbnail?: string | null;
  trending_score?: number;
  view_count?: number;
  purchase_count?: number;
  is_trending?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  pack_id?: string | null;
  created_at?: string;
  updated_at?: string;
  published?: boolean;
};

export type Database = {
  public: {
    Tables: {
      skills: {
        Row: Skill;
        Insert: SkillInsertRow;
        Update: Partial<SkillInsertRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

#!/usr/bin/env node
/**
 * scripts/make-app.mjs — scaffold a new product Next.js app from the standard template.
 *
 * Path D plug-and-play in action: this script lays down a runnable Next.js 15
 * app with Clerk auth, Tailwind, design tokens, Razorpay billing and Supabase
 * client baseline — all in one command. Then runs `sync-libs.mjs` so every
 * shared utility from `packages/` lands in the new product's `lib/` ready to use.
 *
 * Usage:
 *   node scripts/make-app.mjs \
 *     --code=p07 \
 *     --name="MyProduct" \
 *     --slug=07-my-product \
 *     --pkg=my-product \
 *     --accent="#3b82f6" \
 *     --accent2="#8b5cf6" \
 *     --tagline="One-line tagline." \
 *     --description="One-paragraph description for OG meta."
 *
 * Required flags: --code, --name, --slug, --pkg, --accent.
 * --accent2 defaults to --accent if omitted.
 * --tagline / --description fall back to generic placeholders.
 *
 * Idempotent in spirit: refuses to overwrite an existing `products/<slug>/app/` —
 * if you want to re-scaffold, delete the dir first.
 *
 * Adds the new product code to every `packages/<name>/package.json`'s
 * `addonweb.sync.products` array if it isn't already there. Then runs sync.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PRODUCTS_DIR = join(REPO_ROOT, "products");
const PACKAGES_DIR = join(REPO_ROOT, "packages");

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

const required = ["code", "name", "slug", "pkg", "accent"];
for (const k of required) {
  if (!args[k]) {
    console.error(`make-app: missing --${k}`);
    console.error(`  required: ${required.map((r) => `--${r}`).join(", ")}`);
    process.exit(1);
  }
}

const productCode = args.code;          // e.g. "p07"
const productName = args.name;          // e.g. "MyProduct"
const productSlug = args.slug;          // e.g. "07-my-product"
const pkgName     = args.pkg;           // e.g. "my-product"
const accent      = args.accent;        // e.g. "#3b82f6"
const accent2     = args.accent2 ?? accent;
const tagline     = args.tagline ?? `${productName} — by AddonWeb`;
const description = args.description ?? `${productName}: one of AddonWeb's six AI-native products.`;

if (!/^p0[0-9]$/.test(productCode)) {
  console.error(`make-app: --code must look like "p07" (received: "${productCode}")`);
  process.exit(1);
}
if (!/^[0-9]{2}-[a-z0-9-]+$/.test(productSlug)) {
  console.error(`make-app: --slug must look like "07-my-product" (received: "${productSlug}")`);
  process.exit(1);
}

const APP_DIR = join(PRODUCTS_DIR, productSlug, "app");
if (existsSync(APP_DIR) && readdirSync(APP_DIR).filter((f) => f !== "README.md").length > 0) {
  console.error(`make-app: ${APP_DIR} already exists with content — refusing to overwrite.`);
  console.error(`  Delete it first if you really want to re-scaffold.`);
  process.exit(1);
}

console.log(`• Scaffolding ${productCode} (${productName}) at ${APP_DIR}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }); }

function writeFile(rel, content) {
  const full = join(APP_DIR, rel);
  ensureDir(dirname(full));
  writeFileSync(full, content, "utf8");
  console.log(`  ✓ ${rel}`);
}

function readJsonSafe(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch { return null; }
}

// ---------------------------------------------------------------------------
// File templates
// ---------------------------------------------------------------------------

const templates = {
  "package.json": JSON.stringify({
    name: `@addonweb/${pkgName}`,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      "type-check": "tsc --noEmit",
    },
    dependencies: {
      "@clerk/nextjs": "^6.12.0",
      "@supabase/supabase-js": "^2.105.4",
      "clsx": "^2.1.1",
      "lucide-react": "^0.400.0",
      "next": "15.3.9",
      "razorpay": "^2.9.6",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "tailwind-merge": "^2.3.0",
      "zod": "^3.23.0",
    },
    devDependencies: {
      "@types/node": "^20.14.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "autoprefixer": "^10.4.19",
      "eslint": "^8.57.0",
      "eslint-config-next": "15.3.9",
      "postcss": "^8.4.38",
      "tailwindcss": "^3.4.4",
      "typescript": "^5.4.5",
    },
  }, null, 2) + "\n",

  "tsconfig.json": JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: false,
      skipLibCheck: true,
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      noUncheckedIndexedAccess: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./src/*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  }, null, 2) + "\n",

  "next-env.d.ts":
    `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n`,

  "postcss.config.mjs":
    `const config = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n\nexport default config;\n`,

  "vercel.json": JSON.stringify({
    "$schema": "https://openapi.vercel.sh/vercel.json",
    buildCommand: "next build",
    framework: "nextjs",
    installCommand: "npm install",
    outputDirectory: ".next",
  }, null, 2) + "\n",
};

const accentRgb = hexToRgb(accent);
const accent2Rgb = hexToRgb(accent2);

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

const tailwindConfig = `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    "var(--bg-base)",
          surface: "var(--bg-surface)",
          s2:      "var(--bg-s2)",
          s3:      "var(--bg-s3)",
        },
        border: {
          subtle:  "var(--border-subtle)",
          DEFAULT: "var(--border)",
          strong:  "var(--border-strong)",
        },
        text: {
          primary:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted:     "var(--text-muted)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: { "4": "4px", "8": "8px", "12": "12px", "16": "16px", "20": "20px" },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
`;

const nextConfigTs = `import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com",    pathname: "/**" },
      { protocol: "https", hostname: "images.clerk.dev", pathname: "/**" },
    ],
  },
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
          { key: "Content-Security-Policy", value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://img.clerk.com https://images.clerk.dev",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://clerk.com https://*.clerk.accounts.dev https://api.clerk.dev https://api.groq.com",
              "frame-src https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; ")
          },
        ],
      },
      {
        source: "/api/((?!admin).*)",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        source: "/api/admin/(.*)",
        headers: [
          { key: "X-Robots-Tag",  value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default config;
`;

const middleware = `import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
`;

const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: light;
    --bg-base: #ffffff;
    --bg-surface: #f8f8fb;
    --bg-s2: #f0f0f4;
    --bg-s3: #e8e8ee;
    --border-subtle: #e5e5ea;
    --border: #d1d1d6;
    --border-strong: #b8b8c0;
    --text-primary: #09090b;
    --text-secondary: #52525b;
    --text-muted: #a1a1aa;
  }

  .dark {
    color-scheme: dark;
    --bg-base: #07070a;
    --bg-surface: #0f0f12;
    --bg-s2: #161619;
    --bg-s3: #1c1c20;
    --border-subtle: #1f1f24;
    --border: #27272d;
    --border-strong: #3a3a42;
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.6);
    --text-muted: rgba(255, 255, 255, 0.3);
  }

  html, body {
    background-color: var(--bg-base);
    color: var(--text-primary);
    @apply antialiased;
    scrollbar-gutter: stable;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
  }

  *:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${accent};
  }
}
`;

const layoutTsx = `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "${productName} — ${tagline}",
    template: "%s | ${productName}",
  },
  description: ${JSON.stringify(description)},
  authors: [{ name: "AddonWeb Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "${productName}",
    title: "${productName} — ${tagline}",
    description: ${JSON.stringify(description)},
  },
  twitter: {
    card: "summary_large_image",
    title: "${productName}",
    description: ${JSON.stringify(tagline)},
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={\`dark \${inter.variable}\`}>
        <body className="font-sans min-h-screen" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
`;

const pageTsx = `import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.4) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(${accent2Rgb.r},${accent2Rgb.g},${accent2Rgb.b},0.3) 0%, transparent 60%)",
        }}
      />

      <nav className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">${productName}</Link>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="px-4 py-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Sign in</Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-medium rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, ${accent}, ${accent2})" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-6 pt-12 pb-24 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-up">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            ${tagline.replace(/"/g, '\\"')}
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            ${description.replace(/"/g, '\\"')}
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: "linear-gradient(135deg, ${accent}, ${accent2})" }}
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
`;

const signInPage = `import { SignIn } from "@clerk/nextjs";\n\nexport default function SignInPage() {\n  return (\n    <main className="min-h-screen flex items-center justify-center p-6">\n      <SignIn />\n    </main>\n  );\n}\n`;

const signUpPage = `import { SignUp } from "@clerk/nextjs";\n\nexport default function SignUpPage() {\n  return (\n    <main className="min-h-screen flex items-center justify-center p-6">\n      <SignUp />\n    </main>\n  );\n}\n`;

const siteConfig = `/**\n * ${productName} — canonical site URL.\n *\n * Set NEXT_PUBLIC_APP_URL on Vercel once the project is deployed.\n */\n\nexport const SITE_BASE_URL: string =\n  process.env["NEXT_PUBLIC_APP_URL"] ?? "https://${pkgName}-addonweb.vercel.app";\n\nexport const SITE_DOMAIN: string = SITE_BASE_URL.replace(/^https?:\\/\\//, "").replace(/\\/$/, "");\n`;

const utils = `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]): string {\n  return twMerge(clsx(inputs));\n}\n`;

const databaseTypes = `/**\n * Minimal Database type for ${productCode.toUpperCase()} ${productName}.\n */\n\nexport type Database = {\n  public: {\n    Tables: Record<string, {\n      Row: Record<string, unknown>;\n      Insert: Record<string, unknown>;\n      Update: Record<string, unknown>;\n      Relationships: [];\n    }>;\n    Views: Record<string, never>;\n    Functions: {\n      check_rate_limit: {\n        Args: { p_key: string; p_limit: number; p_window_seconds: number };\n        Returns: Array<{ allowed: boolean; current_count: number; reset_at: string }>;\n      };\n    };\n    Enums: Record<string, never>;\n    CompositeTypes: Record<string, never>;\n  };\n};\n`;

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------

ensureDir(APP_DIR);
writeFile("package.json",       templates["package.json"]);
writeFile("tsconfig.json",      templates["tsconfig.json"]);
writeFile("next-env.d.ts",      templates["next-env.d.ts"]);
writeFile("postcss.config.mjs", templates["postcss.config.mjs"]);
writeFile("vercel.json",        templates["vercel.json"]);
writeFile("next.config.ts",     nextConfigTs);
writeFile("tailwind.config.ts", tailwindConfig);
writeFile("src/middleware.ts",  middleware);
writeFile("src/app/globals.css", globalsCss);
writeFile("src/app/layout.tsx", layoutTsx);
writeFile("src/app/page.tsx",   pageTsx);
writeFile("src/app/sign-in/[[...sign-in]]/page.tsx", signInPage);
writeFile("src/app/sign-up/[[...sign-up]]/page.tsx", signUpPage);
writeFile("src/lib/site-config.ts",   siteConfig);
writeFile("src/lib/utils.ts",         utils);
writeFile("src/lib/database.types.ts", databaseTypes);

// ---------------------------------------------------------------------------
// Update packages/<name>/package.json sync.products to include this product
// ---------------------------------------------------------------------------

console.log("");
console.log("• Registering product code in packages/*/package.json sync.products");

let pkgUpdates = 0;
for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifestPath = join(PACKAGES_DIR, entry.name, "package.json");
  const manifest = readJsonSafe(manifestPath);
  if (!manifest?.addonweb?.sync) continue;
  const list = manifest.addonweb.sync.products;
  if (!Array.isArray(list)) continue;
  if (!list.includes(productCode)) {
    list.push(productCode);
    list.sort();
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    console.log(`  ✓ packages/${entry.name}: added ${productCode}`);
    pkgUpdates++;
  }
}
console.log(`  ${pkgUpdates} package(s) updated`);

// ---------------------------------------------------------------------------
// Run sync-libs to populate the new product's lib + components
// ---------------------------------------------------------------------------

console.log("");
console.log("• Running sync-libs.mjs to populate lib/ + components/");
const syncResult = spawnSync("node", [join(__dirname, "sync-libs.mjs")], {
  cwd: REPO_ROOT,
  stdio: "inherit",
});
if (syncResult.status !== 0) {
  console.error("✗ sync-libs failed");
  process.exit(syncResult.status ?? 1);
}

console.log("");
console.log(`✓ Done. ${productCode} is scaffolded at ${APP_DIR}.`);
console.log("");
console.log("Next steps:");
console.log(`  1. cd products/${productSlug}/app && npm install`);
console.log(`  2. Set up a new Vercel project with Root Directory = products/${productSlug}/app`);
console.log(`  3. Copy P02's env vars (Supabase, Clerk, Razorpay, etc.) into the new project`);
console.log(`  4. Update lib/site-config.ts with the real Vercel URL once deployed`);

#!/usr/bin/env node
/**
 * scripts/sync-libs.mjs — propagate canonical libs from packages/ → each product app.
 *
 * Path D (see operations/decisions/2026-05-09-multi-app-product-separation.md):
 *   packages/<name>/src/<file>.ts is the single source of truth for shared utilities.
 *   Each product's app/src/lib/<file or subdir>/ holds a physical copy.
 *   This script overwrites those copies. Idempotent. No-op if everything is already in sync.
 *
 * Reads `addonweb.sync` from each package's package.json:
 *   {
 *     "destBase":   "lib" | "components" | ... (default: "lib"),
 *     "destSubdir": "" | "ai-support" | "billing" | "admin" | ...,
 *     "files":      ["supabase.ts", "database.types.ts", ...],
 *     "products":   ["p01", "p02", "p03", "p04", "p05", "p06"]
 *   }
 *
 * Each synced file gets a 3-line banner prepended on top so anyone editing
 * the in-product copy is reminded that their changes will be overwritten:
 *
 *   // AUTO-SYNCED FROM packages/<pkg>/src/<file> — DO NOT EDIT THIS COPY.
 *   // Edit upstream and run `node scripts/sync-libs.mjs` to propagate.
 *   // Last synced: <ISO timestamp>
 *
 * Usage:
 *   node scripts/sync-libs.mjs           # sync all packages → all configured products
 *   node scripts/sync-libs.mjs --check   # dry-run; print what would change, exit non-zero if drift detected
 *   node scripts/sync-libs.mjs --pkg=rbac --product=p01   # sync just one package to one product
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PACKAGES_DIR = join(REPO_ROOT, "packages");
const PRODUCTS_DIR = join(REPO_ROOT, "products");

// Map product code → product directory under products/
const PRODUCT_DIRS = {
  p01: "01-claude-reseller",
  p02: "02-whatsapp-ai-suite",
  p03: "03-gst-invoicing",
  p04: "04-restaurant-os",
  p05: "05-iot-platform",
  p06: "06-predictive-maintenance",
};

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const onlyPkg = args.find((a) => a.startsWith("--pkg="))?.slice("--pkg=".length);
const onlyProduct = args.find((a) => a.startsWith("--product="))?.slice("--product=".length);

// ---------------------------------------------------------------------------

function log(level, msg) {
  const prefix = { info: "•", ok: "✓", skip: "↷", warn: "!", err: "✗" }[level] ?? "·";
  console.log(`${prefix} ${msg}`);
}

function readJsonSafe(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch { return null; }
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
}

function bannerFor(pkgName, fileName) {
  const ts = new Date().toISOString();
  return [
    `// AUTO-SYNCED FROM packages/${pkgName}/src/${fileName} — DO NOT EDIT THIS COPY.`,
    `// Edit upstream and run \`node scripts/sync-libs.mjs\` to propagate to all products.`,
    `// Last synced: ${ts}`,
    "",
  ].join("\n");
}

function stripExistingBanner(content) {
  // If the destination file already starts with our banner, strip the first 3 lines + blank
  const lines = content.split("\n");
  if (lines[0]?.startsWith("// AUTO-SYNCED FROM packages/")) {
    // Remove banner lines (3 banner + 1 blank = 4)
    return lines.slice(4).join("\n");
  }
  return content;
}

function compareIgnoringBanner(existing, incoming) {
  return stripExistingBanner(existing).trim() === stripExistingBanner(incoming).trim();
}

// ---------------------------------------------------------------------------

function discoverPackages() {
  const entries = readdirSync(PACKAGES_DIR, { withFileTypes: true });
  const packages = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (onlyPkg && entry.name !== onlyPkg) continue;
    const pkgJsonPath = join(PACKAGES_DIR, entry.name, "package.json");
    const manifest = readJsonSafe(pkgJsonPath);
    if (!manifest) continue;
    const sync = manifest.addonweb?.sync;
    if (!sync) {
      log("skip", `packages/${entry.name}: no addonweb.sync block — skipping`);
      continue;
    }
    if (!Array.isArray(sync.files) || sync.files.length === 0) {
      log("skip", `packages/${entry.name}: addonweb.sync.files is empty — skipping`);
      continue;
    }
    packages.push({
      name: entry.name,
      pkgName: manifest.name,
      destBase: sync.destBase ?? "lib",
      destSubdir: sync.destSubdir ?? "",
      files: sync.files,
      products: Array.isArray(sync.products) && sync.products.length > 0
        ? sync.products
        : Object.keys(PRODUCT_DIRS),
    });
  }
  return packages;
}

function productAppExists(productCode) {
  const productDir = PRODUCT_DIRS[productCode];
  if (!productDir) return false;
  const appDir = join(PRODUCTS_DIR, productDir, "app");
  if (!existsSync(appDir)) return false;
  // The app must have a src/ directory — that signals it's a real Next.js app, not just a placeholder
  return existsSync(join(appDir, "src"));
}

// ---------------------------------------------------------------------------

let totalCopied = 0;
let totalSkippedSame = 0;
let totalDriftDetected = 0;
let warnings = [];

function syncOne(pkg, productCode) {
  if (onlyProduct && productCode !== onlyProduct) return;

  if (!productAppExists(productCode)) {
    log("skip", `[${pkg.name}] → ${productCode}: product app dir not found, skipping`);
    return;
  }

  const productDir = PRODUCT_DIRS[productCode];
  const destBaseDir = join(
    PRODUCTS_DIR,
    productDir,
    "app",
    "src",
    pkg.destBase,
    pkg.destSubdir,
  );
  ensureDir(destBaseDir);

  for (const fileName of pkg.files) {
    const sourcePath = join(PACKAGES_DIR, pkg.name, "src", fileName);
    if (!existsSync(sourcePath)) {
      warnings.push(`packages/${pkg.name}/src/${fileName} declared but missing on disk`);
      continue;
    }
    const sourceContent = readFileSync(sourcePath, "utf8");
    const banneredContent = bannerFor(pkg.name, fileName) + sourceContent;
    const destPath = join(destBaseDir, fileName);

    if (existsSync(destPath)) {
      const existing = readFileSync(destPath, "utf8");
      if (compareIgnoringBanner(existing, banneredContent)) {
        totalSkippedSame++;
        continue;
      }
      if (checkOnly) {
        totalDriftDetected++;
        log("warn", `DRIFT: ${productCode}/${pkg.destBase}/${pkg.destSubdir ? pkg.destSubdir + "/" : ""}${fileName}`);
        continue;
      }
    } else if (checkOnly) {
      totalDriftDetected++;
      log("warn", `MISSING: ${productCode}/${pkg.destBase}/${pkg.destSubdir ? pkg.destSubdir + "/" : ""}${fileName}`);
      continue;
    }

    if (!checkOnly) {
      writeFileSync(destPath, banneredContent, "utf8");
      totalCopied++;
      log("ok", `[${pkg.name}] → ${productCode}/${pkg.destBase}/${pkg.destSubdir ? pkg.destSubdir + "/" : ""}${fileName}`);
    }
  }
}

// ---------------------------------------------------------------------------

const packages = discoverPackages();

if (packages.length === 0) {
  log("err", "no packages with addonweb.sync metadata found — nothing to do");
  process.exit(checkOnly ? 0 : 1);
}

log("info", `Found ${packages.length} package(s) to sync: ${packages.map((p) => p.name).join(", ")}`);
log("info", `Mode: ${checkOnly ? "CHECK (dry-run, exits non-zero on drift)" : "WRITE"}`);
log("info", "");

for (const pkg of packages) {
  for (const productCode of pkg.products) {
    syncOne(pkg, productCode);
  }
}

log("info", "");
if (warnings.length > 0) {
  log("warn", `${warnings.length} warning(s):`);
  warnings.forEach((w) => log("warn", "  " + w));
}

if (checkOnly) {
  if (totalDriftDetected > 0) {
    log("err", `Drift detected in ${totalDriftDetected} file(s). Run \`node scripts/sync-libs.mjs\` to fix.`);
    process.exit(1);
  }
  log("ok", `Check passed: all ${totalSkippedSame} synced files are up-to-date.`);
  process.exit(0);
} else {
  log("ok", `Done. Wrote ${totalCopied} file(s). ${totalSkippedSame} were already in sync.`);
}

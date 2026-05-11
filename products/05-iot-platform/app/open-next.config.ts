import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare adapter config for ConnectOne (P05).
 *
 * No R2 incremental cache for this product yet — it's a marketing landing
 * page + light dashboard. ISR isn't used. When the platform grows and we
 * start caching API responses or pre-rendering large pages, swap to the
 * r2IncrementalCache override + bind an R2 bucket in wrangler.jsonc.
 */
export default defineCloudflareConfig({});

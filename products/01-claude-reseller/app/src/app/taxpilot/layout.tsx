import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

const TITLE = "TaxPilot — AI GST & Invoicing for Indian SMBs";
const DESC =
  "GST returns, e-invoicing, and reconciliation on autopilot. Built for Indian SMBs and CAs. No paid plans during beta.";
const URL = `${SITE_BASE_URL}/taxpilot`;

export const metadata: Metadata = {
  title:       { absolute: TITLE },
  description: DESC,
  alternates:  { canonical: URL },
  openGraph: {
    type:        "website",
    title:       TITLE,
    description: DESC,
    url:         URL,
    siteName:    "TaxPilot",
  },
  twitter: {
    card:        "summary_large_image",
    title:       TITLE,
    description: DESC,
  },
};

export default function TaxPilotLayout({ children }: { children: React.ReactNode }) {
  return children;
}

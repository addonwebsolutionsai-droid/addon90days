import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

const TITLE = "TableFlow — Smart Restaurant OS";
const DESC =
  "AI-powered restaurant operating system: orders, table management, kitchen ops, payments. Built for Indian restaurants. Free during beta.";
const URL = `${SITE_BASE_URL}/tableflow`;

export const metadata: Metadata = {
  title:       { absolute: TITLE },
  description: DESC,
  alternates:  { canonical: URL },
  openGraph: {
    type:        "website",
    title:       TITLE,
    description: DESC,
    url:         URL,
    siteName:    "TableFlow",
  },
  twitter: {
    card:        "summary_large_image",
    title:       TITLE,
    description: DESC,
  },
};

export default function TableFlowLayout({ children }: { children: React.ReactNode }) {
  return children;
}

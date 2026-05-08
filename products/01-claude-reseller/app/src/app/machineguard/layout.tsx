import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

const TITLE = "MachineGuard — IoT Predictive Maintenance";
const DESC =
  "Industrial predictive maintenance: vibration, temperature, current sensors → AI fault detection → alerts before breakdown. Built for Indian factories. Free during beta.";
const URL = `${SITE_BASE_URL}/machineguard`;

export const metadata: Metadata = {
  title:       { absolute: TITLE },
  description: DESC,
  alternates:  { canonical: URL },
  openGraph: {
    type:        "website",
    title:       TITLE,
    description: DESC,
    url:         URL,
    siteName:    "MachineGuard",
  },
  twitter: {
    card:        "summary_large_image",
    title:       TITLE,
    description: DESC,
  },
};

export default function MachineGuardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

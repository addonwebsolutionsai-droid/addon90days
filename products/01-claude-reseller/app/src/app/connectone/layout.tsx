import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

const TITLE = "ConnectOne — IoT Plug-and-Play Platform";
const DESC =
  "Plug-and-play IoT platform: device onboarding, MQTT broker, dashboards, alerting. Connect ESP32, STM32, nRF in minutes. Free during beta.";
const URL = `${SITE_BASE_URL}/connectone`;

export const metadata: Metadata = {
  title:       { absolute: TITLE },
  description: DESC,
  alternates:  { canonical: URL },
  openGraph: {
    type:        "website",
    title:       TITLE,
    description: DESC,
    url:         URL,
    siteName:    "ConnectOne",
  },
  twitter: {
    card:        "summary_large_image",
    title:       TITLE,
    description: DESC,
  },
};

export default function ConnectOneLayout({ children }: { children: React.ReactNode }) {
  return children;
}

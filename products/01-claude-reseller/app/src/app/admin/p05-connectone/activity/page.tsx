import { PlaceholderPanel } from "@/components/admin/PlaceholderPanel";

export const metadata = { title: "Activity" };

export default function Page() {
  return (
    <PlaceholderPanel
      title="Activity"
      description="See global audit log filtered by product."
      crossLinkHref="/admin/audit"
      crossLinkLabel="Global audit"
    />
  );
}

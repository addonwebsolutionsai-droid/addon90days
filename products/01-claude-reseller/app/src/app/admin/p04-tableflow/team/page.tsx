import { PlaceholderPanel } from "@/components/admin/PlaceholderPanel";

export const metadata = { title: "Team" };

export default function Page() {
  return (
    <PlaceholderPanel
      title="Team"
      description="Team management coming soon."
      crossLinkHref="/admin/users"
      crossLinkLabel="Global users"
    />
  );
}

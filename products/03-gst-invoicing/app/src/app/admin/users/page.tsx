import { PlaceholderPanel } from "@/components/admin/PlaceholderPanel";

export const metadata = { title: "Users" };

export default function Page() {
  return (
    <PlaceholderPanel
      title="Users"
      description="TaxPilot businesses and registrations - see Overview for business list."
      crossLinkHref="/admin"
      crossLinkLabel="Overview"
    />
  );
}

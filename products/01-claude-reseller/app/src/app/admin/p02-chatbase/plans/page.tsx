import { PlaceholderPanel } from "@/components/admin/PlaceholderPanel";

export const metadata = { title: "Plans" };

export default function Page() {
  return (
    <PlaceholderPanel
      title="Plans"
      description="Billing layer in progress - see global billing."
      crossLinkHref="/admin/billing/plans"
      crossLinkLabel="Global billing"
    />
  );
}

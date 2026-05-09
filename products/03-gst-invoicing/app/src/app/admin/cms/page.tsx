import { PlaceholderPanel } from "@/components/admin/PlaceholderPanel";

export const metadata = { title: "CMS" };

export default function Page() {
  return (
    <PlaceholderPanel
      title="CMS"
      description="Use global CMS with product_scope=p03 to manage content."
      crossLinkHref="/admin/cms"
      crossLinkLabel="Global CMS"
    />
  );
}

import { TutorialForm } from "@/app/admin/_components/tutorials/_TutorialForm";

export const metadata = { title: "New Tutorial — TaxPilot" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New Tutorial</h1>
        <p className="mt-1 text-sm text-zinc-400">TaxPilot (P03)</p>
      </div>
      <TutorialForm productId="p03" productSegment="p03-taxpilot" />
    </div>
  );
}

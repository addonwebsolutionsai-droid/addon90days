import { TutorialsListClient } from "@/app/admin/_components/tutorials/TutorialsListClient";

export const metadata = { title: "Tutorials — TaxPilot" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Tutorials</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage per-feature video tutorials for TaxPilot (P03).
        </p>
      </div>
      <TutorialsListClient productId="p03" productSegment="" />
    </div>
  );
}

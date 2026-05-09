import { TutorialsListClient } from "@/app/admin/_components/tutorials/TutorialsListClient";

export const metadata = { title: "Tutorials — ChatBase" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Tutorials</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage per-feature video tutorials for ChatBase (P02).
        </p>
      </div>
      <TutorialsListClient productId="p02" productSegment="p02-chatbase" />
    </div>
  );
}

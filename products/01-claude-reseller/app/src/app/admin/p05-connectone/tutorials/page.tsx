import { TutorialsListClient } from "@/app/admin/_components/tutorials/TutorialsListClient";

export const metadata = { title: "Tutorials — ConnectOne" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Tutorials</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage per-feature video tutorials for ConnectOne (P05).
        </p>
      </div>
      <TutorialsListClient productId="p05" productSegment="p05-connectone" />
    </div>
  );
}

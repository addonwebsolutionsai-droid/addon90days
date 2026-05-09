import { TutorialForm } from "@/app/admin/_components/tutorials/_TutorialForm";

export const metadata = { title: "New Tutorial — Skilon" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New Tutorial</h1>
        <p className="mt-1 text-sm text-zinc-400">Skilon (P01)</p>
      </div>
      <TutorialForm productId="p01" productSegment="p01-skilon" />
    </div>
  );
}

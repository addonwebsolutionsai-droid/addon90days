import { TutorialForm } from "@/app/admin/_components/tutorials/_TutorialForm";

export const metadata = { title: "New Tutorial — TableFlow" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New Tutorial</h1>
        <p className="mt-1 text-sm text-zinc-400">TableFlow (P04)</p>
      </div>
      <TutorialForm productId="p04" productSegment="p04-tableflow" />
    </div>
  );
}

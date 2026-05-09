import { TutorialForm } from "@/app/admin/_components/tutorials/_TutorialForm";

export const metadata = { title: "New Tutorial — ChatBase" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New Tutorial</h1>
        <p className="mt-1 text-sm text-zinc-400">ChatBase (P02)</p>
      </div>
      <TutorialForm productId="p02" productSegment="p02-chatbase" />
    </div>
  );
}

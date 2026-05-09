import { TutorialForm } from "@/app/admin/_components/tutorials/_TutorialForm";

export const metadata = { title: "New Tutorial — MachineGuard" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New Tutorial</h1>
        <p className="mt-1 text-sm text-zinc-400">MachineGuard (P06)</p>
      </div>
      <TutorialForm productId="p06" productSegment="p06-machineguard" />
    </div>
  );
}

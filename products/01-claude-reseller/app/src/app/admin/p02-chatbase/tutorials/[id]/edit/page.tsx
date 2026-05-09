import { EditTutorialForm } from "@/app/admin/_components/tutorials/_EditTutorialForm";

export const metadata = { title: "Edit Tutorial — ChatBase" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Edit Tutorial</h1>
        <p className="mt-1 text-sm text-zinc-400">ChatBase (P02)</p>
      </div>
      <EditTutorialForm tutorialId={id} productSegment="p02-chatbase" />
    </div>
  );
}

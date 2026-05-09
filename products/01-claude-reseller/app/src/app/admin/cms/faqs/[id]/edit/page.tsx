import { requireAdmin } from "@/lib/admin-guard";
import { redirect, notFound } from "next/navigation";
import { getFaq, listCategories } from "@/lib/cms/db";
import { FaqForm } from "../../_FaqForm";
import { FaqEditActions } from "./_FaqEditActions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Edit FAQ · CMS · Admin · SKILON" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/cms");
    redirect("/");
  }

  const { id } = await params;
  const [faq, categories] = await Promise.all([
    getFaq(id),
    listCategories({ kind: "faq" }),
  ]);

  if (faq === null) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/admin/cms?kind=faqs"
          className="inline-flex items-center gap-1 text-xs mb-4 hover:text-violet-400 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={12} /> Back to FAQs
        </Link>
        <h1 className="text-xl font-semibold">Edit FAQ</h1>
      </div>
      <div className="max-w-2xl space-y-6">
        <FaqForm initialData={faq} categories={categories} mode="edit" faqId={faq.id} />
        <FaqEditActions faq={faq} />
      </div>
    </div>
  );
}

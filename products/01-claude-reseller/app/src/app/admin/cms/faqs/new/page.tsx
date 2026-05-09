import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { listCategories } from "@/lib/cms/db";
import { FaqForm } from "../_FaqForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New FAQ · CMS · Admin · SKILON" };

export default async function NewFaqPage() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/cms/faqs/new");
    redirect("/");
  }

  const categories = await listCategories({ kind: "faq" });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/cms?kind=faqs"
          className="inline-flex items-center gap-1 text-xs mb-4 hover:text-violet-400 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={12} /> Back to FAQs
        </Link>
        <h1 className="text-xl font-semibold">New FAQ</h1>
      </div>
      <FaqForm categories={categories} mode="create" />
    </div>
  );
}

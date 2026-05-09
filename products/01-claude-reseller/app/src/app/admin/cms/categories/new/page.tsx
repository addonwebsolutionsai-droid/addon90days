import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { listCategories } from "@/lib/cms/db";
import { CategoryForm } from "./_CategoryForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Category · CMS · Admin · SKILON" };

export default async function NewCategoryPage() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/cms/categories/new");
    redirect("/");
  }

  const [blogCats, faqCats] = await Promise.all([
    listCategories({ kind: "blog" }),
    listCategories({ kind: "faq" }),
  ]);

  const allCategories = [...blogCats, ...faqCats];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/cms?kind=categories"
          className="inline-flex items-center gap-1 text-xs mb-4 hover:text-violet-400 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={12} /> Back to Categories
        </Link>
        <h1 className="text-xl font-semibold">New Category</h1>
      </div>
      <CategoryForm allCategories={allCategories} />
    </div>
  );
}

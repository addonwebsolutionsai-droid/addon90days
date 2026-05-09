import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { listCategories } from "@/lib/cms/db";
import { PostForm } from "../_PostForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Post · CMS · Admin · SKILON" };

export default async function NewPostPage() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/cms/posts/new");
    redirect("/");
  }

  const categories = await listCategories({ kind: "blog" });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/cms?kind=posts"
          className="inline-flex items-center gap-1 text-xs mb-4 hover:text-violet-400 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={12} /> Back to Posts
        </Link>
        <h1 className="text-xl font-semibold">New Blog Post</h1>
      </div>
      <PostForm categories={categories} mode="create" />
    </div>
  );
}

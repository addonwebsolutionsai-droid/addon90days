import { requireAdmin } from "@/lib/admin-guard";
import { redirect, notFound } from "next/navigation";
import { getPost, listCategories } from "@/lib/cms/db";
import { EditPostFormActions } from "./_EditPostForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Edit Post · CMS · Admin · SKILON" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/cms");
    redirect("/");
  }

  const { id } = await params;
  const [post, categories] = await Promise.all([
    getPost(id),
    listCategories({ kind: "blog" }),
  ]);

  if (post === null) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/admin/cms?kind=posts"
          className="inline-flex items-center gap-1 text-xs mb-4 hover:text-violet-400 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={12} /> Back to Posts
        </Link>
        <h1 className="text-xl font-semibold">Edit Post</h1>
        <p className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>{post.slug}</p>
      </div>
      <EditPostFormActions post={post} categories={categories} />
    </div>
  );
}

/**
 * /dashboard/taxpilot/new — register a new business.
 *
 * Server-renders the page shell + auth gate. The actual form is a client
 * island (CreateBusinessForm) so we get instant validation + Clerk-token
 * fetch via Bearer for the API call.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateBusinessForm } from "./CreateBusinessForm";

export default async function NewBusinessPage() {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/dashboard/taxpilot/new");

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link
        href="/dashboard/taxpilot"
        className="inline-flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to businesses
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add a business</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          The legal entity that will issue invoices. Most of these fields are optional —
          fill in what you have. You can edit details later.
        </p>
      </header>

      <CreateBusinessForm />
    </div>
  );
}

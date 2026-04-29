import { redirect } from "next/navigation";

/**
 * Dashboard is now /account.
 * This permanent redirect preserves any old bookmarks or links.
 */
export default function DashboardPage() {
  redirect("/account");
}

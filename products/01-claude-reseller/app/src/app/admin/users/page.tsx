import { UsersTable } from "./UsersTable";

export const metadata = { title: "Users · Admin" };
export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Users</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Every signed-up user, sorted by newest first. Search by name or email. Ban/unban one-click.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}

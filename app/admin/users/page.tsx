import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import CitizenProfile from "@/models/CitizenProfile";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const { data: clerkUsers } = await clerkClient.users.getUserList({ limit: 200 });
  await connectDB();
  const profiles = (await CitizenProfile.find({}).lean()) as any[];
  const profileMap = new Map(profiles.map((p) => [p.clerkId, p]));

  const users = clerkUsers.map((u) => ({
    id: u.id,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username || "Unnamed",
    email: u.emailAddresses[0]?.emailAddress ?? "",
    role: (u.publicMetadata as { role?: string })?.role ?? "citizen",
    points: profileMap.get(u.id)?.points ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Users</h1>
      <AdminUsersTable initialUsers={users} />
    </div>
  );
}
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import AdminIssuesTable from "@/components/admin/AdminIssuesTable";

export default async function AdminIssuesPage() {
  await connectDB();
  const issues = JSON.parse(JSON.stringify(await Issue.find({}).sort({ createdAt: -1 }).lean()));

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Issues</h1>
      <AdminIssuesTable initialIssues={issues} />
    </div>
  );
}

import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import IssuesList from "@/components/IssuesList";

export default async function IssuesPage() {
  await connectDB();
  const issues = JSON.parse(JSON.stringify(await Issue.find({}).sort({ createdAt: -1 }).lean()));

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Issues</h1>
      <p className="text-ink-soft mb-8">Reported by citizens across Kanpur.</p>
      <IssuesList initialIssues={issues} />
    </section>
  );
}

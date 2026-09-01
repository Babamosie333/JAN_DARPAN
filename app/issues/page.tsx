import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import IssuesExplorer from "@/components/IssuesExplorer";

export default async function IssuesPage() {
  await connectDB();
  const issues = JSON.parse(JSON.stringify(await Issue.find({}).sort({ createdAt: -1 }).lean()));

  return (
    <section className="max-w-[1180px] mx-auto px-4 md:px-6 py-14">
      <span className="text-xs font-mono uppercase tracking-widest text-green-ink bg-green-tint px-3 py-1.5 rounded-pill">
        Issues
      </span>
      <h1 className="text-3xl font-extrabold mt-3 mb-2">Civic Issues</h1>
      <p className="text-ink-soft mb-8">See what&apos;s happening across Kanpur.</p>
      <IssuesExplorer initialIssues={issues} />
    </section>
  );
}

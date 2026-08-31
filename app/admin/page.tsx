import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import Issue from "@/models/Issue";
import CitizenProfile from "@/models/CitizenProfile";

async function getStats() {
  await connectDB();
  const [totalIssues, resolvedIssues, activeIssues, areas, citizens] = await Promise.all([
    Issue.countDocuments({}),
    Issue.countDocuments({ status: "resolved" }),
    Issue.countDocuments({ status: { $ne: "resolved" } }),
    Area.find({}).lean(),
    CitizenProfile.countDocuments({}),
  ]);

  const avgScore = areas.length
    ? Math.round(areas.reduce((sum, a) => sum + a.score, 0) / areas.length)
    : 0;

  return { totalIssues, resolvedIssues, activeIssues, avgScore, citizens, areaCount: areas.length };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total issues", value: stats.totalIssues },
    { label: "Active issues", value: stats.activeIssues },
    { label: "Resolved", value: stats.resolvedIssues },
    { label: "Avg. civic score", value: stats.avgScore },
    { label: "Areas tracked", value: stats.areaCount },
    { label: "Registered citizens", value: stats.citizens },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-bg-raised border border-line rounded-md p-5 shadow-sm">
            <div className="font-mono text-3xl font-bold">{c.value}</div>
            <div className="text-xs text-ink-faint uppercase tracking-wide mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

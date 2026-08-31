import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import Issue from "@/models/Issue";

export default async function ImpactPage() {
  await connectDB();
  const [totalResolved, totalActive, areas] = await Promise.all([
    Issue.countDocuments({ status: "resolved" }),
    Issue.countDocuments({ status: { $ne: "resolved" } }),
    Area.find({}).lean(),
  ]);

  const avgScore = areas.length
    ? Math.round(areas.reduce((sum, a: any) => sum + a.score, 0) / areas.length)
    : 0;

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Impact</h1>
      <p className="text-ink-soft mb-10">Collective civic action, measured across Kanpur.</p>

      <div className="grid grid-cols-3 gap-4 mb-14">
        <div className="bg-bg-raised border border-line rounded-md p-6 text-center">
          <div className="font-mono text-4xl font-bold text-green-ink">{totalResolved}</div>
          <div className="text-xs text-ink-faint uppercase mt-1">Issues Resolved</div>
        </div>
        <div className="bg-bg-raised border border-line rounded-md p-6 text-center">
          <div className="font-mono text-4xl font-bold text-saffron-ink">{totalActive}</div>
          <div className="text-xs text-ink-faint uppercase mt-1">Active Issues</div>
        </div>
        <div className="bg-bg-raised border border-line rounded-md p-6 text-center">
          <div className="font-mono text-4xl font-bold">{avgScore}</div>
          <div className="text-xs text-ink-faint uppercase mt-1">Avg. Civic Score</div>
        </div>
      </div>

      <div id="about" className="max-w-2xl">
        <h2 className="text-xl font-bold mb-3">About Jan Darpan</h2>
        <p className="text-ink-soft text-sm leading-relaxed">
          Jan Darpan treats each neighbourhood&apos;s civic health like a vital-signs readout —
          roads, cleanliness, lighting, water, greenery, traffic, accessibility, and public services,
          scored and tracked over time. Citizens report issues, confirm what they see, and watch the
          score respond as things improve.
        </p>
      </div>
    </section>
  );
}
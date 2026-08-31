import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import Issue from "@/models/Issue";

export default async function AreaDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  const area = await Area.findOne({ id: params.id }).lean();
  if (!area) notFound();

  const issues = JSON.parse(
    JSON.stringify(
      await Issue.find({ areaId: params.id, status: { $ne: "resolved" } })
        .sort({ priority: -1 })
        .limit(10)
        .lean()
    )
  );

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">{area.name}</h1>
          <p className="text-ink-faint text-sm">{area.city}</p>
        </div>
        <span className="font-mono font-bold text-4xl">{area.score}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-10">
        {Object.entries(area.categories as Record<string, number>).map(([cat, score]) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="w-32 text-sm capitalize text-ink-soft">{cat}</span>
            <div className="flex-1 h-2 bg-line-soft rounded-pill overflow-hidden">
              <div className="h-full bg-green rounded-pill" style={{ width: `${score}%` }} />
            </div>
            <span className="text-sm font-mono w-8 text-right">{score}</span>
          </div>
        ))}
      </div>

      {area.alerts?.length > 0 && (
        <div className="mb-10 space-y-2">
          {area.alerts.map((a: any, i: number) => (
            <div key={i} className="bg-blue-tint text-blue text-sm rounded-sm px-4 py-3">
              {a.text}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Active issues here</h2>
      <div className="space-y-2 mb-10">
        {issues.map((issue: any) => (
          <div
            key={issue._id}
            className="flex items-center justify-between bg-bg-raised border border-line rounded-sm p-4"
          >
            <div>
              <div className="font-medium">{issue.title}</div>
              <div className="text-xs text-ink-faint">{issue.location}</div>
            </div>
            <span className="font-mono text-sm">{issue.priority}/100</span>
          </div>
        ))}
        {issues.length === 0 && (
          <p className="text-ink-faint text-sm">No active issues reported in this area right now.</p>
        )}
      </div>

      <Link
        href={`/report?area=${area.id}`}
        className="inline-block bg-saffron text-white px-5 py-3 rounded-pill font-semibold"
      >
        Report an issue here
      </Link>
    </section>
  );
}

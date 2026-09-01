import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import Issue from "@/models/Issue";
import RingGauge from "@/components/RingGauge";
import TrendChart from "@/components/TrendChart";

const CATEGORY_LABELS: Record<string, string> = {
  roads: "Roads",
  cleanliness: "Cleanliness",
  lighting: "Street Lighting",
  water: "Water",
  greenery: "Greenery",
  traffic: "Traffic",
  accessibility: "Accessibility",
  services: "Public Services",
};

function healthLabel(score: number) {
  if (score >= 75) return { text: "Healthy", cls: "bg-green-tint text-green-ink" };
  if (score >= 55) return { text: "Needs Attention", cls: "bg-orange-tint text-saffron-ink" };
  return { text: "Critical", cls: "bg-red-tint text-red" };
}

const STATUS_STYLES: Record<string, string> = {
  reported: "bg-blue-tint text-blue",
  "in-progress": "bg-orange-tint text-saffron-ink",
  resolved: "bg-green-tint text-green-ink",
  rejected: "bg-red-tint text-red",
};

export default async function AreaDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  const areaDoc = await Area.findOne({ id: params.id }).lean();
  if (!areaDoc) notFound();
  const area = areaDoc as any;

  const issues = JSON.parse(
    JSON.stringify(
      await Issue.find({ areaId: params.id, status: { $ne: "resolved" } })
        .sort({ priority: -1 })
        .limit(9)
        .lean()
    )
  );

  const health = healthLabel(area.score);

  // Lowest 3 category scores become "Top Priorities" — the categories dragging the area down most.
  const topPriorities = Object.entries(area.categories as Record<string, number>)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  return (
    <section className="max-w-[1180px] mx-auto px-4 md:px-6 py-14">
      <p className="text-ink-faint text-sm mb-1">{area.city}</p>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-8">
        <h1 className="text-3xl font-extrabold">{area.name}</h1>
        <span className={`text-xs font-semibold px-3 py-1 rounded-pill ${health.cls}`}>
          {health.text}
        </span>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6 mb-10">
        <div className="bg-bg-raised border border-line rounded-md p-6 flex flex-col items-center text-center">
          <span className="text-xs uppercase tracking-wide text-ink-faint mb-3">Civic Health</span>
          <RingGauge score={area.score} size={140} stroke={12} label="/ 100" />
          <span className="text-green-ink text-sm font-semibold mt-3">
            {area.delta >= 0 ? "+" : ""}
            {area.delta} this month
          </span>
          <div className="w-full flex flex-col gap-2 mt-6">
            <Link
              href={`/report?area=${area.id}`}
              className="bg-saffron text-white text-sm font-semibold py-2.5 rounded-pill"
            >
              Report Issue
            </Link>
            <a
              href="#active-issues"
              className="border border-line text-sm font-semibold py-2.5 rounded-pill"
            >
              View Active Issues
            </a>
          </div>
        </div>

        <div className="bg-bg-raised border border-line rounded-md p-6">
          <h2 className="font-bold mb-4">Category breakdown</h2>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {Object.entries(area.categories as Record<string, number>).map(([cat, score]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-28 text-sm text-ink-soft">{CATEGORY_LABELS[cat] ?? cat}</span>
                <div className="flex-1 h-2 bg-line-soft rounded-pill overflow-hidden">
                  <div
                    className={`h-full rounded-pill ${score >= 75 ? "bg-green" : score >= 55 ? "bg-saffron" : "bg-red"}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-8 text-right">{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">What&apos;s happening in {area.name}?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard value={area.activeIssues + area.resolvedThisMonth} label="Issues Reported" />
        <StatCard value={area.resolvedThisMonth} label="Issues Resolved" />
        <StatCard value={area.citizens} label="Citizens Participating" />
        <StatCard value={area.impacted} label="People Potentially Impacted" />
      </div>

      <h2 className="text-xl font-bold mb-4">Top Priorities</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {topPriorities.map(([cat, score], i) => (
          <div key={cat} className="bg-bg-raised border border-line rounded-md p-5">
            <span className="text-xs text-ink-faint uppercase tracking-wide">Priority {i + 1}</span>
            <h3 className="font-bold mt-1">{CATEGORY_LABELS[cat] ?? cat}</h3>
            <span
              className={`font-mono font-bold text-lg ${
                score >= 55 ? "text-saffron-ink" : "text-red"
              }`}
            >
              {score}/100
            </span>
            <p className="text-xs text-ink-faint mt-1 mb-3">Needs continued attention</p>
            <a href="#active-issues" className="text-xs font-semibold border border-line rounded-pill px-3 py-1.5 inline-block">
              View Issues
            </a>
          </div>
        ))}
      </div>

      {area.trend?.length > 0 && (
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 mb-10">
          <div className="bg-bg-raised border border-line rounded-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">Civic Health Trend</h2>
              <span className="text-xs text-green-ink font-semibold">
                +{area.trend[area.trend.length - 1].score - area.trend[0].score} points since{" "}
                {area.trend[0].month}
              </span>
            </div>
            <TrendChart data={area.trend} />
          </div>

          {area.alerts?.length > 0 && (
            <div className="bg-bg-raised border border-line rounded-md p-6">
              <h2 className="font-bold mb-4">Civic Alerts</h2>
              <div className="space-y-2">
                {area.alerts.map((a: any, i: number) => (
                  <div
                    key={i}
                    className={`text-sm rounded-sm px-3 py-2.5 ${
                      a.tone === "red"
                        ? "bg-red-tint text-red"
                        : a.tone === "orange"
                        ? "bg-orange-tint text-saffron-ink"
                        : a.tone === "green"
                        ? "bg-green-tint text-green-ink"
                        : "bg-blue-tint text-blue"
                    }`}
                  >
                    {a.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <h2 id="active-issues" className="text-xl font-bold mb-4 scroll-mt-20">
        Active issues here
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {issues.map((issue: any) => (
          <div key={issue._id} className="bg-bg-raised border border-line rounded-md overflow-hidden">
            {issue.photo && (
              <img src={issue.photo} alt={issue.title} className="w-full h-32 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-line-soft text-ink-soft px-2 py-0.5 rounded-pill capitalize">
                  {issue.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-pill capitalize ${STATUS_STYLES[issue.status]}`}>
                  {issue.status}
                </span>
              </div>
              <h4 className="font-semibold text-sm">{issue.title}</h4>
              <p className="text-xs text-ink-faint mt-0.5">{issue.location}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-sm font-bold">{issue.priority}/100</span>
                <span className="text-xs text-ink-faint">{issue.confirms} confirmations</span>
              </div>
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <p className="text-ink-faint text-sm col-span-full">
            No active issues reported in this area right now.
          </p>
        )}
      </div>

      {area.improvements?.length > 0 && (
        <div className="bg-bg-raised border border-line rounded-md p-6 mb-10">
          <h2 className="font-bold mb-3">Recent Improvements</h2>
          <ul className="space-y-2">
            {area.improvements.map((imp: string, i: number) => (
              <li key={i} className="text-sm text-ink-soft flex items-start gap-2">
                <span className="text-green-ink">✓</span> {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={`/report?area=${area.id}`}
        className="inline-block bg-saffron text-white px-5 py-3 rounded-pill font-semibold"
      >
        Report an issue here
      </Link>
    </section>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-bg-raised border border-line rounded-md p-4 text-center">
      <div className="font-mono font-bold text-xl">{value}</div>
      <div className="text-xs text-ink-faint mt-1">{label}</div>
    </div>
  );
}

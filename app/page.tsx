import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import Issue from "@/models/Issue";
import RingGauge from "@/components/RingGauge";
import CivicMap from "@/components/CivicMap";
import Leaderboard from "@/components/Leaderboard";

const LOOP_STEPS: [string, string][] = [
  ["Discover", "See your area's civic score"],
  ["Understand", "Break it down by category"],
  ["Report", "Flag what needs attention"],
  ["Verify", "Community confirms it's real"],
  ["Resolve", "Local action gets tracked"],
  ["Measure", "Watch the score improve"],
];

const AZADI_GOAL = 75;

export default async function HomePage() {
  await connectDB();
  const [activeIssues, resolvedIssues, reporterIds, areasRaw, totalConfirms] = await Promise.all([
    Issue.countDocuments({ status: { $ne: "resolved" } }),
    Issue.countDocuments({ status: "resolved" }),
    Issue.distinct("reportedBy"),
    Area.find({}).sort({ score: -1 }).lean(),
    Issue.aggregate([{ $group: { _id: null, total: { $sum: "$confirms" } } }]),
  ]);

  const areas = JSON.parse(JSON.stringify(areasRaw));
  const citizenCount = reporterIds.filter(Boolean).length;
  const topArea = areas[0];

  const citySore = areas.length
    ? Math.round(areas.reduce((sum: number, a: any) => sum + a.score, 0) / areas.length)
    : 0;

  // "Azadi Civic Challenge" — every report + every confirm counts as one civic action.
  const azadiActions = Math.min(
    AZADI_GOAL,
    resolvedIssues + activeIssues + (totalConfirms[0]?.total || 0)
  );

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="pt-14 pb-16">
        <div className="max-w-[1180px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-saffron-ink bg-saffron-tint px-3 py-1.5 rounded-pill">
              🇮🇳 Code for the Nation — Civic Health Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              See Your Area.
              <br />
              Shape Your City.
            </h1>
            <p className="text-ink-soft text-lg max-w-md">
              Explore the civic health of your neighbourhood, report what needs attention, and see
              how collective action creates change — one locality at a time.
            </p>
            <div className="flex gap-3 flex-wrap pt-2">
              <Link href="/areas" className="bg-ink text-white px-5 py-3 rounded-pill font-semibold">
                Explore Your Area
              </Link>
              <Link href="/report" className="bg-saffron text-white px-5 py-3 rounded-pill font-semibold">
                Report an Issue
              </Link>
            </div>
            <div className="flex gap-8 flex-wrap pt-6">
              <Stat label="Active issues" value={activeIssues} />
              <Stat label="Resolved" value={resolvedIssues} />
              <Stat label="Citizens participating" value={citizenCount} />
            </div>
          </div>

          {topArea && (
            <div className="bg-bg-raised rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-ink-faint">
                    Civic Health Profile
                  </span>
                  <h3 className="text-xl font-bold mt-0.5">{topArea.name}</h3>
                </div>
                <span className="bg-green-tint text-green-ink text-xs font-semibold px-3 py-1 rounded-pill">
                  Healthy
                </span>
              </div>
              <div className="flex items-center gap-5">
                <RingGauge score={topArea.score} size={96} stroke={9} />
                <div className="flex-1 space-y-2">
                  {Object.entries(topArea.categories)
                    .slice(0, 3)
                    .map(([cat, score]) => (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="w-24 text-xs capitalize text-ink-soft">{cat}</span>
                        <div className="flex-1 h-2 bg-line-soft rounded-pill overflow-hidden">
                          <div
                            className="h-full bg-green rounded-pill"
                            style={{ width: `${score as number}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-6 text-right">{score as number}</span>
                      </div>
                    ))}
                </div>
              </div>
              <hr className="my-4 border-line" />
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">
                  {topArea.activeIssues} active issues · {topArea.resolvedThisMonth} resolved this
                  month
                </span>
                <span className="text-green-ink font-semibold">
                  {topArea.delta >= 0 ? "+" : ""}
                  {topArea.delta}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-[1180px] mx-auto px-6">
        <div className="pulse-rule" />
      </div>

      {/* ============ KANPUR CIVIC PULSE ============ */}
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-green-ink bg-green-tint px-3 py-1.5 rounded-pill">
              Kanpur Civic Pulse
            </span>
            <h2 className="text-3xl font-extrabold mt-3 mb-2">How is Kanpur doing?</h2>
            <p className="text-ink-soft">
              Explore the civic health of neighbourhoods across the city — updated as citizens
              report, verify and resolve issues.
            </p>
          </div>

          <div className="grid md:grid-cols-[1.6fr_1fr] gap-8 items-start">
            <div>
              <CivicMap areas={areas} />
              <div className="flex justify-center mt-4">
                <Link
                  href="/areas"
                  className="border border-line rounded-pill px-5 py-2.5 text-sm font-semibold hover:bg-line-soft"
                >
                  Explore full map →
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-bg-raised border border-line rounded-md p-6 text-center">
                <span className="text-xs uppercase tracking-wide text-ink-faint">
                  Kanpur Civic Score
                </span>
                <div className="flex justify-center mt-3">
                  <RingGauge score={citySore} size={150} stroke={12} label="/ 100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-raised border border-line rounded-md p-4 text-center">
                  <div className="font-mono font-bold text-xl">{activeIssues}</div>
                  <div className="text-xs text-ink-faint mt-1">Active Issues</div>
                </div>
                <div className="bg-bg-raised border border-line rounded-md p-4 text-center">
                  <div className="font-mono font-bold text-xl">{resolvedIssues}</div>
                  <div className="text-xs text-ink-faint mt-1">Resolved</div>
                </div>
                <div className="bg-bg-raised border border-line rounded-md p-4 text-center col-span-2">
                  <div className="font-mono font-bold text-xl">{citizenCount}</div>
                  <div className="text-xs text-ink-faint mt-1">Citizens Participating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-14 bg-bg-raised border-y border-line">
        <div className="max-w-[1180px] mx-auto px-6">
          <span className="text-xs font-mono uppercase tracking-widest text-blue bg-blue-tint px-3 py-1.5 rounded-pill">
            The civic loop
          </span>
          <h2 className="text-3xl font-extrabold mt-3 mb-8">
            From noticing to knowing it&apos;s fixed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {LOOP_STEPS.map(([title, desc], i) => (
              <div key={title} className="bg-bg border border-line rounded-md p-4 text-center">
                <span className="font-mono text-ink-faint text-xs">0{i + 1}</span>
                <h4 className="font-bold text-sm mt-1.5">{title}</h4>
                <p className="text-xs text-ink-soft mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LEADERBOARD + AZADI CHALLENGE ============ */}
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-green-ink bg-green-tint px-3 py-1.5 rounded-pill">
              Leaderboard
            </span>
            <h2 className="text-2xl font-extrabold mt-3 mb-5">Neighbourhoods leading the way</h2>
            <Leaderboard areas={areas} />
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-saffron-ink bg-saffron-tint px-3 py-1.5 rounded-pill">
              🇮🇳 75 years, 75 actions
            </span>
            <h2 className="text-2xl font-extrabold mt-3 mb-5">Azadi Civic Challenge</h2>
            <div className="bg-bg-raised border border-line rounded-md p-6">
              <p className="text-ink-soft text-sm">
                Every report, verification and supported suggestion counts as one civic action
                toward the community&apos;s goal this Independence season.
              </p>
              <div className="flex items-center justify-between mt-5 mb-2">
                <span className="font-mono font-bold text-xl">
                  {azadiActions} / {AZADI_GOAL}
                </span>
                <span className="text-sm text-ink-soft">actions</span>
              </div>
              <div className="h-3 bg-line-soft rounded-pill overflow-hidden">
                <div
                  className="h-full rounded-pill"
                  style={{
                    width: `${(azadiActions / AZADI_GOAL) * 100}%`,
                    background: "linear-gradient(90deg, #F28C28, #138A4B)",
                  }}
                />
              </div>
              <p className="text-xs text-ink-faint mt-4">
                {AZADI_GOAL} actions. {AZADI_GOAL} citizens. One stronger community.
              </p>
              <Link
                href="/impact"
                className="inline-block border border-line rounded-pill px-4 py-2 text-sm font-semibold mt-4 hover:bg-line-soft"
              >
                See the challenge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="font-mono font-bold text-xl">{value}</span>
      <br />
      <span className="text-xs text-ink-faint">{label}</span>
    </div>
  );
}

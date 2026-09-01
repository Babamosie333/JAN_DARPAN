import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import Issue from "@/models/Issue";
import CitizenProfile from "@/models/CitizenProfile";
import RingGauge from "@/components/RingGauge";
import TrendChart from "@/components/TrendChart";
import Leaderboard from "@/components/Leaderboard";

const AZADI_GOAL = 75;
const AZADI_ACTIONS = [
  "Report a civic issue",
  "Verify an existing issue",
  "Support a community improvement",
  "Report waste",
  "Report broken streetlight",
  "Suggest a civic improvement",
];

export default async function ImpactPage() {
  const { userId } = auth();

  await connectDB();
  const [totalResolved, totalActive, areasRaw, reporterIds, totalConfirms, myProfile] =
    await Promise.all([
      Issue.countDocuments({ status: "resolved" }),
      Issue.countDocuments({ status: { $ne: "resolved" } }),
      Area.find({}).lean(),
      Issue.distinct("reportedBy"),
      Issue.aggregate([{ $group: { _id: null, total: { $sum: "$confirms" } } }]),
      userId ? CitizenProfile.findOne({ clerkId: userId }).lean() : null,
    ]);

  const areas = JSON.parse(JSON.stringify(areasRaw));
  const citizenCount = reporterIds.filter(Boolean).length;
  const avgScore = areas.length
    ? Math.round(areas.reduce((sum: number, a: any) => sum + a.score, 0) / areas.length)
    : 0;

  // Build a city-wide trend by averaging each area's monthly score across all areas.
  const cityTrend: { month: string; score: number }[] = [];
  if (areas.length && areas[0].trend?.length) {
    const months = areas[0].trend.map((t: any) => t.month);
    months.forEach((month: string, i: number) => {
      const avg = Math.round(
        areas.reduce((sum: number, a: any) => sum + (a.trend[i]?.score ?? a.score), 0) / areas.length
      );
      cityTrend.push({ month, score: avg });
    });
  }
  const trendDelta =
    cityTrend.length > 1 ? cityTrend[cityTrend.length - 1].score - cityTrend[0].score : 0;

  const mostImproved = [...areas].sort((a: any, b: any) => b.delta - a.delta).slice(0, 3);
  const communityActions = totalConfirms[0]?.total || 0;
  const azadiActions = Math.min(AZADI_GOAL, totalResolved + totalActive + communityActions);

  const profile = myProfile as any;

  return (
    <section className="max-w-[1180px] mx-auto px-4 md:px-6 py-14">
      <span className="text-xs font-mono uppercase tracking-widest text-green-ink bg-green-tint px-3 py-1.5 rounded-pill">
        Impact
      </span>
      <h1 className="text-3xl font-extrabold mt-3 mb-2">See the Change</h1>
      <p className="text-ink-soft mb-8">
        Every report, confirmation and resolution contributes to a better neighbourhood.
      </p>

      <div className="grid md:grid-cols-[1fr_1.6fr] gap-6 mb-10">
        <div className="bg-bg-raised border border-line rounded-md p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-wide text-ink-faint mb-3">
            Kanpur Civic Score
          </span>
          <RingGauge score={avgScore} size={130} stroke={11} label="/ 100" />
        </div>
        <div className="bg-bg-raised border border-line rounded-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold">City-wide trend</h2>
            {cityTrend.length > 0 && (
              <span className="text-xs text-green-ink font-semibold">
                {trendDelta >= 0 ? "+" : ""}
                {trendDelta} points since {cityTrend[0].month}
              </span>
            )}
          </div>
          {cityTrend.length > 0 ? (
            <TrendChart data={cityTrend} />
          ) : (
            <p className="text-ink-faint text-sm">Not enough data yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        <StatCard value={citizenCount} label="Citizens Involved" />
        <StatCard value={totalResolved} label="Issues Resolved" />
        <StatCard
          value={areas.reduce((sum: number, a: any) => sum + (parseInt(a.impacted) || 0), 0) + "K+"}
          label="People Potentially Impacted"
        />
        <StatCard value={communityActions} label="Community Actions" />
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        <div>
          <h2 className="text-xl font-bold mb-4">Neighbourhoods leading the way</h2>
          <Leaderboard areas={areas} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Most Improved Areas</h2>
          <div className="bg-bg-raised border border-line rounded-md divide-y divide-line-soft">
            {mostImproved.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold">{a.name}</span>
                <span className="text-green-ink text-sm font-semibold">↑ +{a.delta} points</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-saffron-tint to-green-tint rounded-md p-6 md:p-8 mb-14">
        <span className="text-xs font-mono uppercase tracking-widest text-saffron-ink">
          🇮🇳 Azadi Civic Challenge
        </span>
        <h2 className="text-2xl font-extrabold mt-2 mb-1">75 Actions for a Better India</h2>
        <div className="flex items-center justify-between mt-4 mb-2">
          <span className="font-mono font-bold text-2xl">
            {azadiActions} / {AZADI_GOAL}
          </span>
          <span className="text-sm text-ink-soft">actions completed</span>
        </div>
        <div className="h-3 bg-white/60 rounded-pill overflow-hidden mb-5">
          <div
            className="h-full rounded-pill"
            style={{
              width: `${(azadiActions / AZADI_GOAL) * 100}%`,
              background: "linear-gradient(90deg, #F28C28, #138A4B)",
            }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AZADI_ACTIONS.map((a) => (
            <div key={a} className="bg-white/70 text-xs font-medium rounded-sm px-3 py-2">
              ✓ {a}
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-faint mt-4">
          {AZADI_GOAL} actions. {AZADI_GOAL} citizens. One stronger community.
        </p>
      </div>

      {profile && (
        <div className="bg-bg-raised border border-line rounded-md p-6 grid md:grid-cols-[1fr_1.6fr] gap-6 mb-14">
          <div>
            <h2 className="font-bold mb-2">My Civic Impact</h2>
            <div className="font-mono font-extrabold text-3xl">{profile.points} pts</div>
            <span className="text-xs bg-saffron-tint text-saffron-ink px-2 py-1 rounded-pill inline-block mt-2">
              {profile.badges?.[0] ?? "Civic Contributor"}
            </span>
            <div className="text-sm text-ink-soft mt-4 space-y-1">
              <div className="flex justify-between">
                <span>Issues reported</span>
                <span className="font-mono">{profile.reportedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Issues confirmed</span>
                <span className="font-mono">{profile.confirmedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Resolutions verified</span>
                <span className="font-mono">{profile.verifiedCount}</span>
              </div>
            </div>
          </div>
          {profile.badges?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Badges</h3>
              <div className="flex gap-3 flex-wrap">
                {profile.badges.map((b: string) => (
                  <div
                    key={b}
                    className="bg-bg border border-line rounded-md px-4 py-3 text-center w-24"
                  >
                    <div className="text-xl mb-1">🏅</div>
                    <div className="text-[10px] text-ink-soft">{b}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-bg-raised border border-line rounded-md p-4 text-center">
      <div className="font-mono font-bold text-xl">{value}</div>
      <div className="text-xs text-ink-faint mt-1">{label}</div>
    </div>
  );
}

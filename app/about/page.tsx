import Link from "next/link";

const TEAM_VALUES = [
  ["Transparency", "Every score, report, and status change is visible to the whole community."],
  ["Verification", "Reports are confirmed by fellow citizens before they carry real weight."],
  ["Local action", "Data is only useful if it leads somewhere — every issue is tracked to resolution."],
];

export default function AboutPage() {
  return (
    <section className="max-w-[900px] mx-auto px-4 md:px-6 py-14">
      <span className="text-xs font-mono uppercase tracking-widest text-blue bg-blue-tint px-3 py-1.5 rounded-pill">
        About
      </span>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-4">Your Voice. Our Responsibility.</h1>
      <p className="text-ink-soft text-lg mb-10 max-w-2xl">
        Jan Darpan is a civic issue-reporting platform for Kanpur. It gives every neighbourhood a
        live civic health score, and gives every citizen a direct way to report, verify, and track
        what needs fixing — turning scattered complaints into a measurable, collective effort.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-14">
        {TEAM_VALUES.map(([title, desc]) => (
          <div key={title} className="bg-bg-raised border border-line rounded-md p-5">
            <h3 className="font-bold mb-2">{title}</h3>
            <p className="text-sm text-ink-soft">{desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-extrabold mb-4">How the civic score works</h2>
      <p className="text-ink-soft mb-6 max-w-2xl">
        Each area is scored 0–100 across eight categories — roads, cleanliness, street lighting,
        water, greenery, traffic, accessibility, and public services. The overall score is the
        average across categories, and it moves as issues get reported, confirmed by the community,
        and resolved by local action.
      </p>

      <h2 className="text-2xl font-extrabold mb-4">Why this matters for Kanpur</h2>
      <p className="text-ink-soft mb-10 max-w-2xl">
        Municipal grievance systems often feel like a one-way channel — you report something and
        hear nothing back. Jan Darpan makes the whole loop visible: what was reported, who confirmed
        it, what changed, and how the neighbourhood&apos;s score responded. That visibility is the
        point — it turns individual frustration into a shared, trackable civic record.
      </p>

      <div className="bg-bg-raised border border-line rounded-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold">Ready to see your area?</h3>
          <p className="text-sm text-ink-soft">Explore civic scores across Kanpur&apos;s wards.</p>
        </div>
        <Link href="/areas" className="bg-ink text-white px-5 py-3 rounded-pill font-semibold whitespace-nowrap">
          Explore Areas
        </Link>
      </div>
    </section>
  );
}

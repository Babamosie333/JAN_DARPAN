import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import ReportForm from "@/components/ReportForm";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { area?: string };
}) {
  await connectDB();
  const areas = JSON.parse(
    JSON.stringify(await Area.find({}, "id name").sort({ name: 1 }).lean())
  );

  return (
    <section className="max-w-2xl mx-auto px-4 md:px-6 py-14">
      <span className="text-xs font-mono uppercase tracking-widest text-saffron-ink bg-saffron-tint px-3 py-1.5 rounded-pill">
        Report an Issue
      </span>
      <h1 className="text-3xl font-extrabold mt-3 mb-2">Help improve your neighbourhood</h1>
      <p className="text-ink-soft mb-8">
        Tell us what needs attention — every report helps improve your neighbourhood&apos;s civic score.
      </p>
      <ReportForm areas={areas} defaultAreaId={searchParams.area} />
    </section>
  );
}

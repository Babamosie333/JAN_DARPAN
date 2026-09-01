import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import AreasExplorer from "@/components/AreasExplorer";

export default async function AreasPage() {
  await connectDB();
  const areas = JSON.parse(JSON.stringify(await Area.find({}).sort({ score: -1 }).lean()));

  return (
    <section className="max-w-[1180px] mx-auto px-4 md:px-6 py-14">
      <span className="text-xs font-mono uppercase tracking-widest text-green-ink bg-green-tint px-3 py-1.5 rounded-pill">
        Explore Areas
      </span>
      <h1 className="text-3xl font-extrabold mt-3 mb-2">Explore Kanpur</h1>
      <p className="text-ink-soft mb-8 max-w-xl">
        Know your neighbourhood. Understand what needs attention — and what&apos;s already
        improving.
      </p>
      <AreasExplorer areas={areas} />
    </section>
  );
}

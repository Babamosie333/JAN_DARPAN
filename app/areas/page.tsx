import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";

export default async function AreasPage() {
  await connectDB();
  const areas = JSON.parse(JSON.stringify(await Area.find({}).sort({ score: -1 }).lean()));

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Explore Areas</h1>
      <p className="text-ink-soft mb-8">Civic health scores across Kanpur wards.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area: any) => (
          <Link
            key={area.id}
            href={`/areas/${area.id}`}
            className="block bg-bg-raised border border-line rounded-md p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{area.name}</h3>
              <span className="font-mono font-bold text-2xl">{area.score}</span>
            </div>
            <div className="text-xs text-ink-faint mb-3">{area.city}</div>
            <div className="flex justify-between text-sm text-ink-soft">
              <span>{area.activeIssues} active issues</span>
              <span className="text-green-ink font-semibold">+{area.delta}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

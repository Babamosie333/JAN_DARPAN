import Link from "next/link";

type Area = { id: string; name: string; score: number };

function scoreTone(score: number) {
  if (score >= 75) return "text-green-ink";
  if (score >= 55) return "text-saffron-ink";
  return "text-red";
}

export default function Leaderboard({ areas }: { areas: Area[] }) {
  const sorted = [...areas].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="bg-bg-raised border border-line rounded-md divide-y divide-line-soft">
      {sorted.map((area, i) => (
        <Link
          key={area.id}
          href={`/areas/${area.id}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-line-soft transition"
        >
          <span className="flex items-center gap-3">
            <span className="font-mono text-ink-faint w-5">{i + 1}</span>
            <span className="font-semibold">{area.name}</span>
          </span>
          <span className={`font-mono font-bold ${scoreTone(area.score)}`}>{area.score}</span>
        </Link>
      ))}
    </div>
  );
}

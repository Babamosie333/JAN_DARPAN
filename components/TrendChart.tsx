"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TrendChart({ data }: { data: { month: string; score: number }[] }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8A938C" }} axisLine={false} tickLine={false} />
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #E4E7E1", fontSize: 12 }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#138A4B"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#138A4B" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

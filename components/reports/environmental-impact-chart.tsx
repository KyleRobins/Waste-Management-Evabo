"use client";

import { EnvironmentalData } from "@/lib/hooks/use-report-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EnvironmentalImpactChartProps {
  data: EnvironmentalData[];
}

export function EnvironmentalImpactChart({
  data,
}: EnvironmentalImpactChartProps) {
  return (
    <div className="w-full aspect-[16/9]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value} kg CO₂`, "CO₂ Reduction"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="reduction"
            name="CO₂ Reduction"
            stroke="#82ca9d"
            fill="#82ca9d"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { WasteDistributionData } from "@/lib/hooks/use-report-data";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface WasteDistributionChartProps {
  data: WasteDistributionData[];
}

export function WasteDistributionChart({ data }: WasteDistributionChartProps) {
  return (
    <div className="w-full aspect-[16/9]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} kg`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

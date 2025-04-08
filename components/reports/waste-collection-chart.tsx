"use client";

import { WasteCollectionData } from "@/lib/hooks/use-report-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WasteCollectionChartProps {
  data: WasteCollectionData[];
}

export function WasteCollectionChart({ data }: WasteCollectionChartProps) {
  return (
    <div className="w-full aspect-[16/9]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value} kg`, "Quantity"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="quantity"
            stroke="#10b981"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

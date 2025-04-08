"use client";

import { SupplierPerformanceData } from "@/lib/hooks/use-report-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SupplierPerformanceChartProps {
  data: SupplierPerformanceData[];
}

export function SupplierPerformanceChart({
  data,
}: SupplierPerformanceChartProps) {
  return (
    <div className="w-full aspect-[16/9]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value} kg`, "Collection Volume"]}
          />
          <Legend />
          <Bar dataKey="efficiency" name="Collection Volume" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

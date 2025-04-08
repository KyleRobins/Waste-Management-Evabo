"use client";

import { FinancialData } from "@/lib/hooks/use-report-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FinancialPerformanceChartProps {
  data: FinancialData[];
}

export function FinancialPerformanceChart({
  data,
}: FinancialPerformanceChartProps) {
  return (
    <div className="w-full aspect-[16/9]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
          <Bar dataKey="expenses" name="Expenses" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

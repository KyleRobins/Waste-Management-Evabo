"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Button } from "@/components/ui/button";
import { useReportData } from "@/lib/hooks/use-report-data";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  DollarSign,
  Users,
  Recycle,
  BadgeDollarSign,
  ArchiveIcon,
  Filter,
} from "lucide-react";
import { DateRange } from "react-day-picker";

// Chart colors
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function ReportsPage() {
  const {
    customerMetrics,
    wasteMetrics,
    financialMetrics,
    transactions,
    dateRange,
    loading,
    activeTab,
    setDateRange,
    setActiveTab,
    refreshData,
  } = useReportData();

  if (loading) {
    return <PageSkeleton />;
  }

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
  };

  // Handle date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange({
        from: range.from,
        to: range.to || range.from,
      });
    }
  };

  // Custom tooltip formatter that safely converts values to numbers
  const formatTooltipValue = (
    value: any,
    prefix: string = "",
    suffix: string = ""
  ) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return `${prefix}0${suffix}`;
    return `${prefix}${formatNumber(numValue)}${suffix}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 dark">
      {/* Header section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Reports
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Analytics and insights for your waste management operations
          </p>
        </div>
      </div>

      {/* Dark filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-4 bg-black rounded-lg border border-neutral-800">
        <DatePickerWithRange
          className="flex-1 sm:max-w-xs"
          onSelect={handleDateRangeChange}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={refreshData}
            className="flex-1 sm:flex-none flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          >
            <Calendar className="h-4 w-4" /> Update
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none flex items-center gap-1.5 border-neutral-700 bg-transparent hover:bg-neutral-800 hover:text-white"
          >
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Customer Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(customerMetrics.totalCustomers)}
            </div>
            <p className="text-xs text-muted-foreground">
              Active customers in your database
            </p>
          </CardContent>
        </Card>

        {/* Total Waste */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Waste Collected
            </CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(wasteMetrics.totalWaste)} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Total waste processed in selected period
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${formatNumber(financialMetrics.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 pt-1">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500">
                +
                {Math.round(
                  (financialMetrics.netIncome / financialMetrics.totalRevenue) *
                    100
                )}
                %
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                from previous period
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Unpaid Invoices
            </CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${formatNumber(financialMetrics.unpaidInvoices.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialMetrics.unpaidInvoices.count} invoices pending payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs with dark styling */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid w-full grid-cols-4 p-1 bg-black rounded-lg border border-neutral-800">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white rounded-md"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white rounded-md"
          >
            Customers
          </TabsTrigger>
          <TabsTrigger
            value="waste"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white rounded-md"
          >
            Waste
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white rounded-md"
          >
            Financial
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialMetrics.revenueByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value, "$"),
                        "",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                    <Bar dataKey="expenses" name="Expenses" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Waste Collection Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Waste Collection Trend</CardTitle>
                <CardDescription>
                  Monthly collection volume (kg)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={wasteMetrics.wasteByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value, "", " kg"),
                        "",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="quantity"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest activity in your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-sm">
                        Date
                      </th>
                      <th className="text-left py-2 font-medium text-sm">
                        Description
                      </th>
                      <th className="text-left py-2 font-medium text-sm">
                        Category
                      </th>
                      <th className="text-right py-2 font-medium text-sm">
                        Amount
                      </th>
                      <th className="text-right py-2 font-medium text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 7).map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="py-2 text-sm">{transaction.date}</td>
                        <td className="py-2 text-sm">
                          {transaction.description}
                        </td>
                        <td className="py-2 text-sm capitalize">
                          {transaction.category}
                        </td>
                        <td className="py-2 text-sm text-right">
                          ${formatNumber(transaction.amount)}
                        </td>
                        <td className="py-2 text-sm text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${
                              transaction.status === "paid" ||
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" className="w-full md:w-auto">
                  View All Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>
                  Cumulative customers over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={customerMetrics.customerGrowth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value),
                        "Customers",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#00C49F"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Types */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Types</CardTitle>
                <CardDescription>
                  Distribution by customer category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerMetrics.customersByType}
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
                      {customerMetrics.customersByType.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value),
                        "Customers",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Customer Management Link */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Manage and analyze your customer base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> View All Customers
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4" /> Export Customer Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waste Tab */}
        <TabsContent value="waste" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Waste Collection by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Waste Distribution</CardTitle>
                <CardDescription>Categorization by waste type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteMetrics.wasteByType}
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
                      {wasteMetrics.wasteByType.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value, "", " kg"),
                        "",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Waste Collection Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Volume</CardTitle>
                <CardDescription>Monthly waste collection (kg)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={wasteMetrics.wasteByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value, "", " kg"),
                        "",
                      ]}
                    />
                    <Bar dataKey="quantity" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Waste Records Link */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Records</CardTitle>
              <CardDescription>
                Detailed waste processing records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button className="flex items-center gap-2">
                  <ArchiveIcon className="h-4 w-4" /> View All Records
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4" /> Export Waste Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialMetrics.revenueByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value, "$"),
                        "",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                    <Bar dataKey="expenses" name="Expenses" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Net Income */}
            <Card>
              <CardHeader>
                <CardTitle>Net Income</CardTitle>
                <CardDescription>Monthly profit after expenses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={financialMetrics.revenueByMonth.map((item) => ({
                      month: item.month,
                      netIncome: item.revenue - item.expenses,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatTooltipValue(value, "$"),
                        "Net Income",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="netIncome"
                      stroke="#FF8042"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Overall financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Total Revenue
                  </span>
                  <span className="text-2xl font-bold">
                    ${formatNumber(financialMetrics.totalRevenue)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Total Expenses
                  </span>
                  <span className="text-2xl font-bold">
                    ${formatNumber(financialMetrics.totalExpenses)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Net Income
                  </span>
                  <span className="text-2xl font-bold">
                    ${formatNumber(financialMetrics.netIncome)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button className="flex items-center gap-2">
                    <BadgeDollarSign className="h-4 w-4" /> View Invoices
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" /> Export Financial Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

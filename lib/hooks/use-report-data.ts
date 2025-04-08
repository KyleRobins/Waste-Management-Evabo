"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { addDays, format, subDays, subMonths, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Customer data types
export interface CustomerMetrics {
  totalCustomers: number;
  customersByType: { name: string; value: number }[];
  customerGrowth: { date: string; count: number }[];
}

// Waste data types
export interface WasteMetrics {
  totalWaste: number;
  wasteByType: { name: string; value: number }[];
  wasteByMonth: { date: string; quantity: number }[];
}

// Financial data types
export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  unpaidInvoices: { amount: number; count: number };
}

// Transaction data
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
  type: string;
  category: string;
}

export interface UseReportDataReturn {
  customerMetrics: CustomerMetrics;
  wasteMetrics: WasteMetrics;
  financialMetrics: FinancialMetrics;
  transactions: Transaction[];
  dateRange: { from: Date | undefined; to: Date | undefined };
  loading: boolean;
  activeTab: string;
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  setActiveTab: (tab: string) => void;
  refreshData: () => Promise<void>;
}

export function useReportData(): UseReportDataReturn {
  // Initialize state variables
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    customersByType: [],
    customerGrowth: []
  });
  
  const [wasteMetrics, setWasteMetrics] = useState<WasteMetrics>({
    totalWaste: 0,
    wasteByType: [],
    wasteByMonth: []
  });
  
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    revenueByMonth: [],
    unpaidInvoices: { amount: 0, count: 0 }
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });
  
  const { toast } = useToast();

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    refreshData();
  }, [dateRange]);

  const refreshData = async () => {
    setLoading(true);
    
    try {
      const supabase = createClient();
      const startDate = dateRange.from?.toISOString() || subMonths(new Date(), 6).toISOString();
      const endDate = dateRange.to?.toISOString() || new Date().toISOString();
      
      // Fetch customer data
      await fetchCustomerData(supabase, startDate, endDate);
      
      // Fetch waste records data
      await fetchWasteData(supabase, startDate, endDate);
      
      // Fetch financial data
      await fetchFinancialData(supabase, startDate, endDate);
      
      // Fetch transactions
      await fetchTransactions(supabase, startDate, endDate);
      
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCustomerData = async (supabase: any, startDate: string, endDate: string) => {
    // Get total customers
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id, type, created_at");
      
    if (customersError) throw customersError;
    
    // Calculate total customers
    const totalCustomers = customers?.length || 0;
    
    // Group customers by type
    const typeMap: Record<string, number> = {};
    customers?.forEach((customer: any) => {
      const type = customer.type || "Unknown";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    
    const customersByType = Object.entries(typeMap).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Calculate customer growth over time
    const dateMap: Record<string, number> = {};
    const sortedCustomers = [...(customers || [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    let cumulativeCount = 0;
    sortedCustomers.forEach((customer: any) => {
      const monthYear = format(new Date(customer.created_at), "MMM yyyy");
      if (!dateMap[monthYear]) {
        dateMap[monthYear] = 0;
      }
      cumulativeCount++;
      dateMap[monthYear] = cumulativeCount;
    });
    
    const customerGrowth = Object.entries(dateMap).map(([date, count]) => ({
      date,
      count,
    }));
    
    setCustomerMetrics({
      totalCustomers,
      customersByType,
      customerGrowth,
    });
  };
  
  const fetchWasteData = async (supabase: any, startDate: string, endDate: string) => {
    // Get waste records
    const { data: wasteRecords, error: wasteError } = await supabase
      .from("waste_records")
      .select("id, type, quantity, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate);
      
    if (wasteError) throw wasteError;
    
    // Calculate total waste
    const totalWaste = wasteRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0;
    
    // Group waste by type
    const typeMap: Record<string, number> = {};
    wasteRecords?.forEach((record: any) => {
      const type = record.type || "Unknown";
      typeMap[type] = (typeMap[type] || 0) + record.quantity;
    });
    
    const wasteByType = Object.entries(typeMap).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Group waste by month
    const monthMap: Record<string, number> = {};
    wasteRecords?.forEach((record: any) => {
      const monthYear = format(new Date(record.created_at), "MMM yyyy");
      monthMap[monthYear] = (monthMap[monthYear] || 0) + record.quantity;
    });
    
    const wasteByMonth = Object.entries(monthMap)
      .map(([date, quantity]) => ({
        date,
        quantity,
      }))
      .sort((a, b) => {
        const dateA = new Date(parseISO(`01 ${a.date}`));
        const dateB = new Date(parseISO(`01 ${b.date}`));
        return dateA.getTime() - dateB.getTime();
      });
    
    setWasteMetrics({
      totalWaste,
      wasteByType,
      wasteByMonth,
    });
  };
  
  const fetchFinancialData = async (supabase: any, startDate: string, endDate: string) => {
    // Get invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("id, total_amount, status, due_date, created_at");
      
    if (invoicesError) throw invoicesError;
    
    // Calculate total revenue (from paid invoices)
    const totalRevenue = invoices
      ?.filter((invoice: any) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;
    
    // Calculate total unpaid invoices
    const unpaidInvoices = invoices
      ?.filter((invoice: any) => invoice.status === "pending" || invoice.status === "overdue") || [];
    
    const unpaidAmount = unpaidInvoices.reduce(
      (sum, invoice) => sum + invoice.total_amount, 0
    );
    
    // Mock expenses (you would replace this with actual expense data)
    const totalExpenses = totalRevenue * 0.6; // Assuming expenses are 60% of revenue for demo
    
    // Calculate revenue by month
    const revenueByMonth: Record<string, { revenue: number; expenses: number }> = {};
    
    // Process revenue
    invoices?.forEach((invoice: any) => {
      if (invoice.status === "paid") {
        const monthYear = format(new Date(invoice.created_at), "MMM yyyy");
        if (!revenueByMonth[monthYear]) {
          revenueByMonth[monthYear] = { revenue: 0, expenses: 0 };
        }
        revenueByMonth[monthYear].revenue += invoice.total_amount;
      }
    });
    
    // Add mock expenses
    Object.keys(revenueByMonth).forEach((month) => {
      revenueByMonth[month].expenses = revenueByMonth[month].revenue * 0.6;
    });
    
    const formattedRevenueByMonth = Object.entries(revenueByMonth)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
      }))
      .sort((a, b) => {
        const dateA = new Date(parseISO(`01 ${a.month}`));
        const dateB = new Date(parseISO(`01 ${b.month}`));
        return dateA.getTime() - dateB.getTime();
      });
    
    setFinancialMetrics({
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      revenueByMonth: formattedRevenueByMonth,
      unpaidInvoices: {
        amount: unpaidAmount,
        count: unpaidInvoices.length,
      },
    });
  };
  
  const fetchTransactions = async (supabase: any, startDate: string, endDate: string) => {
    // For this demo, we'll combine waste records and invoices as transactions
    const { data: wasteRecords, error: wasteError } = await supabase
      .from("waste_records")
      .select("id, created_at, type, quantity, supplier:suppliers(name)")
      .order("created_at", { ascending: false })
      .limit(20);
      
    if (wasteError) throw wasteError;
    
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("id, created_at, total_amount, status, customer:customers(name)")
      .order("created_at", { ascending: false })
      .limit(20);
      
    if (invoicesError) throw invoicesError;
    
    // Transform waste records into transactions
    const wasteTransactions = wasteRecords?.map((record: any) => ({
      id: `waste-${record.id}`,
      date: format(new Date(record.created_at), "dd MMM yyyy"),
      description: `Waste collection: ${record.type} (${record.supplier?.name || "Unknown supplier"})`,
      amount: record.quantity * 5, // Assuming $5 per unit for demo
      status: "completed",
      type: "waste",
      category: record.type,
    })) || [];
    
    // Transform invoices into transactions
    const invoiceTransactions = invoices?.map((invoice: any) => ({
      id: `invoice-${invoice.id}`,
      date: format(new Date(invoice.created_at), "dd MMM yyyy"),
      description: `Invoice for ${invoice.customer?.name || "Unknown customer"}`,
      amount: invoice.total_amount,
      status: invoice.status,
      type: "invoice",
      category: "payment",
    })) || [];
    
    // Combine and sort by date (newest first)
    const allTransactions = [...wasteTransactions, ...invoiceTransactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setTransactions(allTransactions.slice(0, 30)); // Limit to 30 transactions
  };
  
  return {
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
  };
} 
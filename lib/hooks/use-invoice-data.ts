import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getInvoices,
  getInvoiceStats,
  updateInvoiceStatus,
  InvoiceWithCustomer,
} from "@/lib/services/invoices.service";
import { InvoiceStatus } from "@/components/invoices/columns";

// Define types for the hook return values
export interface InvoiceStats {
  paid: number;
  unpaid: number;
  draft: number;
  saved: number;
  sent: number;
}

export interface UseInvoiceDataReturn {
  // Data states
  invoices: InvoiceWithCustomer[];
  stats: InvoiceStats;
  selectedInvoice: InvoiceWithCustomer | null;

  // UI states
  loading: boolean;
  showInvoiceDetails: boolean;
  
  // Actions
  setSelectedInvoice: (invoice: InvoiceWithCustomer | null) => void;
  setShowInvoiceDetails: (show: boolean) => void;
  handleStatusChange: (id: string, newStatus: InvoiceStatus) => void;
  handleInvoiceClick: (invoice: InvoiceWithCustomer) => void;
  refreshData: () => Promise<void>;
}

export function useInvoiceData(): UseInvoiceDataReturn {
  // Data states
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    paid: 0,
    unpaid: 0,
    draft: 0,
    saved: 0,
    sent: 0,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithCustomer | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  
  const { toast } = useToast();

  // Fetch both invoices and stats in one function
  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch invoices
      const invoicesData = await getInvoices();
      setInvoices(invoicesData);
      
      // Fetch stats
      const statsData = await getInvoiceStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    refreshData();
  }, []);

  // Handle invoice status change
  const handleStatusChange = (id: string, newStatus: InvoiceStatus) => {
    // Update the invoice in the local state
    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status: newStatus } : invoice
      )
    );
    
    // Update the selected invoice if it's the one being changed
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: newStatus,
      });
    }
    
    // Update stats - refresh from server to ensure accuracy
    getInvoiceStats()
      .then((statsData) => {
        setStats(statsData);
      })
      .catch((error) => {
        console.error("Error updating invoice stats:", error);
      });
  };

  // Handle clicking on an invoice row
  const handleInvoiceClick = (invoice: InvoiceWithCustomer) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  return {
    // Data
    invoices,
    stats,
    selectedInvoice,
    
    // UI states
    loading,
    showInvoiceDetails,
    
    // Actions
    setSelectedInvoice,
    setShowInvoiceDetails,
    handleStatusChange,
    handleInvoiceClick,
    refreshData,
  };
} 
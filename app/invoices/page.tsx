"use client";

import { DataTable } from "@/components/shared/data-table";
import {
  columns,
  getColumns,
  InvoiceStatus,
} from "@/components/invoices/columns";
import { InvoiceStats } from "@/components/invoices/stats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getInvoices,
  getInvoiceStats,
  InvoiceWithCustomer,
} from "@/lib/services/invoices.service";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { useToast } from "@/hooks/use-toast";
import { ImportExportActions } from "@/components/invoices/import-export-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { InvoiceDetailsSheet } from "@/components/invoices/invoice-details-sheet";
import { Customer } from "@/lib/services/customers.service";
import { Database } from "@/lib/database.types";

type DbInvoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  customer: Database["public"]["Tables"]["customers"]["Row"];
};

type Stats = {
  paid: number;
  unpaid: number;
  draft: number;
  saved: number;
  sent: number;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [stats, setStats] = useState<Stats>({
    paid: 0,
    unpaid: 0,
    draft: 0,
    saved: 0,
    sent: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceWithCustomer | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      console.log("Loaded invoices:", data); // Debug log
      setInvoices(data);

      // Also update stats when invoices are loaded
      try {
        const statsData = await getInvoiceStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error loading invoice stats:", error);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Handle status change without a full refresh
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

    // Update stats
    getInvoiceStats()
      .then((statsData) => {
        setStats(statsData);
      })
      .catch((error) => {
        console.error("Error updating invoice stats:", error);
      });
  };

  // Generate columns with the status change handler
  const tableColumns = getColumns(handleStatusChange);

  const statusColors = {
    draft: "bg-gray-500",
    saved: "bg-yellow-500",
    sent: "bg-blue-500",
    unpaid: "bg-red-500",
    paid: "bg-green-500",
  } as const;

  const handleInvoiceClick = (invoice: InvoiceWithCustomer) => {
    console.log("Selected invoice:", invoice); // Debug log
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <InvoiceStats stats={stats} />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <div className="flex items-center gap-4">
          <ImportExportActions onSuccess={loadInvoices} />
          <CreateInvoiceDialog onSuccess={loadInvoices} />
        </div>
      </div>
      <DataTable
        columns={tableColumns}
        data={invoices}
        onRowClick={handleInvoiceClick}
      />

      {selectedInvoice && (
        <InvoiceDetailsSheet
          open={showInvoiceDetails}
          onOpenChange={setShowInvoiceDetails}
          invoice={selectedInvoice}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

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
import { useState } from "react";
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
import { useInvoiceData } from "@/lib/hooks/use-invoice-data";

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
  const {
    invoices,
    stats,
    selectedInvoice,
    loading,
    showInvoiceDetails,
    handleStatusChange,
    handleInvoiceClick,
    setShowInvoiceDetails,
    refreshData,
  } = useInvoiceData();

  // Generate columns with the status change handler
  const tableColumns = getColumns(handleStatusChange);

  const statusColors = {
    draft: "bg-gray-500",
    saved: "bg-yellow-500",
    sent: "bg-blue-500",
    unpaid: "bg-red-500",
    paid: "bg-green-500",
  } as const;

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
          <ImportExportActions onSuccess={refreshData} />
          <CreateInvoiceDialog onSuccess={refreshData} />
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

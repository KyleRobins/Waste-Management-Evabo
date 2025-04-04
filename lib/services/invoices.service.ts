"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { InvoiceStatus } from "@/components/invoices/columns";

const supabase = createClient();

type DbInvoice = Database["public"]["Tables"]["invoices"]["Row"];
type DbInvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type DbCustomer = Database["public"]["Tables"]["customers"]["Row"];

export type InvoiceWithCustomer = Omit<DbInvoice, "status"> & {
  customer: DbCustomer;
  status: InvoiceStatus;
};

export interface CreateInvoiceInput {
  customer_id: string;
  amount: number;
  status: InvoiceStatus;
  invoice_date?: string;
  due_date: string;
  collection_date: string;
  waste_quantity: number;
  service_type: "standard" | "premium";
  additional_services?: string[];
  notes?: string;
}

export const createInvoice = async (
  input: CreateInvoiceInput
): Promise<DbInvoice> => {
  const invoice: DbInvoiceInsert = {
    customer_id: input.customer_id,
    amount: input.amount,
    status: input.status,
    invoice_date: input.invoice_date || new Date().toISOString().split("T")[0],
    due_date: input.due_date,
    collection_date: input.collection_date,
    waste_quantity: input.waste_quantity,
    service_type: input.service_type,
    additional_services: input.additional_services || [],
    notes: input.notes,
  };

  const { data, error } = await supabase
    .from("invoices")
    .insert([invoice])
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }

  if (!data) {
    throw new Error("No data returned from invoice creation");
  }

  return data;
};

export const getInvoices = async (): Promise<InvoiceWithCustomer[]> => {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      customer:customers(*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }

  return (data || []) as InvoiceWithCustomer[];
};

export const updateInvoiceStatus = async (
  id: string,
  status: InvoiceStatus
): Promise<DbInvoice> => {
  const { data, error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }

  if (!data) {
    throw new Error("No data returned from invoice status update");
  }

  return data;
};

export const getInvoiceStats = async () => {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("amount, status");

  if (error) {
    console.error("Error fetching invoice stats:", error);
    throw error;
  }

  const stats = {
    paid: 0,
    unpaid: 0,
    draft: 0,
    saved: 0,
    sent: 0,
  };

  (invoices || []).forEach((invoice) => {
    if (invoice.status in stats) {
      stats[invoice.status as keyof typeof stats] += Number(invoice.amount);
    }
  });

  return stats;
};

export const sendInvoiceByEmail = async (
  invoiceId: string,
  customerEmail: string
): Promise<boolean> => {
  try {
    await updateInvoiceStatus(invoiceId, "sent");

    console.log(
      `Email would be sent to ${customerEmail} for invoice ${invoiceId}`
    );

    return true;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error;
  }
};

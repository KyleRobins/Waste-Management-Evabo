import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { InvoiceStatus } from "@/components/invoices/columns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePassword(length = 12) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Formats an invoice number based on status, ID, and date
 * @param status The invoice status
 * @param id The invoice ID
 * @param date The invoice date
 * @returns Formatted invoice number like INVOICE#P1032025
 */
export function formatInvoiceNumber(
  status: InvoiceStatus,
  id: string,
  date: string | Date
): string {
  // Get prefix based on status
  let prefix = "D"; // Default for draft

  if (status === "paid") {
    prefix = "P";
  } else if (status === "unpaid") {
    prefix = "U";
  } else if (status === "sent") {
    prefix = "S";
  } else if (status === "saved") {
    prefix = "V";
  }

  // Format date (use invoice date or current date)
  const invoiceDate = date ? new Date(date) : new Date();
  const day = invoiceDate.getDate().toString().padStart(2, "0");
  const month = (invoiceDate.getMonth() + 1).toString().padStart(2, "0");
  const year = invoiceDate.getFullYear();

  // Use the last 4 characters of the UUID as the invoice number
  const invoiceNumber = id.substring(id.length - 4);

  return `INVOICE#${prefix}${invoiceNumber}${day}${month}${year}`;
}

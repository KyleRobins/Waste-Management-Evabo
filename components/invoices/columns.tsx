"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateInvoiceStatus } from "@/lib/services/invoices.service";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { formatInvoiceNumber } from "@/lib/utils";
import { InvoiceWithCustomer } from "@/lib/services/invoices.service";

export type InvoiceStatus = "draft" | "saved" | "sent" | "unpaid" | "paid";

export type Invoice = InvoiceWithCustomer;

export const getColumns = (
  onStatusChange?: (id: string, newStatus: InvoiceStatus) => void
): ColumnDef<InvoiceWithCustomer>[] => {
  const ActionCell = ({ invoice }: { invoice: InvoiceWithCustomer }): React.ReactNode => {
    const { toast } = useToast();

    // Handle status update with callback
    const handleStatusUpdate = async (id: string, status: InvoiceStatus) => {
      try {
        await updateInvoiceStatus(id, status);
        // If callback is provided, call it with the updated status
        if (onStatusChange) {
          onStatusChange(id, status);
        }
        toast({
          title: "Success",
          description: `Invoice marked as ${status}`,
        });
      } catch (error) {
        console.error(`Error updating invoice status to ${status}:`, error);
        toast({
          title: "Error",
          description: `Failed to update invoice status to ${status}`,
          variant: "destructive",
        });
      }
    };

    const handleDownload = async () => {
      try {
        toast({
          title: "Generating PDF",
          description: "Please wait...",
        });

        // Create a temporary div to render the invoice
        const tempDiv = document.createElement("div");
        tempDiv.className = "p-8 bg-white";
        tempDiv.style.position = "fixed";
        tempDiv.style.top = "-9999px";
        tempDiv.style.left = "-9999px";
        tempDiv.style.width = "800px";

        // Generate the formatted invoice number
        const invoiceNumber = formatInvoiceNumber(
          invoice.status,
          invoice.id,
          invoice.invoice_date
        );

        tempDiv.innerHTML = `
          <div class="space-y-6">
            <!-- Header with Logo and Company Details -->
            <div class="flex justify-between items-start">
              <div>
                <div class="text-2xl font-bold mb-1">ElitCorp.</div>
                <div class="text-gray-600">
                  <div>Kenya</div>
                  <div>robinsmicky@gmail.com</div>
                  <div>elit.co.ke</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-4xl font-bold mb-4">INVOICE</div>
                <div class="text-xl">${invoiceNumber}</div>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="flex justify-between mt-8">
              <div class="w-1/2">
                <div class="font-bold text-lg mb-2">Bill To</div>
                <div class="text-gray-600">
                  <div class="font-semibold">${invoice.customer.name}</div>
                  <div>${invoice.customer.type.replace("_", " ")}</div>
                </div>
              </div>
              <div class="w-1/2 text-right">
                <div class="space-y-1">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Invoice Date:</span>
                    <span class="font-semibold">${format(
                      new Date(invoice.invoice_date),
                      "dd/MM/yyyy"
                    )}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Terms:</span>
                    <span class="font-semibold">Due On Receipt</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Due Date:</span>
                    <span class="font-semibold">${format(
                      new Date(invoice.due_date),
                      "dd/MM/yyyy"
                    )}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Line Items -->
            <div class="mt-8">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-800 text-white">
                    <th class="py-2 px-4 text-left">#</th>
                    <th class="py-2 px-4 text-left">Item & Description</th>
                    <th class="py-2 px-4 text-right">Qty</th>
                    <th class="py-2 px-4 text-right">Rate</th>
                    <th class="py-2 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b">
                    <td class="py-3 px-4">1</td>
                    <td class="py-3 px-4">
                      <div>Waste Collection Service</div>
                      <div class="text-gray-600 text-sm">Collection and disposal services</div>
                    </td>
                    <td class="py-3 px-4 text-right">1.00</td>
                    <td class="py-3 px-4 text-right">${new Intl.NumberFormat(
                      "en-KE",
                      {
                        style: "currency",
                        currency: "KES",
                      }
                    ).format(invoice.amount)}</td>
                    <td class="py-3 px-4 text-right">${new Intl.NumberFormat(
                      "en-KE",
                      {
                        style: "currency",
                        currency: "KES",
                      }
                    ).format(invoice.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="mt-4">
              <div class="w-1/2 ml-auto">
                <div class="space-y-2">
                  <div class="flex justify-between border-b py-2">
                    <span class="font-semibold">Sub Total</span>
                    <span>${new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(invoice.amount)}</span>
                  </div>
                  <div class="flex justify-between py-2">
                    <span class="font-bold">Total</span>
                    <span class="font-bold">${new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(invoice.amount)}</span>
                  </div>
                  <div class="flex justify-between bg-gray-100 p-2">
                    <span class="font-bold">Balance Due</span>
                    <span class="font-bold">${new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(invoice.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="mt-8">
              <div class="font-bold mb-2">Notes</div>
              <div class="text-gray-600">
                Thanks for your business.
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: 800,
          windowWidth: 800,
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoice.id}.pdf`);

        toast({
          title: "Success",
          description: "PDF downloaded successfully",
        });
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>

          {invoice.status === "draft" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(invoice.id, "saved")}
            >
              Save Invoice
            </DropdownMenuItem>
          )}

          {(invoice.status === "draft" || invoice.status === "saved") && (
            <DropdownMenuItem
              onClick={() => {
                if (invoice.customer.email) {
                  try {
                    import("@/lib/services/invoices.service").then(
                      ({ sendInvoiceByEmail }) => {
                        sendInvoiceByEmail(
                          invoice.id,
                          invoice.customer.email || ""
                        )
                          .then(() => {
                            // Update the local state if callback is provided
                            if (onStatusChange) {
                              onStatusChange(invoice.id, "sent");
                            }
                            toast({
                              title: "Success",
                              description:
                                "Invoice has been sent to the customer.",
                            });
                          })
                          .catch(() => {
                            toast({
                              title: "Error",
                              description: "Failed to send invoice.",
                              variant: "destructive",
                            });
                          });
                      }
                    );
                  } catch (error) {
                    console.error("Error sending invoice:", error);
                    toast({
                      title: "Error",
                      description: "Failed to send invoice.",
                      variant: "destructive",
                    });
                  }
                } else {
                  toast({
                    title: "Error",
                    description: "Customer email is missing.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Send Invoice
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => handleStatusUpdate(invoice.id, "paid")}
            disabled={invoice.status === "paid"}
          >
            Mark as Paid
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusUpdate(invoice.id, "unpaid")}
            disabled={invoice.status === "unpaid"}
          >
            Mark as Unpaid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return [
    {
      accessorKey: "id",
      header: "Invoice Number",
      cell: ({ row }) => {
        return formatInvoiceNumber(
          row.original.status,
          row.original.id,
          row.original.invoice_date
        );
      },
    },
    {
      accessorKey: "invoice_date",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("invoice_date")), "MMM d, yyyy"),
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
    },
    {
      accessorKey: "customer.type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.customer.type.replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "paid"
                ? "default"
                : status === "unpaid"
                ? "destructive"
                : status === "sent"
                ? "outline"
                : status === "saved"
                ? "secondary"
                : "secondary"
            }
            className={
              status === "paid"
                ? "bg-green-500 hover:bg-green-600"
                : status === "sent"
                ? "bg-blue-500 hover:bg-blue-600"
                : ""
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("due_date")), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionCell invoice={row.original} />,
    },
  ];
};

// For backward compatibility
export const columns = getColumns();

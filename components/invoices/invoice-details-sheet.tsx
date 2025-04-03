import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Send, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import {
  InvoiceWithCustomer,
  sendInvoiceByEmail,
  updateInvoiceStatus,
} from "@/lib/services/invoices.service";
import { useToast } from "@/hooks/use-toast";
import { InvoiceStatus } from "@/components/invoices/columns";
import { formatInvoiceNumber } from "@/lib/utils";

interface InvoiceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithCustomer | null;
  onStatusChange?: (id: string, newStatus: InvoiceStatus) => void;
}

export function InvoiceDetailsSheet({
  open,
  onOpenChange,
  invoice,
  onStatusChange,
}: InvoiceDetailsSheetProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const statusVariants = {
    draft: "secondary",
    saved: "secondary",
    sent: "outline",
    unpaid: "destructive",
    paid: "default",
  } as const;

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !invoice) {
      toast({
        title: "Error",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Generating PDF",
        description: "Please wait...",
      });

      // Wait for any state updates to be reflected in the DOM
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: invoiceRef.current.scrollWidth,
        windowHeight: invoiceRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`invoice-${invoice.id}.pdf`);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice || !invoice.customer.email) {
      toast({
        title: "Error",
        description: "Customer email is missing. Cannot send invoice.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      toast({
        title: "Sending invoice",
        description: "Please wait...",
      });

      await sendInvoiceByEmail(invoice.id, invoice.customer.email);

      // Update UI with new status
      if (onStatusChange) {
        onStatusChange(invoice.id, "sent");
      }

      toast({
        title: "Success",
        description: "Invoice has been sent to the customer",
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        title: "Error",
        description: "Failed to send invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;

    try {
      await updateInvoiceStatus(invoice.id, newStatus);

      // Update UI with new status
      if (onStatusChange) {
        onStatusChange(invoice.id, newStatus);
      }

      toast({
        title: "Success",
        description: `Invoice marked as ${newStatus}`,
      });
    } catch (error) {
      console.error(`Error updating invoice status to ${newStatus}:`, error);
      toast({
        title: "Error",
        description: `Failed to update invoice status`,
        variant: "destructive",
      });
    }
  };

  if (!invoice) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px]" side="right">
        <SheetHeader className="mb-6">
          <SheetTitle>Invoice Details</SheetTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSendInvoice}
              disabled={
                isSending ||
                invoice.status === "sent" ||
                invoice.status === "paid" ||
                !invoice.customer.email
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send Invoice"}
            </Button>
          </div>
        </SheetHeader>

        <div
          ref={invoiceRef}
          className="space-y-6 p-6 bg-background border rounded-lg"
        >
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {formatInvoiceNumber(
                  invoice.status,
                  invoice.id,
                  invoice.invoice_date
                )}
              </h2>
              <Badge variant={statusVariants[invoice.status]}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Invoice Date:</p>
              <p className="font-semibold">
                {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
              </p>
              <p className="text-muted-foreground mt-2">Due Date:</p>
              <p className="font-semibold">
                {format(new Date(invoice.due_date), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t border-b border-border py-4">
            <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Name:</p>
                <p className="font-semibold">{invoice.customer.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type:</p>
                <p className="font-semibold capitalize">
                  {invoice.customer.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact Person:</p>
                <p className="font-semibold">
                  {invoice.customer.contact_person}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Email:</p>
                <p className="font-semibold">{invoice.customer.email}</p>
              </div>
              {invoice.customer.location && (
                <div>
                  <p className="text-muted-foreground">Location:</p>
                  <p className="font-semibold">{invoice.customer.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Details</h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-muted-foreground">Collection Date:</p>
                  <p className="font-semibold">
                    {format(new Date(invoice.collection_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service Type:</p>
                  <p className="font-semibold capitalize">
                    {invoice.service_type}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Waste Quantity:</p>
                  <p className="font-semibold">{invoice.waste_quantity} kg</p>
                </div>
              </div>

              {invoice.additional_services &&
                invoice.additional_services.length > 0 && (
                  <div className="mt-4">
                    <p className="text-muted-foreground">
                      Additional Services:
                    </p>
                    <div className="flex gap-2 mt-1">
                      {invoice.additional_services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Amount */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <p className="text-muted-foreground">Total Amount:</p>
                  <p className="font-bold text-xl">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(invoice.amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Invoice Status</h3>
            <div className="space-x-2">
              {invoice.status !== "paid" && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleStatusUpdate("paid")}
                >
                  Mark as Paid
                </Button>
              )}
              {invoice.status !== "unpaid" && invoice.status !== "draft" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("unpaid")}
                >
                  Mark as Unpaid
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

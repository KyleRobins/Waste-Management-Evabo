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
import { InvoiceWithCustomer } from "@/lib/services/invoices.service";
import { useToast } from "@/hooks/use-toast";

interface InvoiceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithCustomer | null;
}

export function InvoiceDetailsSheet({
  open,
  onOpenChange,
  invoice,
}: InvoiceDetailsSheetProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const statusColors = {
    draft: "bg-gray-500",
    unpaid: "bg-red-500",
    paid: "bg-green-500",
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
            <Button variant="default" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </SheetHeader>

        <div ref={invoiceRef} className="space-y-6 p-6 bg-white rounded-lg">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                INVOICE #{invoice.id}
              </h2>
              <Badge className={statusColors[invoice.status]}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Invoice Date:</p>
              <p className="font-semibold">
                {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
              </p>
              <p className="text-gray-600 mt-2">Due Date:</p>
              <p className="font-semibold">
                {format(new Date(invoice.due_date), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t border-b border-gray-200 py-4">
            <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-semibold">{invoice.customer.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Type:</p>
                <p className="font-semibold capitalize">
                  {invoice.customer.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Contact Person:</p>
                <p className="font-semibold">
                  {invoice.customer.contact_person}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-semibold">{invoice.customer.email}</p>
              </div>
              {invoice.customer.location && (
                <div>
                  <p className="text-gray-600">Location:</p>
                  <p className="font-semibold">{invoice.customer.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Collection Date:</p>
                  <p className="font-semibold">
                    {format(new Date(invoice.collection_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Service Type:</p>
                  <p className="font-semibold capitalize">
                    {invoice.service_type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Waste Quantity:</p>
                  <p className="font-semibold">{invoice.waste_quantity} kg</p>
                </div>
              </div>

              {invoice.additional_services &&
                invoice.additional_services.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-600">Additional Services:</p>
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
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <p className="text-gray-600">Total Amount:</p>
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
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

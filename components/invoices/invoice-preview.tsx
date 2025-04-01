import { format } from "date-fns";
import { Customer } from "@/lib/services/customers.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface InvoicePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    customer: Customer;
    collection_date: string;
    waste_quantity: number;
    service_type: "standard" | "premium";
    amount: number;
    due_date?: string;
    invoice_date?: string;
    status?: "draft" | "unpaid" | "paid";
    additional_services?: string[];
    notes?: string;
  };
}

export function InvoicePreview({
  open,
  onOpenChange,
  data,
}: InvoicePreviewProps) {
  const statusColors = {
    draft: "bg-gray-500",
    unpaid: "bg-red-500",
    paid: "bg-green-500",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-6 bg-white rounded-lg">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              {data.status && (
                <Badge className={statusColors[data.status]}>
                  {data.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-600">Invoice Date:</p>
              <p className="font-semibold">
                {data.invoice_date
                  ? format(new Date(data.invoice_date), "MMM dd, yyyy")
                  : format(new Date(), "MMM dd, yyyy")}
              </p>
              <p className="text-gray-600 mt-2">Due Date:</p>
              <p className="font-semibold">
                {data.due_date
                  ? format(new Date(data.due_date), "MMM dd, yyyy")
                  : format(
                      new Date(new Date().setDate(new Date().getDate() + 30)),
                      "MMM dd, yyyy"
                    )}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t border-b border-gray-200 py-4">
            <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-semibold">{data.customer.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Type:</p>
                <p className="font-semibold capitalize">
                  {data.customer.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Contact Person:</p>
                <p className="font-semibold">{data.customer.contact_person}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-semibold">{data.customer.email}</p>
              </div>
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
                    {format(new Date(data.collection_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Service Type:</p>
                  <p className="font-semibold capitalize">
                    {data.service_type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Waste Quantity:</p>
                  <p className="font-semibold">{data.waste_quantity} kg</p>
                </div>
              </div>

              {data.additional_services &&
                data.additional_services.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-600">Additional Services:</p>
                    <div className="flex gap-2 mt-1">
                      {data.additional_services.map((service, index) => (
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
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(data.amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-600">{data.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

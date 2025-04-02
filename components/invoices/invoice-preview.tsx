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
  const statusVariants = {
    draft: "secondary",
    unpaid: "destructive",
    paid: "default",
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-6 bg-background border rounded-lg">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">INVOICE</h2>
              {data.status && (
                <Badge variant={statusVariants[data.status]}>
                  {data.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Invoice Date:</p>
              <p className="font-semibold">
                {data.invoice_date
                  ? format(new Date(data.invoice_date), "MMM dd, yyyy")
                  : format(new Date(), "MMM dd, yyyy")}
              </p>
              <p className="text-muted-foreground mt-2">Due Date:</p>
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
          <div className="border-t border-b border-border py-4">
            <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Name:</p>
                <p className="font-semibold">{data.customer.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type:</p>
                <p className="font-semibold capitalize">
                  {data.customer.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact Person:</p>
                <p className="font-semibold">{data.customer.contact_person}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email:</p>
                <p className="font-semibold">{data.customer.email}</p>
              </div>
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
                    {format(new Date(data.collection_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service Type:</p>
                  <p className="font-semibold capitalize">
                    {data.service_type}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Waste Quantity:</p>
                  <p className="font-semibold">{data.waste_quantity} kg</p>
                </div>
              </div>

              {data.additional_services &&
                data.additional_services.length > 0 && (
                  <div className="mt-4">
                    <p className="text-muted-foreground">
                      Additional Services:
                    </p>
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
          <div className="border-t border-border pt-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <p className="text-muted-foreground">Total Amount:</p>
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
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground">{data.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

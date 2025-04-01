"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, Search, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createInvoice } from "@/lib/services/invoices.service";
import { useToast } from "@/hooks/use-toast";
import { Customer, getCustomers } from "@/lib/services/customers.service";
import { calculateInvoiceAmount } from "@/lib/utils/invoice-calculations";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { InvoicePreview } from "./invoice-preview";

const formSchema = z.object({
  customer_id: z.string().uuid("Please select a customer"),
  collection_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a collection date"),
  waste_quantity: z.number().min(0, "Quantity must be positive"),
  service_type: z.enum(["standard", "premium"], {
    required_error: "Please select a service type",
  }),
  additional_services: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

const supabase = createClient();

export function CreateInvoiceDialog({ onSuccess }: { onSuccess: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      collection_date: new Date().toISOString().split("T")[0],
      waste_quantity: 0,
      service_type: "standard",
      additional_services: [],
      notes: "",
    },
  });

  useEffect(() => {
    if (open || showCustomerSearch) {
      loadCustomers();
    }
  }, [open, showCustomerSearch]);

  const loadCustomers = async () => {
    try {
      const customersData = await getCustomers();
      setCustomers(customersData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  // Watch form values for automatic calculation
  const watchedValues = form.watch([
    "customer_id",
    "waste_quantity",
    "service_type",
    "additional_services",
  ]);

  useEffect(() => {
    const [customerId, quantity, serviceType, additionalServices] =
      watchedValues;
    if (customerId && quantity) {
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        const amount = calculateInvoiceAmount({
          customerType: customer.type,
          quantity,
          serviceType,
          additionalServices: additionalServices || [],
        });
        setCalculatedAmount(amount);
      }
    }
  }, [watchedValues, customers]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Log the form values before validation
      console.log("Form values before validation:", values);

      // Detailed validation checks
      if (!values.customer_id) {
        console.error("Missing customer_id");
        throw new Error("Please select a customer");
      }

      if (!values.collection_date) {
        console.error("Missing collection_date");
        throw new Error("Please select a collection date");
      }

      if (values.waste_quantity <= 0) {
        console.error("Invalid waste_quantity:", values.waste_quantity);
        throw new Error("Waste quantity must be greater than 0");
      }

      if (!values.service_type) {
        console.error("Missing service_type");
        throw new Error("Please select a service type");
      }

      const dueDate = new Date(values.collection_date);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoiceData = {
        ...values,
        amount: calculatedAmount,
        status: "draft" as const,
        due_date: dueDate.toISOString().split("T")[0],
        invoice_date: new Date().toISOString().split("T")[0],
      };

      // Log the final invoice data being sent
      console.log("Invoice data being sent:", invoiceData);

      const response = await createInvoice(invoiceData);
      console.log("Create invoice response:", response);

      setOpen(false);
      form.reset();
      setSelectedCustomer(null);
      onSuccess();
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create invoice. Please check all fields.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    const values = form.getValues();
    const customer = customers.find((c) => c.id === values.customer_id);

    if (!customer) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive",
      });
      return;
    }

    if (
      !values.collection_date ||
      values.waste_quantity <= 0 ||
      !values.service_type
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const dueDate = new Date(values.collection_date);
    dueDate.setDate(dueDate.getDate() + 30);

    setShowPreview(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowCustomerSearch(true)}
                      >
                        {selectedCustomer ? (
                          selectedCustomer.name
                        ) : (
                          <span className="text-muted-foreground">
                            Search for a customer...
                          </span>
                        )}
                        <Search className="ml-2 h-4 w-4" />
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collection_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waste_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waste Quantity (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        {...field}
                      >
                        <option value="">Select service type</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-lg font-semibold">
                Calculated Amount:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(calculatedAmount)}
              </div>

              <div className="flex justify-between space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button type="submit" className="flex-1">
                  Create Invoice
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CommandDialog
        open={showCustomerSearch}
        onOpenChange={setShowCustomerSearch}
      >
        <CommandInput placeholder="Search customers..." />
        <CommandList>
          <CommandEmpty>No customers found.</CommandEmpty>
          <CommandGroup>
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                onSelect={() => {
                  setSelectedCustomer(customer);
                  form.setValue("customer_id", customer.id);
                  setShowCustomerSearch(false);
                }}
              >
                {customer.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {selectedCustomer && (
        <InvoicePreview
          open={showPreview}
          onOpenChange={setShowPreview}
          data={{
            customer: selectedCustomer,
            collection_date: form.getValues("collection_date"),
            waste_quantity: form.getValues("waste_quantity"),
            service_type: form.getValues("service_type"),
            amount: calculatedAmount,
            additional_services: form.getValues("additional_services"),
            notes: form.getValues("notes"),
          }}
        />
      )}
    </>
  );
}

"use client";

import { DataTable } from "@/components/shared/data-table";
import { ImportExportButtons } from "@/components/shared/import-export-buttons";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { columns } from "@/components/waste-records/columns";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  createWasteRecord,
  getWasteRecords,
  deleteWasteRecord,
  updateWasteRecord,
} from "@/lib/services/waste-records.service";
import { getCustomers } from "@/lib/services/customers.service";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Loader2 } from "lucide-react";

const wasteTypes = [
  "Paper",
  "Plastic",
  "Metal",
  "Glass",
  "Organic",
  "Electronic",
  "Other",
] as const;

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(wasteTypes, {
    required_error: "Please select a waste type",
  }),
  quantity: z.string().min(1, "Quantity is required"),
  customer_id: z.string().min(1, "Customer is required"),
  location: z.string().min(1, "Location is required"),
});

export default function WasteRecordsPage() {
  const [records, setRecords] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: undefined,
      quantity: "",
      customer_id: "",
      location: "",
    },
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  console.log("Google Maps Script loaded:", isLoaded);
  console.log("API Key:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsData, customersData] = await Promise.all([
        getWasteRecords(),
        getCustomers(),
      ]);
      setRecords(recordsData);
      setCustomers(customersData);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const results = await getGeocode({ address: values.location });
      const { lat, lng } = await getLatLng(results[0]);

      await createWasteRecord({
        ...values,
        coordinates: { lat, lng },
        status: "pending",
      });

      toast({
        title: "Success",
        description: "Waste record has been created successfully.",
      });

      loadData();
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create waste record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWasteRecord(id);
      toast({
        title: "Success",
        description: "Waste record has been deleted.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete waste record",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (
    id: string,
    updates: Partial<z.infer<typeof formSchema>>
  ) => {
    try {
      await updateWasteRecord(id, updates);
      toast({
        title: "Success",
        description: "Waste record has been updated.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update waste record",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (data: any[]) => {
    try {
      await Promise.all(data.map((record) => createWasteRecord(record)));
      loadData();
    } catch (error) {
      throw error;
    }
  };

  const LocationField = ({ field }: { field: any }) => {
    const {
      ready,
      value,
      suggestions: { status, data },
      setValue,
      clearSuggestions,
    } = usePlacesAutocomplete({
      defaultValue: field.value,
      requestOptions: {
        componentRestrictions: { country: "ke" },
      },
    });

    const getCurrentLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
              );
              const data = await response.json();

              if (data.results[0]) {
                const address = data.results[0].formatted_address;
                setValue(address, false);
                field.onChange(address);
              }
            } catch (error) {
              console.error("Error getting address:", error);
              toast({
                title: "Error",
                description: "Failed to get your current location address",
                variant: "destructive",
              });
            }
          },
          (error) => {
            toast({
              title: "Error",
              description:
                "Unable to get your location. Please ensure location permissions are enabled.",
              variant: "destructive",
            });
          }
        );
      }
    };

    return (
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            field.onChange(e.target.value);
          }}
          disabled={!ready}
          placeholder="Search for a location..."
          className="w-full pr-10"
        />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2"
          role="button"
          tabIndex={0}
        >
          {!ready ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin
              className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={getCurrentLocation}
            />
          )}
        </div>

        {status === "OK" && (
          <ul className="absolute z-10 w-full bg-background border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={async () => {
                  setValue(description, false);
                  clearSuggestions();
                  field.onChange(description);
                }}
              >
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Waste Records</h1>
        <div className="flex items-center gap-4">
          <ImportExportButtons
            data={records}
            onImport={handleImport}
            filename="waste_records"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Waste Record</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waste Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select waste type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wasteTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <LocationField field={field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create Record
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={records}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

"use client";

import { DataTable } from "@/components/shared/data-table";
import { ImportExportButtons } from "@/components/shared/import-export-buttons";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { columns } from "@/components/customers/columns";
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
  createCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer,
} from "@/lib/services/customers.service";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Loader2 } from "lucide-react";
import { Customer, createColumns } from "@/components/customers/columns";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact_person: z
    .string()
    .min(2, "Contact person must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  type: z.enum(["apartment", "corporate_office", "estate"], {
    required_error: "Please select a type",
  }),
  location: z.string().min(2, "Location is required"),
  status: z.enum(["active", "inactive"]),
});

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      type: undefined,
      location: "",
      status: "active",
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load customers",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createCustomer(values);

      toast({
        title: "Success",
        description: "Customer has been added successfully.",
      });

      loadCustomers();
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      toast({
        title: "Success",
        description: "Customer has been deleted.",
      });
      loadCustomers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Customer>) => {
    try {
      await updateCustomer(id, updates);
      toast({
        title: "Success",
        description: "Customer has been updated.",
      });
      loadCustomers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      });
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
        componentRestrictions: { country: "ke" }, // Restrict to Kenya
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
      } else {
        toast({
          title: "Error",
          description: "Geolocation is not supported by your browser",
          variant: "destructive",
        });
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
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                onClick={() => {
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

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Customers
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your customer relationships and orders
          </p>
        </div>
        <div className="flex gap-2">
          <ImportExportButtons
            type="customers"
            data={customers}
            onImport={async (data) => {
              try {
                await Promise.all(
                  data.map((customer) => createCustomer(customer))
                );
                loadCustomers();
              } catch (error) {
                throw error;
              }
            }}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Customer Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="corporate_office">
                              Corporate Office
                            </SelectItem>
                            <SelectItem value="estate">Estate</SelectItem>
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
                          {isLoaded ? (
                            <LocationField field={field} />
                          ) : (
                            <Input disabled placeholder="Loading Maps..." />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable
        columns={createColumns(handleDelete, handleUpdate)}
        data={customers}
      />
    </div>
  );
}

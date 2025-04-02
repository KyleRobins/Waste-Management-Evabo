"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type Customer = {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  type: "apartment" | "corporate_office" | "estate";
  location: string | null;
  created_at: string;
};

export const createColumns = (
  onDelete: (id: string) => void,
  onUpdate: (id: string, updates: Partial<Customer>) => void
): ColumnDef<Customer>[] => [
  {
    accessorKey: "name",
    header: "Company Name",
  },
  {
    accessorKey: "contact_person",
    header: "Contact Person",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      if (!location) return "N/A";
      const words = location.split(" ");
      return words.slice(0, 2).join(" ");
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as
        | "apartment"
        | "corporate_office"
        | "estate";
      return (
        <Badge variant="outline" className="capitalize">
          {type === "corporate_office"
            ? "Corporate Office"
            : type === "apartment"
            ? "Apartment"
            : "Estate"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "active" | "inactive";
      const statusVariants = {
        active: "default",
        inactive: "destructive",
      } as const;

      return (
        <Badge variant={statusVariants[status]} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Join Date",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return date ? format(new Date(date), "MMM d, yyyy") : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(customer.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

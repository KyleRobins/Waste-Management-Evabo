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

export type WasteRecord = {
  id: string;
  date: string;
  type: string;
  quantity: string;
  customer: {
    id: string;
    name: string;
    type: string;
    contact_person: string;
    email: string;
    location: string;
  };
  location: string;
  status: "pending" | "completed" | "requires_approval";
};

export const columns: ColumnDef<WasteRecord>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), "MMM d, yyyy"),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.getValue("customer") as WasteRecord["customer"];
      return (
        <div className="flex flex-col">
          <span className="font-medium">{customer?.name}</span>
          <span className="text-xs text-muted-foreground">
            {customer?.contact_person}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Waste Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <Badge variant="outline">{type}</Badge>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue("quantity"));
      return `${quantity.toFixed(2)} kg`;
    },
  },
  {
    accessorKey: "location",
    header: "Collection Location",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "pending"
        | "completed"
        | "requires_approval";
      const statusVariants = {
        completed: "default",
        requires_approval: "destructive",
        pending: "secondary",
      } as const;

      return (
        <Badge variant={statusVariants[status]}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original;

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
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpFromLine } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function ImportExportActions({ onSuccess }: { onSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/invoices/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const result = await response.json();
      onSuccess();
      toast({
        title: "Success",
        description: `Successfully imported ${result.count} invoices`,
      });
    } catch (error) {
      console.error("Error importing file:", error);
      toast({
        title: "Error",
        description: "Failed to import invoices",
        variant: "destructive",
      });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/invoices/export", {
        method: "GET",
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `invoices-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Invoices exported successfully",
      });
    } catch (error) {
      console.error("Error exporting invoices:", error);
      toast({
        title: "Error",
        description: "Failed to export invoices",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch("/api/invoices/template");
      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "invoice-template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={handleFileUpload}
        className="hidden"
        ref={fileInputRef}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ArrowUpFromLine className="h-4 w-4" />
            Import
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Import Options</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Import Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" className="gap-2" onClick={handleExport}>
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
}

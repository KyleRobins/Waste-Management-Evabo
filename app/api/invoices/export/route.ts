import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, type)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data for export
    const exportData = invoices.map((invoice) => ({
      "Invoice Date": invoice.invoice_date,
      "Customer Name": invoice.customer?.name || "",
      "Customer Type": invoice.customer?.type || "",
      "Collection Date": invoice.collection_date,
      "Due Date": invoice.due_date,
      "Waste Quantity (kg)": invoice.waste_quantity,
      "Service Type": invoice.service_type,
      Amount: invoice.amount,
      Status: invoice.status,
      Notes: invoice.notes || "",
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return the Excel file
    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="invoices-${
          new Date().toISOString().split("T")[0]
        }.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting invoices:", error);
    return NextResponse.json(
      { error: "Failed to export invoices" },
      { status: 500 }
    );
  }
}

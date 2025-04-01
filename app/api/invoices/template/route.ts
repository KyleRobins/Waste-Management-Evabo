import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Sample data for the template
    const sampleData = [
      [
        "Customer ID",
        "Collection Date",
        "Waste Quantity (kg)",
        "Service Type",
        "Notes",
      ],
      [
        "customer-uuid-example",
        "2024-03-01",
        100,
        "standard",
        "Sample invoice notes",
      ],
      [
        "customer-uuid-example-2",
        "2024-03-02",
        150,
        "premium",
        "Another sample invoice",
      ],
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet from array of arrays
    const ws = XLSX.utils.aoa_to_sheet(sampleData);

    // Set column widths
    ws["!cols"] = [
      { wch: 40 }, // Customer ID
      { wch: 15 }, // Collection Date
      { wch: 15 }, // Waste Quantity
      { wch: 15 }, // Service Type
      { wch: 40 }, // Notes
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Invoice Template");

    // Write to buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=invoice-template.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return Response.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}

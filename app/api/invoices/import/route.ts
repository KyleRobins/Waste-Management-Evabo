import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { parse } from "papaparse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    let data: any[] = [];

    if (file.name.endsWith(".csv")) {
      // Handle CSV files
      const text = new TextDecoder().decode(fileBuffer);
      const result = parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      data = result.data;
    } else {
      // Handle Excel files
      const workbook = XLSX.read(fileBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(worksheet);
    }

    // Map the data to our invoice structure
    const mappedInvoices = data.map((row) => ({
      customer_id: row.customer_id || null,
      collection_date:
        row.collection_date || new Date().toISOString().split("T")[0],
      waste_quantity: parseFloat(row.waste_quantity) || 0,
      service_type: row.service_type === "premium" ? "premium" : "standard",
      amount: parseFloat(row.amount) || 0,
      status: row.status || "draft",
      due_date: row.due_date || null,
      invoice_date: row.invoice_date || new Date().toISOString().split("T")[0],
      notes: row.notes || "",
    }));

    // Insert the invoices into the database
    const supabase = createClient();
    const { data: insertedData, error } = await supabase
      .from("invoices")
      .insert(mappedInvoices)
      .select();

    if (error) {
      console.error("Error inserting invoices:", error);
      return NextResponse.json(
        { error: "Failed to import invoices" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Invoices imported successfully",
      count: insertedData.length,
    });
  } catch (error) {
    console.error("Error processing import:", error);
    return NextResponse.json(
      { error: "Failed to process import" },
      { status: 500 }
    );
  }
}

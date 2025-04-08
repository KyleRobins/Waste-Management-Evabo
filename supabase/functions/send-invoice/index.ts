import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (req: Request): Promise<Response> => {
  try {
    // Parse the request body
    const {
      invoiceId,
      customerEmail,
      customerName,
      invoiceNumber,
      amount,
      dueDate,
    } = await req.json();

    // Get the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get invoice details from the database
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(*)
      `
      )
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({
          success: false,
          error: invoiceError?.message || "Invoice not found",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Format the due date
    const formattedDueDate = new Date(invoice.due_date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    // Create the email HTML
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #dee2e6; }
            .content { padding: 20px; }
            .invoice-details { margin: 20px 0; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; background-color: #f8f9fa; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #6c757d; }
            .button { display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice from Waste Management Evabo</h1>
            </div>
            <div class="content">
              <p>Dear ${invoice.customer.name},</p>
              <p>Please find your invoice details below:</p>
              
              <div class="invoice-details">
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Amount:</strong> $${invoice.amount.toFixed(2)}</p>
                <p><strong>Due Date:</strong> ${formattedDueDate}</p>
                <p><strong>Service:</strong> ${
                  invoice.service_type
                } Waste Collection</p>
                <p><strong>Waste Quantity:</strong> ${
                  invoice.waste_quantity
                } kg</p>
              </div>
              
              <p>Please ensure payment is made by the due date to avoid any service interruptions.</p>
              
              <p>Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Waste Management Evabo. All rights reserved.</p>
              <p>If you have any questions, please contact us at support@waste-management-evabo.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Use direct fetch instead of Resend SDK
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Waste Management <invoices@waste-management-evabo.com>",
        to: customerEmail,
        subject: `Invoice ${invoiceNumber} - Payment Due ${formattedDueDate}`,
        html: html,
      }),
    });

    const data = await res.json();

    // Update invoice status to "sent"
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Error updating invoice status:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: `Email sent to ${customerEmail}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

Deno.serve(handler);

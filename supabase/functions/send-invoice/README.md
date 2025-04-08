# Send Invoice Edge Function

This Supabase Edge Function handles sending invoice emails using Resend.

## Setup

1. First, sign up for [Resend](https://resend.com) and get your API key.

2. Install the Supabase CLI if you haven't already:

   ```bash
   npm install -g supabase
   ```

3. Set up your Resend API key as a secret in your Supabase project:

   ```bash
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy send-invoice
   ```

## Function Parameters

When calling this function, provide the following parameters in the request body:

```json
{
  "invoiceId": "uuid-of-invoice",
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name",
  "invoiceNumber": "INVOICE#P1234010320XX",
  "amount": 1500.0,
  "dueDate": "2025-02-15"
}
```

## Usage Example

```typescript
// From your client-side code
const { data, error } = await supabase.functions.invoke("send-invoice", {
  body: {
    invoiceId: "123e4567-e89b-12d3-a456-426614174000",
    customerEmail: "customer@example.com",
    customerName: "Acme Inc.",
    invoiceNumber: "INVOICE#P1234010320XX",
    amount: 1500.0,
    dueDate: "2025-02-15",
  },
});

if (error) {
  console.error("Error sending invoice:", error);
} else {
  console.log("Invoice sent successfully:", data);
}
```

## Email Template

The function includes a responsive HTML email template with the following sections:

- Company header
- Customer greeting
- Invoice details (number, amount, due date, service type, waste quantity)
- Payment reminder
- Company footer

## Notes

- This function requires the `RESEND_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` environment variables.
- The function automatically updates the invoice status to "sent" after sending the email.
- For local development, use `supabase functions serve` to test the function locally.

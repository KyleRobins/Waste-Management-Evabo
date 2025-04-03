-- Update invoice status constraint to include new statuses
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_status_check;

ALTER TABLE invoices
ADD CONSTRAINT invoices_status_check
CHECK (status IN ('draft', 'saved', 'sent', 'unpaid', 'paid')); 
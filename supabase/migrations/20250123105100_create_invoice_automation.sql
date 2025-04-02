-- Function to calculate invoice amount based on waste type and quantity
CREATE OR REPLACE FUNCTION calculate_invoice_amount(
    waste_type TEXT,
    waste_quantity NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    -- Base rate per kg for different waste types
    CASE waste_type
        WHEN 'Paper' THEN RETURN waste_quantity * 100; -- 100 KES per kg
        WHEN 'Plastic' THEN RETURN waste_quantity * 150; -- 150 KES per kg
        WHEN 'Metal' THEN RETURN waste_quantity * 200; -- 200 KES per kg
        WHEN 'Glass' THEN RETURN waste_quantity * 120; -- 120 KES per kg
        WHEN 'Organic' THEN RETURN waste_quantity * 80; -- 80 KES per kg
        WHEN 'Electronic' THEN RETURN waste_quantity * 300; -- 300 KES per kg
        ELSE RETURN waste_quantity * 100; -- Default rate
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to create invoice from waste records
CREATE OR REPLACE FUNCTION create_invoice_from_waste_records()
RETURNS TRIGGER AS $$
DECLARE
    v_amount NUMERIC;
    v_invoice_id UUID;
    v_due_date DATE;
BEGIN
    -- Calculate amount based on waste type and quantity
    v_amount := calculate_invoice_amount(NEW.type, NEW.quantity::NUMERIC);
    
    -- Set due date to 30 days from collection date
    v_due_date := (NEW.date::DATE + INTERVAL '30 days')::DATE;

    -- Create new invoice
    INSERT INTO invoices (
        customer_id,
        amount,
        status,
        invoice_date,
        due_date,
        collection_date,
        waste_quantity,
        service_type,
        additional_services,
        notes
    ) VALUES (
        NEW.customer_id,
        v_amount,
        'unpaid',
        NEW.date::DATE,
        v_due_date,
        NEW.date::DATE,
        NEW.quantity::NUMERIC,
        'standard',
        ARRAY[]::text[],
        'Automatically generated from waste record #' || NEW.id
    )
    RETURNING id INTO v_invoice_id;

    -- Update waste record with invoice reference
    UPDATE waste_records 
    SET invoice_id = v_invoice_id
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add invoice_id column to waste_records if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'waste_records'
        AND column_name = 'invoice_id'
    ) THEN
        ALTER TABLE waste_records ADD COLUMN invoice_id UUID REFERENCES invoices(id);
    END IF;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_invoice ON waste_records;

-- Create trigger for automatic invoice creation
CREATE TRIGGER trigger_create_invoice
    AFTER INSERT ON waste_records
    FOR EACH ROW
    EXECUTE FUNCTION create_invoice_from_waste_records(); 
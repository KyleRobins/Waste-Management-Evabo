-- Drop the supplier_id column and its foreign key constraint if they exist
DO $$ BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'waste_records'
        AND column_name = 'supplier_id'
    ) THEN
        ALTER TABLE waste_records DROP COLUMN supplier_id;
    END IF;
END $$;

-- Add customer_id column if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'waste_records'
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE waste_records ADD COLUMN customer_id UUID REFERENCES customers(id);
    END IF;
END $$;

-- Add coordinates column if it doesn't exist
DO $$ BEGIN
    -- First check if the type exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'point_type') THEN
        -- Create the composite type for coordinates
        CREATE TYPE point_type AS (
            lat double precision,
            lng double precision
        );
    END IF;

    -- Then add the column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'waste_records'
        AND column_name = 'coordinates'
    ) THEN
        ALTER TABLE waste_records ADD COLUMN coordinates point_type;
    END IF;
END $$;

-- Disable RLS since authentication is disabled
ALTER TABLE waste_records DISABLE ROW LEVEL SECURITY; 
-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_customer_id ON products(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Add RLS policies for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON customers
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON customers
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON customers
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON customers
    FOR DELETE
    USING (true);

-- Add RLS policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON products
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON products
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON products
    FOR DELETE
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for customers
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
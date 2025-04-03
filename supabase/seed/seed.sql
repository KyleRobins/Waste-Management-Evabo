-- Seed file for initial database setup
-- This file should be run after migrations to populate your database with initial data

-- Seed data for users table
INSERT INTO public.users (id, email, role, full_name, phone, location, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', 'Admin User', '+1234567890', 'Nairobi', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'employee@example.com', 'employee', 'Employee User', '+1234567891', 'Nairobi', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'customer1@example.com', 'customer', 'Customer One', '+1234567892', 'Westlands', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'customer2@example.com', 'customer', 'Customer Two', '+1234567893', 'Kilimani', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'supplier@example.com', 'supplier', 'Supplier User', '+1234567894', 'Industrial Area', NOW(), NOW());

-- Seed data for profiles table
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'employee@example.com', 'employee', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'customer1@example.com', 'customer', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'customer2@example.com', 'customer', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'supplier@example.com', 'supplier', NOW(), NOW());

-- Seed data for employees table
INSERT INTO public.employees (id, email, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'employee@example.com', NOW(), NOW());

-- Seed data for customers table
INSERT INTO public.customers (id, name, contact_person, email, phone, status, created_at, user_id, type, location)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Westlands Apartments', 'Customer One', 'customer1@example.com', '+1234567892', 'active', NOW(), '00000000-0000-0000-0000-000000000003', 'apartment', 'Westlands'),
  ('00000000-0000-0000-0000-000000000002', 'Kilimani Estate', 'Customer Two', 'customer2@example.com', '+1234567893', 'active', NOW(), '00000000-0000-0000-0000-000000000004', 'estate', 'Kilimani'),
  ('00000000-0000-0000-0000-000000000003', 'Corporate Office Ltd', 'Office Manager', 'office@example.com', '+1234567895', 'active', NOW(), NULL, 'corporate_office', 'CBD');

-- Seed data for suppliers table
INSERT INTO public.suppliers (id, name, contact_person, email, phone, location, status, join_date, user_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Recycling Solutions', 'Supplier User', 'supplier@example.com', '+1234567894', 'Industrial Area', 'active', NOW(), '00000000-0000-0000-0000-000000000005', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Green Waste Management', 'Green Manager', 'green@example.com', '+1234567896', 'South B', 'active', NOW(), NULL, NOW());

-- Seed data for products table
INSERT INTO public.products (id, name, description, price, quantity, customer_id, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Regular Waste Collection', 'Weekly waste collection service', 5000.00, 1, '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Recycling Service', 'Bi-weekly recycling collection', 3000.00, 1, '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Premium Waste Collection', 'Daily waste collection service', 15000.00, 1, '00000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Corporate Waste Management', 'Full waste management solution', 25000.00, 1, '00000000-0000-0000-0000-000000000003', NOW(), NOW());

-- Seed data for invoices table
INSERT INTO public.invoices (id, customer_id, amount, status, invoice_date, due_date, collection_date, waste_quantity, service_type, additional_services, notes, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5000.00, 'pending', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '7 days', 100, 'Regular Collection', ARRAY['Sorting'], 'First invoice', NOW()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 15000.00, 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, CURRENT_DATE - INTERVAL '25 days', 300, 'Premium Collection', ARRAY['Sorting', 'Recycling'], 'Monthly service', NOW()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 25000.00, 'draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', NULL, 500, 'Corporate Service', ARRAY['Sorting', 'Recycling', 'Reporting'], 'New corporate client', NOW());

-- Seed data for waste_records table
INSERT INTO public.waste_records (id, date, type, quantity, location, status, user_id, created_at, customer_id, coordinates, invoice_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', NOW(), 'Organic', '100kg', 'Westlands', 'completed', '00000000-0000-0000-0000-000000000002', NOW(), '00000000-0000-0000-0000-000000000001', NULL, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', NOW(), 'Recyclable', '50kg', 'Westlands', 'pending', '00000000-0000-0000-0000-000000000002', NOW(), '00000000-0000-0000-0000-000000000001', NULL, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '30 days', 'Mixed', '300kg', 'Kilimani', 'completed', '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '30 days', '00000000-0000-0000-0000-000000000002', NULL, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000004', NOW(), 'Hazardous', '10kg', 'CBD', 'pending', '00000000-0000-0000-0000-000000000002', NOW(), '00000000-0000-0000-0000-000000000003', NULL, '00000000-0000-0000-0000-000000000003');

-- Seed data for payments table
INSERT INTO public.payments (id, amount, type, status, customer_id, supplier_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 5000.00, 'invoice', 'pending', '00000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('00000000-0000-0000-0000-000000000002', 15000.00, 'invoice', 'completed', '00000000-0000-0000-0000-000000000002', NULL, NOW() - INTERVAL '29 days'),
  ('00000000-0000-0000-0000-000000000003', 7500.00, 'supplier_payment', 'completed', NULL, '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000004', 5000.00, 'supplier_payment', 'pending', NULL, '00000000-0000-0000-0000-000000000002', NOW());

-- Seed data for messages table
INSERT INTO public.messages (id, subject, content, recipient_id, sender_id, status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Welcome to our platform', 'Thank you for joining our waste management platform!', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'unread', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Invoice #1 Generated', 'Your invoice has been generated and is ready for payment.', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'read', NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Collection Schedule', 'Your waste collection is scheduled for tomorrow at 9 AM.', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'unread', NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Payment Received', 'Thank you for your payment.', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'unread', NOW()),
  ('00000000-0000-0000-0000-000000000005', 'New Supplier Assignment', 'You have been assigned to handle recycling for Customer One.', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'read', NOW()); 
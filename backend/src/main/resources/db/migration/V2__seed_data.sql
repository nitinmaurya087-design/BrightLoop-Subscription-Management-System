-- BrightLoop V2__seed_data.sql
-- Realistic Seed Data for Hackathon Evaluation & Demo

-- 1. Users (Passwords: Admin@12345, Staff@12345, Customer@12345 encoded with BCrypt)
-- Hash generated for Admin@12345: $2a$10$wE4p5l1Wb01N22G5Z789eeVfGf3vKk6w9/R7r1dF0O9g5V4a1hG82
-- We also implement DataInitializerService to ensure exact runtime validation and BCrypt re-check.
INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES
(1, 'admin@brightloop.com', '$2a$10$tJ0G9jWfWvX8B4c2gQ1l8.JbTjW7q9yF3pG5kH1mN9vB7cX5zL3K.', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'staff@brightloop.com', '$2a$10$tJ0G9jWfWvX8B4c2gQ1l8.JbTjW7q9yF3pG5kH1mN9vB7cX5zL3K.', 'STAFF', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'customer@brightloop.com', '$2a$10$tJ0G9jWfWvX8B4c2gQ1l8.JbTjW7q9yF3pG5kH1mN9vB7cX5zL3K.', 'CUSTOMER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Staff Profiles
INSERT INTO staff_profiles (id, user_id, full_name, department, designation, phone, created_at, updated_at) VALUES
(1, 2, 'Rohan Verma', 'Sales & Billing', 'Senior Billing Specialist', '+91 98765 43210', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Customers (10 Realistic Customers)
INSERT INTO customers (id, user_id, full_name, email, phone, company_name, billing_address, city, state, country, postal_code, tax_id, status, registration_date) VALUES
(1, 3, 'Aditi Rao', 'customer@brightloop.com', '+91 91234 56780', 'Apex Innovations Ltd', 'Floor 4, Tech Park, Whitefield', 'Bengaluru', 'Karnataka', 'India', '560066', '29ABCDE1234F1Z5', 'ACTIVE', '2024-01-15'),
(2, NULL, 'Rajesh Patel', 'rajesh.patel@zenithcorp.in', '+91 98220 12345', 'Zenith Global Systems', 'Plot 42, Hitec City', 'Hyderabad', 'Telangana', 'India', '500081', '36ABCDE5678G2Z1', 'ACTIVE', '2024-02-01'),
(3, NULL, 'Priya Sundaram', 'priya@cloudscale.io', '+91 94440 98765', 'CloudScale Technologies', 'OMR Cyber Gateway, Navalur', 'Chennai', 'Tamil Nadu', 'India', '600130', '33ABCDE9012H3Z7', 'ACTIVE', '2024-02-18'),
(4, NULL, 'Vikram Malhotra', 'v.malhotra@novaprime.com', '+91 98110 54321', 'Nova Prime Digital', 'B-12, Sector 62', 'Noida', 'Uttar Pradesh', 'India', '201309', '09ABCDE3456I4Z3', 'ACTIVE', '2024-03-05'),
(5, NULL, 'Ananya Sharma', 'ananya@quantumfintech.com', '+91 99300 11223', 'Quantum FinTech Labs', 'BKC Commercial Complex', 'Mumbai', 'Maharashtra', 'India', '400051', '27ABCDE7890J5Z9', 'ACTIVE', '2024-03-20'),
(6, NULL, 'Karthik Menon', 'karthik@metronetworks.in', '+91 98470 65432', 'Metro Networks Infotech', 'Infopark Phase II', 'Kochi', 'Kerala', 'India', '682042', '32ABCDE2345K6Z4', 'ACTIVE', '2024-04-10'),
(7, NULL, 'Sneha Mukherjee', 'sneha@bluehorizon.co', '+91 98300 77889', 'Blue Horizon Media', 'Salt Lake Sector V', 'Kolkata', 'West Bengal', 'India', '700091', '19ABCDE6789L7Z0', 'ACTIVE', '2024-04-25'),
(8, NULL, 'Manish Chawla', 'm.chawla@aeroflow.com', '+91 98710 33445', 'AeroFlow Logistics', 'DLF Cyber City, Phase 3', 'Gurugram', 'Haryana', 'India', '122002', '06ABCDE0123M8Z6', 'ACTIVE', '2024-05-12'),
(9, NULL, 'Divya Deshmukh', 'divya@nexusecom.in', '+91 98900 88990', 'Nexus E-Commerce Solutions', 'FC Road, Shivaji Nagar', 'Pune', 'Maharashtra', 'India', '411005', '27ABCDE4567N9Z2', 'ACTIVE', '2024-06-01'),
(10, NULL, 'Arjun Nambiar', 'arjun@stellarai.co', '+91 97410 44556', 'Stellar AI Dynamics', 'Koramangala 4th Block', 'Bengaluru', 'Karnataka', 'India', '560034', '29ABCDE8901O0Z8', 'INACTIVE', '2024-06-15');

-- 4. Products (8 Products)
INSERT INTO products (id, name, product_type, description, sales_price, cost_price, notes, status) VALUES
(1, 'Business Software Core Suite', 'SERVICE', 'All-in-one ERP and subscription management engine with automated invoicing', 2000.0000, 800.0000, 'Primary flag product', 'ACTIVE'),
(2, 'Cloud Infrastructure Dedicated Server', 'GOODS', 'High-performance cloud compute instance with 99.99% uptime SLA', 4500.0000, 2200.0000, 'Compute host nodes', 'ACTIVE'),
(3, 'AI Analytics & Forecasting Engine', 'SERVICE', 'Predictive subscription churn, revenue forecasting, and cohort analysis module', 3200.0000, 1100.0000, 'Machine learning add-on', 'ACTIVE'),
(4, 'Enterprise CRM & Pipeline Hub', 'SERVICE', 'Comprehensive customer relationship management, deals, and lead tracking', 1800.0000, 650.0000, 'Full sales automation', 'ACTIVE'),
(5, 'Multi-Channel Support Desk', 'SERVICE', 'Unified helpdesk ticket system, live chat widget, and SLA escalation tracking', 1200.0000, 400.0000, 'Customer support platform', 'ACTIVE'),
(6, 'Payment Gateway Integration Connector', 'SERVICE', 'Automated reconciliation, multi-currency UPI and card processing plugin', 1500.0000, 500.0000, 'Fintech payment pipeline', 'ACTIVE'),
(7, 'Security & Compliance Vault', 'SERVICE', 'SOC2/ISO27001 audit compliance toolkit, automated vulnerability monitoring', 2800.0000, 950.0000, 'Enterprise compliance suite', 'ACTIVE'),
(8, 'API Developer Pro Gateway', 'SERVICE', 'High-throughput rate limit bypass, dedicated webhooks, and sandbox testing', 2400.0000, 750.0000, 'Developer ecosystem package', 'ACTIVE');

-- 5. Product Variants
-- Example from prompt:
-- Product: Business Software Core Suite (Base 2000)
-- Variants: Standard (+0), Odoo (+560), Premium (+1000)
INSERT INTO product_variants (id, product_id, variant_name, attribute_value, additional_price, status) VALUES
(1, 1, 'Edition', 'Standard Edition', 0.0000, 'ACTIVE'),
(2, 1, 'Edition', 'Odoo Integration Edition', 560.0000, 'ACTIVE'),
(3, 1, 'Edition', 'Enterprise Premium Edition', 1000.0000, 'ACTIVE'),
(4, 2, 'Package', '16 vCPU / 64 GB RAM', 0.0000, 'ACTIVE'),
(5, 2, 'Package', '32 vCPU / 128 GB RAM + NVMe', 1800.0000, 'ACTIVE'),
(6, 3, 'Tier', 'Standard Insights (Daily)', 0.0000, 'ACTIVE'),
(7, 3, 'Tier', 'Real-time Streaming Insights', 800.0000, 'ACTIVE'),
(8, 7, 'Package', 'Annual Audit Assistance Addon', 1200.0000, 'ACTIVE');

-- 6. Subscription Plans (6 Plans across Daily, Weekly, Monthly, Yearly)
INSERT INTO plans (id, name, description, product_id, billing_price, billing_frequency, min_quantity, available_from, available_until, auto_close_on_expiry, allow_early_closure, allow_pause, allow_renewal, status) VALUES
(1, 'Business Core Monthly', 'Monthly subscription for the core business management suite', 1, 2000.0000, 'MONTHLY', 1, '2024-01-01', '2028-12-31', FALSE, TRUE, TRUE, TRUE, 'ACTIVE'),
(2, 'Business Core Annual', 'Annual subscription for core suite with 2 months free equivalent pricing', 1, 20000.0000, 'YEARLY', 1, '2024-01-01', '2028-12-31', FALSE, TRUE, TRUE, TRUE, 'ACTIVE'),
(3, 'Cloud Compute Weekly Sprint', 'Flexible weekly compute infrastructure for testing and scaling sprints', 2, 1200.0000, 'WEEKLY', 1, '2024-01-01', '2027-12-31', FALSE, TRUE, TRUE, TRUE, 'ACTIVE'),
(4, 'High-Throughput Daily Batch', 'Daily compute and analytics batch billing for intensive data processing', 3, 200.0000, 'DAILY', 1, '2024-01-01', '2027-12-31', TRUE, TRUE, FALSE, TRUE, 'ACTIVE'),
(5, 'Enterprise Growth Stack Monthly', 'Monthly plan bundled for high-velocity teams needing CRM and Support', 4, 2800.0000, 'MONTHLY', 1, '2024-01-01', '2028-12-31', FALSE, TRUE, TRUE, TRUE, 'ACTIVE'),
(6, 'Full Suite Enterprise Annual', 'Complete all-in-one suite with dedicated compliance and developer tier', 7, 35000.0000, 'YEARLY', 1, '2024-01-01', '2028-12-31', FALSE, FALSE, TRUE, TRUE, 'ACTIVE');

-- 7. Taxes
INSERT INTO taxes (id, name, tax_type, rate, description, applicable_products, effective_start_date, effective_end_date, status) VALUES
(1, 'GST 18%', 'PERCENTAGE', 18.0000, 'Standard Goods & Services Tax for IT / SaaS', 'ALL', '2024-01-01', '2030-12-31', 'ACTIVE'),
(2, 'Tech Cess 1%', 'PERCENTAGE', 1.0000, 'Technology education & infrastructure cess', 'ALL', '2024-01-01', '2030-12-31', 'ACTIVE'),
(3, 'Fixed Regulatory Fee', 'FIXED', 50.0000, 'Mandatory statutory compliance filing fee per transaction', 'ALL', '2024-01-01', '2030-12-31', 'ACTIVE');

-- 8. Quotation Templates
INSERT INTO quotation_templates (id, name, description, validity_days) VALUES
(1, 'Startup SaaS Launch Pack', 'Standard onboarding template with Core Business Suite and CRM', 30),
(2, 'Enterprise Infrastructure & Security Offer', 'High capacity server infrastructure with compliance audit package', 45);

-- 9. Quotation Template Lines
INSERT INTO quotation_template_lines (id, template_id, product_id, plan_id, quantity, unit_price, tax_rate, discount_amount) VALUES
(1, 1, 1, 1, 1, 2000.0000, 18.0000, 0.0000),
(2, 1, 4, 5, 1, 1800.0000, 18.0000, 200.0000),
(3, 2, 2, 3, 2, 4500.0000, 18.0000, 500.0000),
(4, 2, 7, 6, 1, 2800.0000, 18.0000, 300.0000);

-- 10. Discounts (5 rules)
INSERT INTO discounts (id, name, code, discount_type, discount_value, min_purchase_amount, min_quantity, start_date, end_date, max_usage_limit, current_usage_count, applicable_products, applicable_subscriptions, status) VALUES
(1, 'Early Adopter 15% Off', 'EARLY15', 'PERCENTAGE', 15.0000, 1500.0000, 1, '2024-01-01', '2027-12-31', 200, 14, 'ALL', 'ALL', 'ACTIVE'),
(2, 'Flat ₹500 Welcome Voucher', 'WELCOME500', 'FIXED', 500.0000, 2000.0000, 1, '2024-01-01', '2027-12-31', 500, 42, 'ALL', 'ALL', 'ACTIVE'),
(3, 'Enterprise Scale 25%', 'ENTERPRISE25', 'PERCENTAGE', 25.0000, 10000.0000, 2, '2024-01-01', '2027-12-31', 50, 8, 'ALL', 'ALL', 'ACTIVE'),
(4, 'Black Friday Special ₹1200', 'SPECIAL1200', 'FIXED', 1200.0000, 4000.0000, 1, '2024-01-01', '2027-12-31', 100, 19, 'ALL', 'ALL', 'ACTIVE'),
(5, 'SaaS Sprint 10% Off', 'SPRINT10', 'PERCENTAGE', 10.0000, 1000.0000, 1, '2024-01-01', '2027-12-31', 300, 25, 'ALL', 'ALL', 'ACTIVE');

-- 11. Quotations (4 Sample Quotations)
INSERT INTO quotations (id, quotation_number, customer_id, template_id, creation_date, expiry_date, payment_terms, notes, subtotal, tax_amount, discount_amount, grand_total, status, converted_subscription_id) VALUES
(1, 'QTN-2024-001', 1, 1, '2024-06-01', '2024-07-01', 'Net 30', 'Standard startup package quotation', 2560.0000, 460.8000, 200.0000, 2820.8000, 'CONFIRMED', 1),
(2, 'QTN-2024-002', 2, 2, '2024-06-10', '2024-07-10', 'Net 15', 'Dedicated compute and monitoring quotation', 6300.0000, 1134.0000, 500.0000, 6934.0000, 'CONFIRMED', 2),
(3, 'QTN-2024-003', 4, 1, '2024-07-01', '2024-08-01', 'Net 30', 'Proposal for Nova Prime digital team', 2000.0000, 360.0000, 0.0000, 2360.0000, 'QUOTATION', NULL),
(4, 'QTN-2024-004', 5, NULL, '2024-07-15', '2024-08-15', 'Immediate', 'Custom draft quotation for FinTech suite', 3200.0000, 576.0000, 300.0000, 3476.0000, 'DRAFT', NULL);

-- Quotation Lines
INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, plan_id, quantity, unit_price, tax_amount, discount_amount, subtotal, total) VALUES
(1, 1, 1, 2, 1, 1, 2560.0000, 460.8000, 200.0000, 2560.0000, 2820.8000),
(2, 2, 2, 5, 3, 1, 6300.0000, 1134.0000, 500.0000, 6300.0000, 6934.0000),
(3, 3, 1, 1, 1, 1, 2000.0000, 360.0000, 0.0000, 2000.0000, 2360.0000),
(4, 4, 3, 6, 4, 1, 3200.0000, 576.0000, 300.0000, 3200.0000, 3476.0000);

-- 12. Subscriptions (10 Subscriptions with varying statuses)
-- Dates formatted to cover Active, Paused, Closed, Due for Billing
INSERT INTO subscriptions (id, subscription_number, customer_id, plan_id, start_date, expiry_date, billing_frequency, payment_terms, subtotal, tax_amount, discount_amount, grand_total, next_billing_date, status, auto_close_on_expiry, allow_early_closure, allow_pause, allow_renewal, notes) VALUES
(1, 'SUB-2024-001', 1, 1, '2024-06-01', '2025-06-01', 'MONTHLY', 'Net 15', 2560.0000, 460.8000, 200.0000, 2820.8000, '2024-11-01', 'ACTIVE', FALSE, TRUE, TRUE, TRUE, 'Customer primary monthly plan'),
(2, 'SUB-2024-002', 2, 2, '2024-01-15', '2025-01-15', 'YEARLY', 'Net 30', 20000.0000, 3600.0000, 1500.0000, 22100.0000, '2025-01-15', 'ACTIVE', FALSE, TRUE, TRUE, TRUE, 'Annual enterprise subscription'),
(3, 'SUB-2024-003', 3, 3, '2024-09-01', '2025-03-01', 'WEEKLY', 'Immediate', 1200.0000, 216.0000, 100.0000, 1316.0000, '2024-11-03', 'ACTIVE', FALSE, TRUE, TRUE, TRUE, 'Weekly compute sprint cluster'),
(4, 'SUB-2024-004', 4, 1, '2024-04-01', '2025-04-01', 'MONTHLY', 'Net 15', 2000.0000, 360.0000, 0.0000, 2360.0000, '2024-11-01', 'ACTIVE', FALSE, TRUE, TRUE, TRUE, 'Active core subscription'),
(5, 'SUB-2024-005', 5, 5, '2024-05-10', '2025-05-10', 'MONTHLY', 'Net 30', 2800.0000, 504.0000, 250.0000, 3054.0000, '2024-11-10', 'ACTIVE', FALSE, TRUE, TRUE, TRUE, 'Fintech growth stack'),
(6, 'SUB-2024-006', 6, 1, '2024-03-01', '2025-03-01', 'MONTHLY', 'Net 15', 2000.0000, 360.0000, 200.0000, 2160.0000, '2024-11-01', 'PAUSED', FALSE, TRUE, TRUE, TRUE, 'Paused temporarily at customer request'),
(7, 'SUB-2024-007', 7, 6, '2024-02-01', '2025-02-01', 'YEARLY', 'Net 30', 35000.0000, 6300.0000, 3000.0000, 38300.0000, '2025-02-01', 'ACTIVE', FALSE, FALSE, TRUE, TRUE, 'Full enterprise security suite'),
(8, 'SUB-2024-008', 8, 4, '2024-10-01', '2024-10-31', 'DAILY', 'Immediate', 200.0000, 36.0000, 0.0000, 236.0000, '2024-10-31', 'CLOSED', TRUE, TRUE, FALSE, TRUE, 'Completed daily batch contract'),
(9, 'SUB-2024-009', 9, 1, '2024-07-01', '2025-07-01', 'MONTHLY', 'Net 15', 2560.0000, 460.8000, 0.0000, 3020.8000, '2024-11-01', 'ACTIVE', FALSE, TRUE, TRUE, TRUE, 'E-commerce platform backend'),
(10, 'SUB-2024-010', 10, 5, '2024-06-15', '2024-09-15', 'MONTHLY', 'Immediate', 2800.0000, 504.0000, 0.0000, 3304.0000, NULL, 'CLOSED', TRUE, TRUE, TRUE, TRUE, 'Terminated early by client request');

-- Subscription Lines
INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, discount_amount, subtotal, total) VALUES
(1, 1, 1, 2, 1, 2560.0000, 18.0000, 200.0000, 2560.0000, 2820.8000),
(2, 2, 1, 1, 10, 2000.0000, 18.0000, 1500.0000, 20000.0000, 22100.0000),
(3, 3, 2, 4, 1, 1200.0000, 18.0000, 100.0000, 1200.0000, 1316.0000),
(4, 4, 1, 1, 1, 2000.0000, 18.0000, 0.0000, 2000.0000, 2360.0000),
(5, 5, 4, NULL, 1, 2800.0000, 18.0000, 250.0000, 2800.0000, 3054.0000),
(6, 6, 1, 1, 1, 2000.0000, 18.0000, 200.0000, 2000.0000, 2160.0000),
(7, 7, 7, 8, 1, 35000.0000, 18.0000, 3000.0000, 35000.0000, 38300.0000),
(8, 8, 3, 6, 1, 200.0000, 18.0000, 0.0000, 200.0000, 236.0000),
(9, 9, 1, 2, 1, 2560.0000, 18.0000, 0.0000, 2560.0000, 3020.8000),
(10, 10, 4, NULL, 1, 2800.0000, 18.0000, 0.0000, 2800.0000, 3304.0000);

-- 13. Invoices (15 Invoices across Paid, Confirmed, Draft, Overdue, Cancelled)
INSERT INTO invoices (id, invoice_number, customer_id, subscription_id, invoice_date, due_date, billing_period_start, billing_period_end, payment_terms, subtotal, total_tax, total_discount, grand_total, amount_paid, amount_outstanding, status, notes) VALUES
(1, 'INV-2024-001', 1, 1, '2024-06-01', '2024-06-16', '2024-06-01', '2024-06-30', 'Net 15', 2560.0000, 460.8000, 200.0000, 2820.8000, 2820.8000, 0.0000, 'PAID', 'June billing cycle for Apex Innovations'),
(2, 'INV-2024-002', 1, 1, '2024-07-01', '2024-07-16', '2024-07-01', '2024-07-31', 'Net 15', 2560.0000, 460.8000, 200.0000, 2820.8000, 2820.8000, 0.0000, 'PAID', 'July billing cycle for Apex Innovations'),
(3, 'INV-2024-003', 1, 1, '2024-08-01', '2024-08-16', '2024-08-01', '2024-08-31', 'Net 15', 2560.0000, 460.8000, 200.0000, 2820.8000, 2820.8000, 0.0000, 'PAID', 'August billing cycle for Apex Innovations'),
(4, 'INV-2024-004', 1, 1, '2024-09-01', '2024-09-16', '2024-09-01', '2024-09-30', 'Net 15', 2560.0000, 460.8000, 200.0000, 2820.8000, 2820.8000, 0.0000, 'PAID', 'September billing cycle'),
(5, 'INV-2024-005', 1, 1, '2024-10-01', '2024-10-16', '2024-10-01', '2024-10-31', 'Net 15', 2560.0000, 460.8000, 200.0000, 2820.8000, 1000.0000, 1820.8000, 'CONFIRMED', 'Partially paid October invoice - Overdue'),
(6, 'INV-2024-006', 2, 2, '2024-01-15', '2024-02-15', '2024-01-15', '2025-01-14', 'Net 30', 20000.0000, 3600.0000, 1500.0000, 22100.0000, 22100.0000, 0.0000, 'PAID', 'Annual billing Zenith Global Systems'),
(7, 'INV-2024-007', 3, 3, '2024-09-01', '2024-09-08', '2024-09-01', '2024-09-07', 'Immediate', 1200.0000, 216.0000, 100.0000, 1316.0000, 1316.0000, 0.0000, 'PAID', 'Week 1 compute billing CloudScale'),
(8, 'INV-2024-008', 3, 3, '2024-09-08', '2024-09-15', '2024-09-08', '2024-09-14', 'Immediate', 1200.0000, 216.0000, 100.0000, 1316.0000, 1316.0000, 0.0000, 'PAID', 'Week 2 compute billing CloudScale'),
(9, 'INV-2024-009', 4, 4, '2024-08-01', '2024-08-16', '2024-08-01', '2024-08-31', 'Net 15', 2000.0000, 360.0000, 0.0000, 2360.0000, 2360.0000, 0.0000, 'PAID', 'August invoice Nova Prime'),
(10, 'INV-2024-010', 4, 4, '2024-09-01', '2024-09-16', '2024-09-01', '2024-09-30', 'Net 15', 2000.0000, 360.0000, 0.0000, 2360.0000, 0.0000, 2360.0000, 'CONFIRMED', 'September unpaid invoice - Overdue'),
(11, 'INV-2024-011', 5, 5, '2024-09-10', '2024-10-10', '2024-09-10', '2024-10-09', 'Net 30', 2800.0000, 504.0000, 250.0000, 3054.0000, 3054.0000, 0.0000, 'PAID', 'September invoice Quantum FinTech'),
(12, 'INV-2024-012', 5, 5, '2024-10-10', '2024-11-10', '2024-10-10', '2024-11-09', 'Net 30', 2800.0000, 504.0000, 250.0000, 3054.0000, 0.0000, 3054.0000, 'CONFIRMED', 'Current billing cycle due in November'),
(13, 'INV-2024-013', 7, 7, '2024-02-01', '2024-03-02', '2024-02-01', '2025-01-31', 'Net 30', 35000.0000, 6300.0000, 3000.0000, 38300.0000, 38300.0000, 0.0000, 'PAID', 'Annual invoice Blue Horizon Media'),
(14, 'INV-2024-014', 9, 9, '2024-10-01', '2024-10-16', '2024-10-01', '2024-10-31', 'Net 15', 2560.0000, 460.8000, 0.0000, 3020.8000, 0.0000, 3020.8000, 'CONFIRMED', 'October billing cycle - Overdue'),
(15, 'INV-2024-015', 10, 10, '2024-06-15', '2024-07-15', '2024-06-15', '2024-07-14', 'Immediate', 2800.0000, 504.0000, 0.0000, 3304.0000, 0.0000, 3304.0000, 'CANCELLED', 'Voided on plan change');

-- Invoice Lines
INSERT INTO invoice_lines (id, invoice_id, product_id, variant_id, description, quantity, unit_price, tax_rate, tax_amount, discount_amount, subtotal, total) VALUES
(1, 1, 1, 2, 'Business Software Core Suite (Odoo Integration Edition)', 1, 2560.0000, 18.0000, 460.8000, 200.0000, 2560.0000, 2820.8000),
(2, 2, 1, 2, 'Business Software Core Suite (Odoo Integration Edition)', 1, 2560.0000, 18.0000, 460.8000, 200.0000, 2560.0000, 2820.8000),
(3, 3, 1, 2, 'Business Software Core Suite (Odoo Integration Edition)', 1, 2560.0000, 18.0000, 460.8000, 200.0000, 2560.0000, 2820.8000),
(4, 4, 1, 2, 'Business Software Core Suite (Odoo Integration Edition)', 1, 2560.0000, 18.0000, 460.8000, 200.0000, 2560.0000, 2820.8000),
(5, 5, 1, 2, 'Business Software Core Suite (Odoo Integration Edition)', 1, 2560.0000, 18.0000, 460.8000, 200.0000, 2560.0000, 2820.8000),
(6, 6, 1, 1, 'Business Software Core Suite (Standard)', 10, 2000.0000, 18.0000, 3600.0000, 1500.0000, 20000.0000, 22100.0000),
(7, 7, 2, 4, 'Cloud Infrastructure Dedicated Server (16 vCPU / 64 GB)', 1, 1200.0000, 18.0000, 216.0000, 100.0000, 1200.0000, 1316.0000),
(8, 8, 2, 4, 'Cloud Infrastructure Dedicated Server (16 vCPU / 64 GB)', 1, 1200.0000, 18.0000, 216.0000, 100.0000, 1200.0000, 1316.0000),
(9, 9, 1, 1, 'Business Software Core Suite', 1, 2000.0000, 18.0000, 360.0000, 0.0000, 2000.0000, 2360.0000),
(10, 10, 1, 1, 'Business Software Core Suite', 1, 2000.0000, 18.0000, 360.0000, 0.0000, 2000.0000, 2360.0000),
(11, 11, 4, NULL, 'Enterprise CRM & Pipeline Hub', 1, 2800.0000, 18.0000, 504.0000, 250.0000, 2800.0000, 3054.0000),
(12, 12, 4, NULL, 'Enterprise CRM & Pipeline Hub', 1, 2800.0000, 18.0000, 504.0000, 250.0000, 2800.0000, 3054.0000),
(13, 13, 7, 8, 'Security & Compliance Vault (Annual Package)', 1, 35000.0000, 18.0000, 6300.0000, 3000.0000, 35000.0000, 38300.0000),
(14, 14, 1, 2, 'Business Software Core Suite (Odoo Integration Edition)', 1, 2560.0000, 18.0000, 460.8000, 0.0000, 2560.0000, 3020.8000),
(15, 15, 4, NULL, 'Enterprise CRM & Pipeline Hub', 1, 2800.0000, 18.0000, 504.0000, 0.0000, 2800.0000, 3304.0000);

-- 14. Payments (12 Payments)
INSERT INTO payments (id, payment_reference, invoice_id, customer_id, payment_method, amount, payment_date, transaction_reference, notes, created_by, status) VALUES
(1, 'PAY-2024-001', 1, 1, 'UPI', 2820.8000, '2024-06-03', 'UPI/240603991201/APEX', 'Settled via HDFC UPI merchant handle', 'System Gateway', 'SUCCESS'),
(2, 'PAY-2024-002', 2, 1, 'BANK_TRANSFER', 2820.8000, '2024-07-04', 'NEFT/N1892304910/APEX', 'NEFT corporate transfer from ICICI', 'Rohan Verma', 'SUCCESS'),
(3, 'PAY-2024-003', 3, 1, 'CREDIT_CARD', 2820.8000, '2024-08-02', 'CC/TXN-998811-VISA', 'Autopay charged to Visa Corporate card', 'System Gateway', 'SUCCESS'),
(4, 'PAY-2024-004', 4, 1, 'UPI', 2820.8000, '2024-09-03', 'UPI/240903881023/APEX', 'Settled via GooglePay UPI', 'System Gateway', 'SUCCESS'),
(5, 'PAY-2024-005', 5, 1, 'BANK_TRANSFER', 1000.0000, '2024-10-18', 'RTGS/R241018890123', 'Part payment received via RTGS', 'Rohan Verma', 'SUCCESS'),
(6, 'PAY-2024-006', 6, 2, 'BANK_TRANSFER', 22100.0000, '2024-01-20', 'NEFT/ZENITH2024ANNUAL', 'Annual advance wire transfer', 'Rohan Verma', 'SUCCESS'),
(7, 'PAY-2024-007', 7, 3, 'CREDIT_CARD', 1316.0000, '2024-09-02', 'CC/TXN-334411-MC', 'MasterCard payment CloudScale', 'System Gateway', 'SUCCESS'),
(8, 'PAY-2024-008', 8, 3, 'CREDIT_CARD', 1316.0000, '2024-09-09', 'CC/TXN-334499-MC', 'MasterCard payment CloudScale', 'System Gateway', 'SUCCESS'),
(9, 'PAY-2024-009', 9, 4, 'UPI', 2360.0000, '2024-08-05', 'UPI/240805112233/NOVA', 'Settled via PhonePe UPI', 'System Gateway', 'SUCCESS'),
(10, 'PAY-2024-010', 11, 5, 'BANK_TRANSFER', 3054.0000, '2024-09-15', 'RTGS/QUANTUM-SEP24', 'Corporate treasury bank wire', 'Rohan Verma', 'SUCCESS'),
(11, 'PAY-2024-011', 13, 7, 'BANK_TRANSFER', 38300.0000, '2024-02-10', 'WIRE/BLUEHORIZON-ANNUAL', 'Annual security subscription payment', 'Rohan Verma', 'SUCCESS'),
(12, 'PAY-2024-012', 1, 1, 'OTHER', 0.0000, '2024-06-01', 'SYS-INIT', 'Initial zero test verification check', 'System Gateway', 'SUCCESS');

-- 15. Payment Receipts
INSERT INTO payment_receipts (id, payment_id, receipt_number, receipt_data, issued_at) VALUES
(1, 1, 'RCP-2024-001', '{"amount": 2820.80, "method": "UPI", "customer": "Apex Innovations Ltd", "invoice": "INV-2024-001"}', '2024-06-03 10:30:00'),
(2, 2, 'RCP-2024-002', '{"amount": 2820.80, "method": "BANK_TRANSFER", "customer": "Apex Innovations Ltd", "invoice": "INV-2024-002"}', '2024-07-04 11:15:00'),
(3, 3, 'RCP-2024-003', '{"amount": 2820.80, "method": "CREDIT_CARD", "customer": "Apex Innovations Ltd", "invoice": "INV-2024-003"}', '2024-08-02 09:45:00'),
(4, 6, 'RCP-2024-004', '{"amount": 22100.00, "method": "BANK_TRANSFER", "customer": "Zenith Global Systems", "invoice": "INV-2024-006"}', '2024-01-20 14:00:00'),
(5, 11, 'RCP-2024-005', '{"amount": 38300.00, "method": "BANK_TRANSFER", "customer": "Blue Horizon Media", "invoice": "INV-2024-013"}', '2024-02-10 16:30:00');

-- 16. Audit Logs
INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, user_email, details, ip_address, created_at) VALUES
(1, 'USER_LOGIN', 'User', '1', 1, 'admin@brightloop.com', 'Admin logged in successfully', '127.0.0.1', CURRENT_TIMESTAMP),
(2, 'CREATE_SUBSCRIPTION', 'Subscription', '1', 1, 'admin@brightloop.com', 'Created subscription SUB-2024-001 for Apex Innovations', '127.0.0.1', CURRENT_TIMESTAMP),
(3, 'RECORD_PAYMENT', 'Payment', '1', 1, 'admin@brightloop.com', 'Recorded UPI payment of 2820.80 against INV-2024-001', '127.0.0.1', CURRENT_TIMESTAMP);

-- 17. Billing Executions
INSERT INTO billing_executions (id, execution_time, subscriptions_processed, invoices_generated, total_billed_amount, status, error_message, triggered_by) VALUES
(1, CURRENT_TIMESTAMP, 10, 2, 5841.6000, 'SUCCESS', NULL, 'AUTOMATED_CRON_SCHEDULER');

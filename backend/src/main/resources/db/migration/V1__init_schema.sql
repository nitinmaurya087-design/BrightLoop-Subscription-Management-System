-- BrightLoop V1__init_schema.sql
-- Compatible with MySQL 8 and H2 (MySQL Mode)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, STAFF, CUSTOMER
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Staff Profiles
CREATE TABLE IF NOT EXISTS staff_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(50),
    company_name VARCHAR(150),
    billing_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(30),
    tax_id VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
    registration_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_company ON customers(company_name);
CREATE INDEX idx_customers_status ON customers(status);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    product_type VARCHAR(50) NOT NULL DEFAULT 'SERVICE', -- SERVICE, GOODS
    description TEXT,
    sales_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    cost_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products(name);

-- 5. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(100) NOT NULL,
    additional_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- 6. Subscription Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    product_id BIGINT NOT NULL,
    billing_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    billing_frequency VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    min_quantity INT NOT NULL DEFAULT 1,
    available_from DATE,
    available_until DATE,
    auto_close_on_expiry BOOLEAN NOT NULL DEFAULT FALSE,
    allow_early_closure BOOLEAN NOT NULL DEFAULT TRUE,
    allow_pause BOOLEAN NOT NULL DEFAULT TRUE,
    allow_renewal BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ARCHIVED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_plans_status ON plans(status);
CREATE INDEX idx_plans_frequency ON plans(billing_frequency);

-- 7. Taxes Table
CREATE TABLE IF NOT EXISTS taxes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tax_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, FIXED
    rate DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    description VARCHAR(255),
    applicable_products TEXT, -- Comma-separated product IDs or 'ALL'
    effective_start_date DATE NOT NULL,
    effective_end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_taxes_status ON taxes(status);

-- 8. Quotation Templates Table
CREATE TABLE IF NOT EXISTS quotation_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    validity_days INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Quotation Template Lines Table
CREATE TABLE IF NOT EXISTS quotation_template_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    plan_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    tax_rate DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    discount_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    CONSTRAINT fk_tpl_line_template FOREIGN KEY (template_id) REFERENCES quotation_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_tpl_line_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 10. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    template_id BIGINT,
    creation_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    notes TEXT,
    subtotal DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    tax_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    discount_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    grand_total DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, QUOTATION, CONFIRMED, ACTIVE, CLOSED
    converted_subscription_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quotation_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_quotation_number ON quotations(quotation_number);
CREATE INDEX idx_quotation_customer ON quotations(customer_id);
CREATE INDEX idx_quotation_status ON quotations(status);

-- 11. Quotation Lines Table
CREATE TABLE IF NOT EXISTS quotation_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quotation_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT,
    plan_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    tax_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    discount_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    subtotal DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    total DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    CONSTRAINT fk_qline_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    CONSTRAINT fk_qline_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 12. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE,
    billing_frequency VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    payment_terms VARCHAR(100) DEFAULT 'Immediate',
    subtotal DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    tax_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    discount_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    grand_total DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    next_billing_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, QUOTATION, CONFIRMED, ACTIVE, PAUSED, CLOSED
    auto_close_on_expiry BOOLEAN NOT NULL DEFAULT FALSE,
    allow_early_closure BOOLEAN NOT NULL DEFAULT TRUE,
    allow_pause BOOLEAN NOT NULL DEFAULT TRUE,
    allow_renewal BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE INDEX idx_subscriptions_number ON subscriptions(subscription_number);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_bill ON subscriptions(next_billing_date);

-- 13. Subscription Lines Table
CREATE TABLE IF NOT EXISTS subscription_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    tax_rate DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    discount_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    subtotal DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    total DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    CONSTRAINT fk_sline_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sline_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 14. Discounts Table
CREATE TABLE IF NOT EXISTS discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, FIXED
    discount_value DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    min_purchase_amount DECIMAL(19, 4) DEFAULT 0.0000,
    min_quantity INT DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    max_usage_limit INT DEFAULT 100,
    current_usage_count INT NOT NULL DEFAULT 0,
    applicable_products TEXT, -- Comma-separated product IDs or 'ALL'
    applicable_subscriptions TEXT, -- Comma-separated plan/subscription IDs or 'ALL'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, EXPIRED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_status ON discounts(status);

-- 15. Discount Usages Table
CREATE TABLE IF NOT EXISTS discount_usages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    discount_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    invoice_id BIGINT,
    subscription_id BIGINT,
    applied_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dusage_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_dusage_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 16. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    subscription_id BIGINT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    payment_terms VARCHAR(100) DEFAULT 'Net 15',
    subtotal DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    total_tax DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    total_discount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    grand_total DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    amount_paid DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    amount_outstanding DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, CONFIRMED, PAID, CANCELLED
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    CONSTRAINT uq_inv_sub_period UNIQUE (subscription_id, billing_period_start, billing_period_end)
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- 17. Invoice Lines Table
CREATE TABLE IF NOT EXISTS invoice_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    tax_rate DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    tax_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    discount_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    subtotal DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    total DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    CONSTRAINT fk_iline_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_iline_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 18. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    invoice_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CASH, BANK_TRANSFER, UPI, CREDIT_CARD, DEBIT_CARD, OTHER
    amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    payment_date DATE NOT NULL,
    transaction_reference VARCHAR(150),
    notes TEXT,
    created_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILED, REFUNDED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_reference ON payments(payment_reference);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- 19. Payment Receipts Table
CREATE TABLE IF NOT EXISTS payment_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL UNIQUE,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    receipt_data TEXT,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rcpt_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- 20. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(150) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pwreset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 21. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    user_id BIGINT,
    user_email VARCHAR(191),
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- 22. Billing Executions Table (Tracks automated billing runs)
CREATE TABLE IF NOT EXISTS billing_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    execution_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscriptions_processed INT NOT NULL DEFAULT 0,
    invoices_generated INT NOT NULL DEFAULT 0,
    total_billed_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILED, PARTIAL
    error_message TEXT,
    triggered_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM_SCHEDULER'
);

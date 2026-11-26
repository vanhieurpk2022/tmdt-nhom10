-- Tương thích cả cơ sở dữ liệu hiện hữu đã được Hibernate bổ sung cột.
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'product_image' AND column_name = 'owner_factory_id') = 0, 'ALTER TABLE product_image ADD COLUMN owner_factory_id BIGINT NULL', 'SELECT 1');
PREPARE schema_change FROM @ddl; EXECUTE schema_change; DEALLOCATE PREPARE schema_change;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'vouchers' AND column_name = 'factory_id') = 0, 'ALTER TABLE vouchers ADD COLUMN factory_id BIGINT NULL', 'SELECT 1');
PREPARE schema_change FROM @ddl; EXECUTE schema_change; DEALLOCATE PREPARE schema_change;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'vouchers' AND column_name = 'version') = 0, 'ALTER TABLE vouchers ADD COLUMN version BIGINT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE schema_change FROM @ddl; EXECUTE schema_change; DEALLOCATE PREPARE schema_change;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders' AND column_name = 'applied_voucher_id') = 0, 'ALTER TABLE orders ADD COLUMN applied_voucher_id BIGINT NULL', 'SELECT 1');
PREPARE schema_change FROM @ddl; EXECUTE schema_change; DEALLOCATE PREPARE schema_change;
CREATE TABLE IF NOT EXISTS support_ticket (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, order_id BIGINT NOT NULL,
    factory_id BIGINT NOT NULL, title VARCHAR(150) NOT NULL, message VARCHAR(3000) NOT NULL,
    reply VARCHAR(3000), status VARCHAR(20) NOT NULL, created_at DATETIME(6), updated_at DATETIME(6),
    FOREIGN KEY (user_id) REFERENCES user(id), FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (factory_id) REFERENCES factory(id)
);
CREATE TABLE IF NOT EXISTS settlement_payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, factory_id BIGINT NOT NULL, amount BIGINT NOT NULL,
    gross_sales BIGINT NOT NULL DEFAULT 0, platform_fee BIGINT NOT NULL DEFAULT 0, platform_fee_rate DOUBLE NOT NULL DEFAULT 0,
    bank_name VARCHAR(255), account_number VARCHAR(255), account_holder VARCHAR(255),
    transaction_code VARCHAR(100) NOT NULL UNIQUE, note VARCHAR(500), disbursed_by VARCHAR(255), disbursed_at DATETIME(6),
    FOREIGN KEY (factory_id) REFERENCES factory(id)
);

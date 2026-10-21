-- Hibernate may have already created these objects before Flyway runs.
-- Helpers are removed after migration and are safe to recreate after an interrupted run.
DROP PROCEDURE IF EXISTS v3_add_column;
DROP PROCEDURE IF EXISTS v3_add_index;
DROP PROCEDURE IF EXISTS v3_add_foreign_key;

DELIMITER $$

CREATE PROCEDURE v3_add_column(IN p_table VARCHAR(64), IN p_column VARCHAR(64), IN p_definition TEXT)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = p_table AND column_name = p_column
    ) THEN
        SET @v3_ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE v3_statement FROM @v3_ddl;
        EXECUTE v3_statement;
        DEALLOCATE PREPARE v3_statement;
    END IF;
END$$

CREATE PROCEDURE v3_add_index(IN p_table VARCHAR(64), IN p_name VARCHAR(64), IN p_columns TEXT, IN p_unique BOOLEAN)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = p_table AND index_name = p_name
    ) THEN
        SET @v3_ddl = CONCAT('CREATE ', IF(p_unique, 'UNIQUE ', ''), 'INDEX `', p_name, '` ON `', p_table, '` (', p_columns, ')');
        PREPARE v3_statement FROM @v3_ddl;
        EXECUTE v3_statement;
        DEALLOCATE PREPARE v3_statement;
    END IF;
END$$

CREATE PROCEDURE v3_add_foreign_key(IN p_table VARCHAR(64), IN p_name VARCHAR(64), IN p_column VARCHAR(64), IN p_reference VARCHAR(64))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = DATABASE() AND table_name = p_table
            AND constraint_name = p_name AND constraint_type = 'FOREIGN KEY'
    ) THEN
        SET @v3_ddl = CONCAT('ALTER TABLE `', p_table, '` ADD CONSTRAINT `', p_name,
            '` FOREIGN KEY (`', p_column, '`) REFERENCES `', p_reference, '` (id)');
        PREPARE v3_statement FROM @v3_ddl;
        EXECUTE v3_statement;
        DEALLOCATE PREPARE v3_statement;
    END IF;
END$$

DELIMITER ;

CALL v3_add_column('orders', 'payable_amount_vnd', 'BIGINT NULL');
CALL v3_add_column('orders', 'payment_status', 'VARCHAR(32) NULL DEFAULT ''PENDING''');
CALL v3_add_column('orders', 'reservation_expires_at', 'TIMESTAMP(6) NULL');
CALL v3_add_column('orders', 'stock_held', 'BIT(1) NOT NULL DEFAULT b''0''');
CALL v3_add_column('orders', 'paid_attempt_id', 'BIGINT NULL');
CALL v3_add_column('orders', 'checkout_key', 'VARCHAR(80) NULL');
CALL v3_add_column('orders', 'checkout_fingerprint', 'VARCHAR(64) NULL');

UPDATE orders SET stock_held = b'0' WHERE stock_held IS NULL;
ALTER TABLE orders
    MODIFY COLUMN status VARCHAR(32) NOT NULL,
    MODIFY COLUMN payment_status VARCHAR(32) NULL DEFAULT 'PENDING',
    MODIFY COLUMN stock_held BIT(1) NOT NULL DEFAULT b'0',
    MODIFY COLUMN checkout_key VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL;
UPDATE orders SET payment_status = 'PENDING' WHERE payment_status IS NULL;

-- Existing orders retain their payment receipts and inventory reservations.
CREATE TABLE IF NOT EXISTS payment_attempt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    provider VARCHAR(16) NOT NULL,
    merchant_code VARCHAR(8) NOT NULL,
    txn_ref VARCHAR(100) NOT NULL,
    amount_vnd BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    payment_url TEXT NOT NULL,
    received_at TIMESTAMP(6) NULL,
    transaction_no VARCHAR(15),
    receipt_no VARCHAR(15),
    bank_code VARCHAR(20),
    response_code VARCHAR(2),
    provider_transaction_status VARCHAR(2),
    pay_date VARCHAR(14),
    callback_fingerprint VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS payment_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_key VARCHAR(180) NOT NULL,
    order_id BIGINT NOT NULL,
    attempt_id BIGINT NULL,
    type VARCHAR(40) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    resolved_at TIMESTAMP(6) NULL,
    resolution_note VARCHAR(500),
    resolved_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payment_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_retry_key (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    request_key VARCHAR(80) NOT NULL,
    attempt_id BIGINT NOT NULL
);

-- Opaque references and request keys are case-sensitive.
ALTER TABLE payment_attempt MODIFY txn_ref VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL;
ALTER TABLE payment_retry_key MODIFY request_key VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL;

CALL v3_add_index('orders', 'uk_order_checkout', 'user_id, checkout_key', TRUE);
CALL v3_add_index('payment_attempt', 'uk_payment_ref', 'txn_ref', TRUE);
CALL v3_add_index('payment_attempt', 'uk_payment_receipt', 'merchant_code, receipt_no', TRUE);
CALL v3_add_index('payment_event', 'uk_payment_event', 'event_key', TRUE);
CALL v3_add_index('payment_notification', 'uk_payment_notice', 'event_id', TRUE);
CALL v3_add_index('payment_retry_key', 'uk_payment_retry', 'order_id, request_key', TRUE);
CALL v3_add_index('orders', 'ix_payment_timeout', 'status, reservation_expires_at', FALSE);
CALL v3_add_index('payment_attempt', 'ix_payment_order', 'order_id, id', FALSE);
CALL v3_add_index('payment_attempt', 'ix_payment_timeout', 'status, expires_at', FALSE);
CALL v3_add_index('payment_event', 'ix_payment_event_queue', 'status, id', FALSE);

CALL v3_add_foreign_key('payment_attempt', 'fk_payment_order', 'order_id', 'orders');
CALL v3_add_foreign_key('payment_event', 'fk_event_order', 'order_id', 'orders');
CALL v3_add_foreign_key('payment_event', 'fk_event_attempt', 'attempt_id', 'payment_attempt');
CALL v3_add_foreign_key('payment_notification', 'fk_notice_event', 'event_id', 'payment_event');
CALL v3_add_foreign_key('payment_retry_key', 'fk_retry_order', 'order_id', 'orders');
CALL v3_add_foreign_key('payment_retry_key', 'fk_retry_attempt', 'attempt_id', 'payment_attempt');

DROP PROCEDURE v3_add_column;
DROP PROCEDURE v3_add_index;
DROP PROCEDURE v3_add_foreign_key;
SET @v3_ddl = NULL;

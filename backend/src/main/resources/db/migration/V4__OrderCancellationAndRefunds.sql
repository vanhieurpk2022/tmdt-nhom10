DROP PROCEDURE IF EXISTS v4_add_column;
DROP PROCEDURE IF EXISTS v4_add_index;
DROP PROCEDURE IF EXISTS v4_add_constraint;
DROP PROCEDURE IF EXISTS v4_prepare_refunds;

DELIMITER $$

CREATE PROCEDURE v4_add_column(IN p_table VARCHAR(64), IN p_column VARCHAR(64), IN p_definition TEXT)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = p_table AND column_name = p_column
    ) THEN
        SET @v4_ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE v4_statement FROM @v4_ddl;
        EXECUTE v4_statement;
        DEALLOCATE PREPARE v4_statement;
    END IF;
END$$

CREATE PROCEDURE v4_add_index(IN p_table VARCHAR(64), IN p_name VARCHAR(64), IN p_columns TEXT, IN p_unique BOOLEAN)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = p_table AND index_name = p_name
    ) THEN
        SET @v4_ddl = CONCAT('CREATE ', IF(p_unique, 'UNIQUE ', ''), 'INDEX `', p_name,
            '` ON `', p_table, '` (', p_columns, ')');
        PREPARE v4_statement FROM @v4_ddl;
        EXECUTE v4_statement;
        DEALLOCATE PREPARE v4_statement;
    END IF;
END$$

CREATE PROCEDURE v4_add_constraint(IN p_table VARCHAR(64), IN p_name VARCHAR(64), IN p_definition TEXT)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = DATABASE() AND table_name = p_table AND constraint_name = p_name
    ) THEN
        SET @v4_ddl = CONCAT('ALTER TABLE `', p_table, '` ADD CONSTRAINT `', p_name, '` ', p_definition);
        PREPARE v4_statement FROM @v4_ddl;
        EXECUTE v4_statement;
        DEALLOCATE PREPARE v4_statement;
    END IF;
END$$

CREATE PROCEDURE v4_prepare_refunds()
BEGIN
    DECLARE legacy_amount_exists BOOLEAN;
    SET legacy_amount_exists = EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'refund' AND column_name = 'amount'
    );

    IF legacy_amount_exists THEN
        IF EXISTS (
            SELECT 1 FROM refund
            WHERE amount IS NULL OR amount <= 0 OR amount > 9999999999 OR amount <> FLOOR(amount)
                OR (amount_vnd IS NOT NULL AND amount_vnd <> amount)
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'V4: review legacy refund amounts; positive whole VND required';
        END IF;
    ELSEIF EXISTS (
        SELECT 1 FROM refund WHERE amount_vnd IS NULL OR amount_vnd <= 0 OR amount_vnd > 9999999999
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'V4: refund amount_vnd must be positive whole VND';
    END IF;

    IF EXISTS (SELECT 1 FROM refund r LEFT JOIN orders o ON o.id = r.order_id WHERE o.id IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'V4: refunds must reference an existing order';
    END IF;
    IF EXISTS (
        SELECT 1 FROM refund r LEFT JOIN payment_attempt p ON p.id = r.payment_attempt_id
        WHERE r.payment_attempt_id IS NOT NULL AND (p.id IS NULL OR p.order_id <> r.order_id)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'V4: refund payment attempt must belong to the same order';
    END IF;
    IF EXISTS (SELECT 1 FROM refund WHERE version < 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'V4: invalid refund version';
    END IF;

    IF legacy_amount_exists THEN
        UPDATE refund SET legacy_status = COALESCE(legacy_status, status),
            amount_vnd = COALESCE(amount_vnd, CAST(amount AS SIGNED));
    END IF;
    UPDATE refund SET legacy_status = status
    WHERE legacy_status IS NULL
        AND status NOT IN ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'NEEDS_REVIEW');
    UPDATE refund SET status = CASE
        WHEN status = 'PENDING' THEN 'REQUESTED'
        WHEN status = 'REFUNDED' THEN 'SUCCEEDED'
        WHEN status = 'CANCELLED' THEN 'REJECTED'
        WHEN status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'NEEDS_REVIEW') THEN status
        ELSE 'NEEDS_REVIEW'
    END, version = COALESCE(version, 0);

    IF legacy_amount_exists THEN
        ALTER TABLE refund DROP COLUMN amount;
    END IF;
END$$

DELIMITER ;

CALL v4_add_column('orders', 'cancelled_at', 'DATETIME(6) NULL');
CALL v4_add_column('orders', 'cancelled_by', 'VARCHAR(255) NULL');
CALL v4_add_column('orders', 'cancellation_note', 'VARCHAR(500) NULL');
CALL v4_add_column('orders', 'stock_restored_at', 'DATETIME(6) NULL');

CALL v4_add_column('refund', 'amount_vnd', 'BIGINT NULL');
CALL v4_add_column('refund', 'payment_attempt_id', 'BIGINT NULL');
CALL v4_add_column('refund', 'request_key', 'VARCHAR(80) NULL');
CALL v4_add_column('refund', 'requested_by', 'VARCHAR(255) NULL');
CALL v4_add_column('refund', 'approved_by', 'VARCHAR(255) NULL');
CALL v4_add_column('refund', 'approved_at', 'DATETIME(6) NULL');
CALL v4_add_column('refund', 'provider_request_id', 'VARCHAR(32) NULL');
CALL v4_add_column('refund', 'provider_requested_at', 'DATETIME(6) NULL');
CALL v4_add_column('refund', 'provider_response_id', 'VARCHAR(32) NULL');
CALL v4_add_column('refund', 'provider_transaction_no', 'VARCHAR(15) NULL');
CALL v4_add_column('refund', 'provider_response_code', 'VARCHAR(2) NULL');
CALL v4_add_column('refund', 'provider_transaction_status', 'VARCHAR(2) NULL');
CALL v4_add_column('refund', 'processed_by', 'VARCHAR(255) NULL');
CALL v4_add_column('refund', 'last_error', 'VARCHAR(500) NULL');
CALL v4_add_column('refund', 'legacy_status', 'VARCHAR(32) NULL');
CALL v4_add_column('refund', 'version', 'BIGINT NOT NULL DEFAULT 0');

ALTER TABLE refund MODIFY COLUMN status VARCHAR(32) NULL;
CALL v4_prepare_refunds();
ALTER TABLE refund
    MODIFY COLUMN status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'REQUESTED',
    MODIFY COLUMN amount_vnd BIGINT NOT NULL,
    MODIFY COLUMN request_key VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL,
    MODIFY COLUMN provider_request_id VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL,
    MODIFY COLUMN version BIGINT NOT NULL DEFAULT 0;

CALL v4_add_index('payment_attempt', 'uk_payment_attempt_order', 'id, order_id', TRUE);
CALL v4_add_index('refund', 'uk_refund_request', 'order_id, request_key', TRUE);
CALL v4_add_index('refund', 'uk_refund_provider_request', 'provider_request_id', TRUE);
CALL v4_add_index('refund', 'ix_refund_queue', 'status, id', FALSE);
CALL v4_add_index('refund', 'ix_refund_payment_attempt', 'payment_attempt_id, order_id, id', FALSE);

CALL v4_add_constraint('refund', 'fk_refund_payment_order',
    'FOREIGN KEY (payment_attempt_id, order_id) REFERENCES payment_attempt (id, order_id)');
CALL v4_add_constraint('refund', 'ck_refund_order', 'CHECK (order_id IS NOT NULL)');
CALL v4_add_constraint('refund', 'ck_refund_amount_vnd',
    'CHECK (amount_vnd > 0 AND amount_vnd <= 9999999999)');
CALL v4_add_constraint('refund', 'ck_refund_status',
    'CHECK (status IN (''REQUESTED'', ''APPROVED'', ''REJECTED'', ''PROCESSING'', ''SUCCEEDED'', ''FAILED'', ''NEEDS_REVIEW''))');
CALL v4_add_constraint('refund', 'ck_refund_provider_payment',
    'CHECK (provider_request_id IS NULL OR payment_attempt_id IS NOT NULL)');
CALL v4_add_constraint('refund', 'ck_refund_version', 'CHECK (version >= 0)');

DROP PROCEDURE v4_prepare_refunds;
DROP PROCEDURE v4_add_column;
DROP PROCEDURE v4_add_index;
DROP PROCEDURE v4_add_constraint;
SET @v4_ddl = NULL;

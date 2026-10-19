package db.migration;

import org.flywaydb.core.api.migration.*;
import java.sql.*;
import java.util.*;

/** Works both after the project's Hibernate update and against an existing MySQL schema. */
public class V3__VnpayPayments extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        Connection db = context.getConnection();
        addColumn(db, "orders", "payable_amount_vnd", "BIGINT NULL");
        addColumn(db, "orders", "payment_status", "VARCHAR(32) NULL DEFAULT 'PENDING'");
        addColumn(db, "orders", "reservation_expires_at", "TIMESTAMP(6) NULL");
        addColumn(db, "orders", "stock_held", "BOOLEAN NOT NULL DEFAULT FALSE");
        addColumn(db, "orders", "paid_attempt_id", "BIGINT NULL");
        addColumn(db, "orders", "checkout_key", "VARCHAR(80) NULL");
        addColumn(db, "orders", "checkout_fingerprint", "VARCHAR(64) NULL");
        execute(db, "ALTER TABLE orders MODIFY COLUMN status VARCHAR(32) NOT NULL");
        execute(db, "ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(32) NULL DEFAULT 'PENDING'");
        execute(db, "UPDATE orders SET payment_status = 'PENDING' WHERE payment_status IS NULL");
        // Existing orders are not silently turned into payable VNPay orders or stock reservations.
        execute(db, "CREATE TABLE IF NOT EXISTS payment_attempt (id BIGINT AUTO_INCREMENT PRIMARY KEY, order_id BIGINT NOT NULL, provider VARCHAR(16) NOT NULL, merchant_code VARCHAR(8) NOT NULL, txn_ref VARCHAR(100) NOT NULL, amount_vnd BIGINT NOT NULL, currency VARCHAR(3) NOT NULL, status VARCHAR(32) NOT NULL, created_at TIMESTAMP(6) NOT NULL, expires_at TIMESTAMP(6) NOT NULL, payment_url TEXT NOT NULL, received_at TIMESTAMP(6) NULL, transaction_no VARCHAR(15), receipt_no VARCHAR(15), bank_code VARCHAR(20), response_code VARCHAR(2), provider_transaction_status VARCHAR(2), pay_date VARCHAR(14), callback_fingerprint VARCHAR(64))");
        execute(db, "CREATE TABLE IF NOT EXISTS payment_event (id BIGINT AUTO_INCREMENT PRIMARY KEY, event_key VARCHAR(180) NOT NULL, order_id BIGINT NOT NULL, attempt_id BIGINT NULL, type VARCHAR(40) NOT NULL, status VARCHAR(32) NOT NULL, created_at TIMESTAMP(6) NOT NULL, resolved_at TIMESTAMP(6) NULL, resolution_note VARCHAR(500), resolved_by VARCHAR(255))");
        execute(db, "CREATE TABLE IF NOT EXISTS payment_notification (id BIGINT AUTO_INCREMENT PRIMARY KEY, event_id BIGINT NOT NULL, order_id BIGINT NOT NULL, created_at TIMESTAMP(6) NOT NULL)");
        execute(db, "CREATE TABLE IF NOT EXISTS payment_retry_key (id BIGINT AUTO_INCREMENT PRIMARY KEY, order_id BIGINT NOT NULL, request_key VARCHAR(80) NOT NULL, attempt_id BIGINT NOT NULL)");
        // VNPay references and opaque client keys are case-sensitive.
        execute(db, "ALTER TABLE payment_attempt MODIFY txn_ref VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL");
        execute(db, "ALTER TABLE orders MODIFY checkout_key VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL");
        execute(db, "ALTER TABLE payment_retry_key MODIFY request_key VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL");
        index(db, "orders", "uk_order_checkout", "user_id, checkout_key", true);
        index(db, "payment_attempt", "uk_payment_ref", "txn_ref", true);
        index(db, "payment_attempt", "uk_payment_receipt", "merchant_code, receipt_no", true);
        index(db, "payment_event", "uk_payment_event", "event_key", true);
        index(db, "payment_notification", "uk_payment_notice", "event_id", true);
        index(db, "payment_retry_key", "uk_payment_retry", "order_id, request_key", true);
        index(db, "orders", "ix_payment_timeout", "status, reservation_expires_at", false);
        index(db, "payment_attempt", "ix_payment_order", "order_id, id", false);
        index(db, "payment_attempt", "ix_payment_timeout", "status, expires_at", false);
        index(db, "payment_event", "ix_payment_event_queue", "status, id", false);
        foreignKey(db, "payment_attempt", "fk_payment_order", "order_id", "orders");
        foreignKey(db, "payment_event", "fk_event_order", "order_id", "orders");
        foreignKey(db, "payment_event", "fk_event_attempt", "attempt_id", "payment_attempt");
        foreignKey(db, "payment_notification", "fk_notice_event", "event_id", "payment_event");
        foreignKey(db, "payment_retry_key", "fk_retry_order", "order_id", "orders");
        foreignKey(db, "payment_retry_key", "fk_retry_attempt", "attempt_id", "payment_attempt");
    }
    private void addColumn(Connection db, String table, String column, String definition) throws SQLException {
        try (ResultSet rs = db.getMetaData().getColumns(db.getCatalog(), null, table, column)) {
            if (!rs.next()) execute(db, "ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
        }
    }
    private void index(Connection db, String table, String name, String columns, boolean unique) throws SQLException {
        try (ResultSet rs = db.getMetaData().getIndexInfo(db.getCatalog(), null, table, false, false)) {
            while (rs.next()) if (name.equalsIgnoreCase(rs.getString("INDEX_NAME"))) return;
        }
        execute(db, "CREATE " + (unique ? "UNIQUE " : "") + "INDEX " + name + " ON " + table + " (" + columns + ")");
    }
    private void foreignKey(Connection db, String table, String name, String column, String target) throws SQLException {
        try (ResultSet rs = db.getMetaData().getImportedKeys(db.getCatalog(), null, table)) {
            while (rs.next()) if (name.equalsIgnoreCase(rs.getString("FK_NAME"))) return;
        }
        execute(db, "ALTER TABLE " + table + " ADD CONSTRAINT " + name + " FOREIGN KEY (" + column + ") REFERENCES " + target + " (id)");
    }
    private void execute(Connection db, String sql) throws SQLException {
        try (Statement statement = db.createStatement()) { statement.execute(sql); }
    }
}

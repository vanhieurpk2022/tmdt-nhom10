SET @add_ingredient = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'product_custom_item' AND column_name = 'ingredient_mil_id') = 0, 'ALTER TABLE product_custom_item ADD COLUMN ingredient_mil_id BIGINT NULL', 'SELECT 1');
PREPARE ingredient_statement FROM @add_ingredient;
EXECUTE ingredient_statement;
DEALLOCATE PREPARE ingredient_statement;
CREATE TABLE IF NOT EXISTS inventory_allocation (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_mil_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_allocation_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_allocation_variant FOREIGN KEY (product_mil_id) REFERENCES product_mil(id)
);
UPDATE orders SET payment_status = 'PAID' WHERE payment_method = 'COD' AND status = 'DELIVERED' AND payment_status = 'PENDING';

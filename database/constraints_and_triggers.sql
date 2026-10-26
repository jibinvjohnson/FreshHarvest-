
CREATE OR REPLACE FUNCTION fn_audit_harvest_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO HARVEST_AUDIT (harvest_id, action_type, new_value, reason)
        VALUES (
            NEW.harvest_id, 
            'HARVEST_RECORDED', 
            jsonb_build_object('quantity', NEW.quantity, 'grade', NEW.quality_grade, 'date', NEW.harvest_date),
            'Initial batch recording from field'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.available_quantity <> NEW.available_quantity) THEN
            INSERT INTO HARVEST_AUDIT (harvest_id, action_type, previous_value, new_value, reason)
            VALUES (
                NEW.harvest_id,
                'QUANTITY_ADJUSTED',
                jsonb_build_object('available_quantity', OLD.available_quantity, 'status', OLD.status),
                jsonb_build_object('available_quantity', NEW.available_quantity, 'status', NEW.status),
                'Stock level modified by transaction'
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Bind harvest audit function to HARVEST_BATCH
DROP TRIGGER IF EXISTS trg_audit_harvest ON HARVEST_BATCH;
CREATE TRIGGER trg_audit_harvest
AFTER INSERT OR UPDATE ON HARVEST_BATCH
FOR EACH ROW
EXECUTE FUNCTION fn_audit_harvest_changes();

-- Function: Automatically update order total amount when order items change
CREATE OR REPLACE FUNCTION fn_update_order_total()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id UUID;
    v_total NUMERIC(10, 2);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_order_id := OLD.order_id;
    ELSE
        v_order_id := NEW.order_id;
    END IF;

    SELECT COALESCE(SUM(subtotal), 0) INTO v_total
    FROM ORDER_ITEM
    WHERE order_id = v_order_id;

    UPDATE ORDERS
    SET total_amount = v_total
    WHERE order_id = v_order_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Bind order total calculation to ORDER_ITEM
DROP TRIGGER IF EXISTS trg_update_order_total ON ORDER_ITEM;
CREATE TRIGGER trg_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON ORDER_ITEM
FOR EACH ROW
EXECUTE FUNCTION fn_update_order_total();

-- Function: Guard check to prevent over-allocation at the database level
CREATE OR REPLACE FUNCTION fn_check_allocation_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_available NUMERIC(10, 2);
BEGIN
    SELECT available_quantity INTO v_available
    FROM HARVEST_BATCH
    WHERE harvest_id = NEW.harvest_id;

    IF (v_available < NEW.allocated_quantity) THEN
        RAISE EXCEPTION 'Allocation violation: requested quantity (%) exceeds available harvest stock (%)',
            NEW.allocated_quantity, v_available;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Bind allocation limit guard
DROP TRIGGER IF EXISTS trg_guard_allocation ON ALLOCATION;
CREATE TRIGGER trg_guard_allocation
BEFORE INSERT ON ALLOCATION
FOR EACH ROW
EXECUTE FUNCTION fn_check_allocation_limit();

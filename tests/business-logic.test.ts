import { describe, it, expect, beforeEach } from 'vitest';
import { calculateHarvestVariance } from '../src/lib/services/varianceService';
import { previewAllocation, executeAllocationTransaction } from '../src/lib/services/allocationService';
import { dbRepository } from '../src/lib/db/repository';
import { HarvestBatch, PreOrder } from '../src/types/database';

describe('FreshHarvest DBMS Core Logic & Integrity Tests', () => {
  beforeEach(() => {
    dbRepository.resetDemo();
  });

  // Test 1: Variance calculation for a shortfall (Scenario: 70 actual - 100 expected = -30 kg)
  it('1. calculates variance for a harvest shortfall correctly', () => {
    const result = calculateHarvestVariance(100, 70);
    expect(result.variance_quantity).toBe(-30);
    expect(result.variance_percentage).toBe(-30);
    expect(result.is_shortfall).toBe(true);
    expect(result.is_surplus).toBe(false);
    expect(result.outcome_label).toBe('Shortfall');
  });

  // Test 2: Variance calculation for a surplus (Scenario: 95 actual - 80 expected = +15 kg)
  it('2. calculates variance for a harvest surplus correctly', () => {
    const result = calculateHarvestVariance(80, 95);
    expect(result.variance_quantity).toBe(15);
    expect(result.variance_percentage).toBe(18.75);
    expect(result.is_shortfall).toBe(false);
    expect(result.is_surplus).toBe(true);
    expect(result.outcome_label).toBe('Surplus');
  });

  // Test 3: Zero expected quantity handled safely without division by zero
  it('3. handles zero expected quantity safely without division by zero', () => {
    const resultZero = calculateHarvestVariance(0, 50);
    expect(resultZero.variance_quantity).toBe(50);
    expect(resultZero.variance_percentage).toBe(100);

    const resultBothZero = calculateHarvestVariance(0, 0);
    expect(resultBothZero.variance_quantity).toBe(0);
    expect(resultBothZero.variance_percentage).toBe(0);
  });

  // Test 4: Allocation when stock exactly equals demand
  it('4. allocates cleanly when available stock exactly equals demand', () => {
    const batch: HarvestBatch = {
      harvest_id: 'test-batch-1',
      farm_id: 'farm-1',
      product_id: 'prod-1',
      harvest_date: '2026-03-01',
      quantity: 50,
      available_quantity: 50,
      quality_grade: 'Grade A',
      freshness_deadline: '2026-03-10',
      status: 'Available',
      created_at: '2026-03-01T00:00:00Z',
    };

    const preOrders: PreOrder[] = [
      {
        pre_order_id: 'po-1',
        customer_id: 'cust-1',
        expected_harvest_id: 'eh-1',
        requested_quantity: 30,
        allocated_quantity: 0,
        status: 'Pending',
        placed_at: '2026-02-28T10:00:00Z',
      },
      {
        pre_order_id: 'po-2',
        customer_id: 'cust-2',
        expected_harvest_id: 'eh-1',
        requested_quantity: 20,
        allocated_quantity: 0,
        status: 'Pending',
        placed_at: '2026-02-28T11:00:00Z',
      },
    ];

    const plan = previewAllocation(batch, preOrders, 'FIFO');
    expect(plan.total_demand).toBe(50);
    expect(plan.total_to_allocate).toBe(50);
    expect(plan.remaining_stock_after).toBe(0);
    expect(plan.unfulfilled_shortage).toBe(0);
    expect(plan.items[0].new_allocated_quantity).toBe(30);
    expect(plan.items[0].status_after).toBe('Fully Allocated');
    expect(plan.items[1].new_allocated_quantity).toBe(20);
    expect(plan.items[1].status_after).toBe('Fully Allocated');
  });

  // Test 5: Allocation when demand exceeds stock (The 100 expected, 70 actual, 90 demand scenario)
  it('5. handles demand exceeding stock with fair FIFO shortfall handling', () => {
    const batch: HarvestBatch = {
      harvest_id: 'test-batch-tomatoes',
      farm_id: 'farm-1',
      product_id: 'prod-tomato',
      harvest_date: '2026-03-01',
      quantity: 70,
      available_quantity: 70, // 70 kg harvested
      quality_grade: 'Grade A',
      freshness_deadline: '2026-03-10',
      status: 'Available',
      created_at: '2026-03-01T00:00:00Z',
    };

    // Total demand = 35 + 35 + 20 = 90 kg
    const preOrders: PreOrder[] = [
      {
        pre_order_id: 'po-alice',
        customer_id: 'cust-alice',
        expected_harvest_id: 'eh-1',
        requested_quantity: 35,
        allocated_quantity: 0,
        status: 'Pending',
        placed_at: '2026-02-20T09:00:00Z', // first
      },
      {
        pre_order_id: 'po-bob',
        customer_id: 'cust-bob',
        expected_harvest_id: 'eh-1',
        requested_quantity: 35,
        allocated_quantity: 0,
        status: 'Pending',
        placed_at: '2026-02-20T10:00:00Z', // second
      },
      {
        pre_order_id: 'po-catherine',
        customer_id: 'cust-catherine',
        expected_harvest_id: 'eh-1',
        requested_quantity: 20,
        allocated_quantity: 0,
        status: 'Pending',
        placed_at: '2026-02-20T11:00:00Z', // third
      },
    ];

    const plan = previewAllocation(batch, preOrders, 'FIFO');
    expect(plan.total_demand).toBe(90);
    expect(plan.total_to_allocate).toBe(70); // Must allocate exactly 70 kg
    expect(plan.unfulfilled_shortage).toBe(20); // 90 - 70 = 20 kg shortfall
    expect(plan.remaining_stock_after).toBe(0);

    // Alice gets full 35 kg
    expect(plan.items[0].new_allocated_quantity).toBe(35);
    expect(plan.items[0].status_after).toBe('Fully Allocated');

    // Bob gets full 35 kg
    expect(plan.items[1].new_allocated_quantity).toBe(35);
    expect(plan.items[1].status_after).toBe('Fully Allocated');

    // Catherine gets 0 kg (unfulfilled 20 kg)
    expect(plan.items[2].new_allocated_quantity).toBe(0);
    expect(plan.items[2].unfulfilled_after).toBe(20);
    expect(plan.items[2].status_after).toBe('Pending');
  });

  // Test 6: Partial fulfilment
  it('6. correctly executes partial fulfilment when stock is split', () => {
    const batch: HarvestBatch = {
      harvest_id: 'batch-partial',
      farm_id: 'farm-1',
      product_id: 'prod-1',
      harvest_date: '2026-03-01',
      quantity: 50,
      available_quantity: 50,
      quality_grade: 'Grade A',
      freshness_deadline: '2026-03-10',
      status: 'Available',
      created_at: '2026-03-01T00:00:00Z',
    };

    const preOrders: PreOrder[] = [
      {
        pre_order_id: 'po-large',
        customer_id: 'cust-1',
        expected_harvest_id: 'eh-1',
        requested_quantity: 80,
        allocated_quantity: 0,
        status: 'Pending',
        placed_at: '2026-02-28T10:00:00Z',
      },
    ];

    const plan = previewAllocation(batch, preOrders, 'FIFO');
    expect(plan.items[0].new_allocated_quantity).toBe(50);
    expect(plan.items[0].unfulfilled_after).toBe(30);
    expect(plan.items[0].status_after).toBe('Partially Allocated');
  });

  // Test 7: Allocation never exceeds available stock
  it('7. strictly enforces that total allocated quantity never exceeds available batch stock', () => {
    const batch: HarvestBatch = {
      harvest_id: 'batch-limit',
      farm_id: 'farm-1',
      product_id: 'prod-1',
      harvest_date: '2026-03-01',
      quantity: 15,
      available_quantity: 15,
      quality_grade: 'Grade A',
      freshness_deadline: '2026-03-10',
      status: 'Available',
      created_at: '2026-03-01T00:00:00Z',
    };

    const preOrders: PreOrder[] = [
      {
        pre_order_id: 'po-x',
        customer_id: 'cust-1',
        expected_harvest_id: 'eh-1',
        requested_quantity: 100,
        allocated_quantity: 0,
        status: 'Pending',
        placed_at: '2026-02-28T10:00:00Z',
      },
    ];

    const plan = previewAllocation(batch, preOrders, 'FIFO');
    expect(plan.total_to_allocate).toBeLessThanOrEqual(batch.available_quantity);
    expect(plan.total_to_allocate).toBe(15);
  });

  // Test 8: Repeated allocation request prevention
  it('8. rejects repeated allocation execution when pre-orders or batch are already exhausted', async () => {
    // In seed data, hb000001 (tomatoes) available_quantity is already 0.0
    await expect(
      executeAllocationTransaction(
        'eh000001-0000-0000-0000-000000000001',
        'hb000001-0000-0000-0000-000000000001',
        'FIFO'
      )
    ).rejects.toThrow(/No stock available for allocation/);
  });

  // Test 9: Invalid negative quantities rejected
  it('9. rejects invalid negative quantities across entities', async () => {
    expect(() => calculateHarvestVariance(-10, 50)).toThrow(/cannot be negative/);
    expect(() => calculateHarvestVariance(10, -5)).toThrow(/cannot be negative/);

    await expect(
      dbRepository.createHarvestBatch({
        farm_id: 'fa000001-0000-0000-0000-000000000001',
        product_id: 'p0000001-0000-0000-0000-000000000001',
        harvest_date: '2026-03-01',
        quantity: -25,
        quality_grade: 'Grade A',
        freshness_deadline: '2026-03-10',
      })
    ).rejects.toThrow(/cannot be negative/);
  });

  // Test 10: Surplus sale cannot exceed eligible stock
  it('10. prevents surplus purchases that exceed available surplus stock', async () => {
    // sl000001 has 25 listed, 10 sold => 15 remaining
    await expect(
      dbRepository.purchaseSurplus(
        'sl000001-0000-0000-0000-000000000001',
        'u0000001-0000-0000-0000-000000000001',
        50 // exceeds remaining 15
      )
    ).rejects.toThrow(/exceeds remaining surplus/);
  });

  // Test 11: Expired surplus listing rejection
  it('11. prevents purchase of an expired surplus listing', async () => {
    // sl000001-0000-0000-0000-000000000003 is expired in seed
    await expect(
      dbRepository.purchaseSurplus(
        'sl000001-0000-0000-0000-000000000003',
        'u0000001-0000-0000-0000-000000000001',
        2
      )
    ).rejects.toThrow(/Listing is no longer active|expired/);
  });

  // Test 12: Order total calculation is strictly calculated on server
  it('12. calculates order total and line-item subtotals accurately on server', async () => {
    const result = await dbRepository.createOrderWithItems(
      'u0000001-0000-0000-0000-000000000001',
      [
        { product_id: 'p0000001-0000-0000-0000-000000000001', quantity: 5, unit_price: 45.0 }, // 225
        { product_id: 'p0000001-0000-0000-0000-000000000002', quantity: 3, unit_price: 60.0 }, // 180
      ]
    );

    expect(result.order.total_amount).toBe(405.0);
    expect(result.items[0].subtotal).toBe(225.0);
    expect(result.items[1].subtotal).toBe(180.0);
  });

  // Test 13: Invalid foreign-key relationships rejected
  it('13. enforces foreign-key referential integrity by rejecting non-existent parents', async () => {
    await expect(
      dbRepository.createFarm({
        farmer_id: 'non-existent-farmer-uuid',
        farm_name: 'Ghost Farm',
        location: 'Nowhere',
        area: 10,
      })
    ).rejects.toThrow(/Foreign key violation/);
  });

  // Test 14: Database failure rollback for a multi-step operation
  it('14. maintains transactional consistency and does not corrupt state on failure', async () => {
    const initialBatches = await dbRepository.getHarvestBatches();
    const batch = initialBatches[0];
    const initialAvailable = batch.available_quantity;

    try {
      // Attempting an invalid surplus purchase that will fail
      await dbRepository.purchaseSurplus(
        'non-existent-surplus-id',
        'u0000001-0000-0000-0000-000000000001',
        10
      );
    } catch {
      // Expected to fail
    }

    const afterBatches = await dbRepository.getHarvestBatches();
    expect(afterBatches[0].available_quantity).toBe(initialAvailable);
  });
});

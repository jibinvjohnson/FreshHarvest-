import { PreOrder, HarvestBatch, Allocation, HarvestAudit } from '@/types/database';
import { dbRepository } from '@/lib/db/repository';

export type AllocationPolicy = 'FIFO' | 'PROPORTIONAL';

export interface PreOrderAllocationPlanItem {
  pre_order_id: string;
  customer_id: string;
  customer_name?: string;
  requested_quantity: number;
  previously_allocated: number;
  unfulfilled_before: number;
  new_allocated_quantity: number;
  total_allocated_after: number;
  unfulfilled_after: number;
  status_after: PreOrder['status'];
  placed_at: string;
}

export interface AllocationPlan {
  harvest_id: string;
  expected_harvest_id: string;
  available_stock_before: number;
  total_demand: number;
  total_to_allocate: number;
  remaining_stock_after: number;
  unfulfilled_shortage: number;
  policy: AllocationPolicy;
  items: PreOrderAllocationPlanItem[];
}

/**
 * Computes an allocation preview without modifying the database.
 */
export function previewAllocation(
  batch: HarvestBatch,
  preOrders: PreOrder[],
  policy: AllocationPolicy = 'FIFO'
): AllocationPlan {
  const availableStock = batch.available_quantity;

  // Filter valid candidate pre-orders: must be pending or partially allocated with unmet demand
  const candidates = preOrders
    .filter((po) => po.status !== 'Cancelled' && po.status !== 'Fulfilled')
    .map((po) => ({
      ...po,
      unmetDemand: po.requested_quantity - po.allocated_quantity,
    }))
    .filter((po) => po.unmetDemand > 0);

  const totalDemand = candidates.reduce((sum, po) => sum + po.unmetDemand, 0);

  let remainingStock = availableStock;
  const items: PreOrderAllocationPlanItem[] = [];

  if (policy === 'FIFO') {
    // Sort chronologically by placed_at (Earliest first)
    candidates.sort((a, b) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime());

    for (const po of candidates) {
      const grant = Math.min(po.unmetDemand, Math.max(0, remainingStock));
      const roundedGrant = Number(grant.toFixed(2));
      remainingStock = Number((remainingStock - roundedGrant).toFixed(2));

      const totalAfter = Number((po.allocated_quantity + roundedGrant).toFixed(2));
      const unfulfilledAfter = Number((po.requested_quantity - totalAfter).toFixed(2));

      let statusAfter: PreOrder['status'] = 'Pending';
      if (totalAfter >= po.requested_quantity) {
        statusAfter = 'Fully Allocated';
      } else if (totalAfter > 0) {
        statusAfter = 'Partially Allocated';
      }

      items.push({
        pre_order_id: po.pre_order_id,
        customer_id: po.customer_id,
        requested_quantity: po.requested_quantity,
        previously_allocated: po.allocated_quantity,
        unfulfilled_before: po.unmetDemand,
        new_allocated_quantity: roundedGrant,
        total_allocated_after: totalAfter,
        unfulfilled_after: unfulfilledAfter,
        status_after: statusAfter,
        placed_at: po.placed_at,
      });
    }
  } else {
    // PROPORTIONAL POLICY: Fair Share
    // Grant proportional to demand: min(demand, stock * (demand / totalDemand))
    for (const po of candidates) {
      let grant = 0;
      if (availableStock >= totalDemand) {
        grant = po.unmetDemand;
      } else {
        const ratio = po.unmetDemand / totalDemand;
        grant = Math.min(po.unmetDemand, availableStock * ratio);
      }
      const roundedGrant = Number(grant.toFixed(2));
      const totalAfter = Number((po.allocated_quantity + roundedGrant).toFixed(2));
      const unfulfilledAfter = Number((po.requested_quantity - totalAfter).toFixed(2));

      let statusAfter: PreOrder['status'] = 'Pending';
      if (totalAfter >= po.requested_quantity) {
        statusAfter = 'Fully Allocated';
      } else if (totalAfter > 0) {
        statusAfter = 'Partially Allocated';
      }

      items.push({
        pre_order_id: po.pre_order_id,
        customer_id: po.customer_id,
        requested_quantity: po.requested_quantity,
        previously_allocated: po.allocated_quantity,
        unfulfilled_before: po.unmetDemand,
        new_allocated_quantity: roundedGrant,
        total_allocated_after: totalAfter,
        unfulfilled_after: unfulfilledAfter,
        status_after: statusAfter,
        placed_at: po.placed_at,
      });
    }

    const allocatedSum = items.reduce((s, it) => s + it.new_allocated_quantity, 0);
    remainingStock = Math.max(0, Number((availableStock - allocatedSum).toFixed(2)));
  }

  const totalAllocated = items.reduce((sum, it) => sum + it.new_allocated_quantity, 0);
  const unfulfilledShortage = Math.max(0, Number((totalDemand - totalAllocated).toFixed(2)));

  return {
    harvest_id: batch.harvest_id,
    expected_harvest_id: candidates[0]?.expected_harvest_id || '',
    available_stock_before: availableStock,
    total_demand: Number(totalDemand.toFixed(2)),
    total_to_allocate: Number(totalAllocated.toFixed(2)),
    remaining_stock_after: Math.max(0, remainingStock),
    unfulfilled_shortage: unfulfilledShortage,
    policy,
    items,
  };
}

/**
 * Executes fair pre-order allocation in a safe, atomic, transactional routine.
 * Guarantees that Total Allocated never exceeds Available Stock.
 */
export async function executeAllocationTransaction(
  expectedHarvestId: string,
  harvestId: string,
  policy: AllocationPolicy = 'FIFO'
): Promise<{
  plan: AllocationPlan;
  createdAllocations: Allocation[];
}> {
  const store = dbRepository._getInternalStore();

  // Find harvest batch
  const batch = store.harvestBatches.find((hb) => hb.harvest_id === harvestId);
  if (!batch) throw new Error('Target harvest batch not found');

  if (batch.available_quantity <= 0) {
    throw new Error('No stock available for allocation in this harvest batch.');
  }

  // Pre-orders for this commitment
  const preOrders = store.preOrders.filter((po) => po.expected_harvest_id === expectedHarvestId);
  if (preOrders.length === 0) {
    throw new Error('No pre-orders found for the specified expected harvest.');
  }

  // Generate allocation plan
  const plan = previewAllocation(batch, preOrders, policy);

  if (plan.total_to_allocate <= 0) {
    throw new Error('No unallocated pre-orders or demand to satisfy.');
  }

  // CRITICAL INVARIANT ASSERTION: Total allocation must NOT exceed available batch stock
  if (plan.total_to_allocate > batch.available_quantity) {
    throw new Error(
      `CRITICAL INVARIANT VIOLATION: Planned allocation (${plan.total_to_allocate}) exceeds available stock (${batch.available_quantity})`
    );
  }

  const createdAllocations: Allocation[] = [];
  const now = new Date().toISOString();

  // ATOMIC MUTATIONS: Apply allocation changes
  for (const item of plan.items) {
    if (item.new_allocated_quantity > 0) {
      // 1. Create Allocation record
      const allocation: Allocation = {
        allocation_id: crypto.randomUUID(),
        pre_order_id: item.pre_order_id,
        harvest_id: batch.harvest_id,
        allocated_quantity: item.new_allocated_quantity,
        allocation_status: 'Confirmed',
        allocated_at: now,
      };
      store.allocations.push(allocation);
      createdAllocations.push(allocation);

      // 2. Update PreOrder
      const po = store.preOrders.find((p) => p.pre_order_id === item.pre_order_id);
      if (po) {
        po.allocated_quantity = item.total_allocated_after;
        po.status = item.status_after;
      }
    }
  }

  // 3. Deduct stock from Harvest Batch
  const previousAvailable = batch.available_quantity;
  batch.available_quantity = Number((batch.available_quantity - plan.total_to_allocate).toFixed(2));

  if (batch.available_quantity === 0) {
    batch.status = 'Fully Allocated';
  } else {
    batch.status = 'Partially Allocated';
  }

  // 4. Audit Log
  const audit: HarvestAudit = {
    audit_id: crypto.randomUUID(),
    harvest_id: batch.harvest_id,
    action_type: 'ALLOCATION_DEDUCTED',
    previous_value: { available_quantity: previousAvailable },
    new_value: {
      available_quantity: batch.available_quantity,
      allocated_in_run: plan.total_to_allocate,
      policy,
      allocations_count: createdAllocations.length,
    },
    reason: `Fair pre-order allocation executed (${policy}). Shortfall: ${plan.unfulfilled_shortage}kg.`,
    created_at: now,
  };
  store.audits.unshift(audit);

  return { plan, createdAllocations };
}

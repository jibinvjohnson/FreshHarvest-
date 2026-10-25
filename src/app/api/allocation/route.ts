import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { previewAllocation, executeAllocationTransaction, AllocationPolicy } from '@/lib/services/allocationService';
import { AllocationExecutionSchema } from '@/lib/validation/schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const expectedHarvestId = searchParams.get('expected_harvest_id');
    const harvestId = searchParams.get('harvest_id');
    const policy = (searchParams.get('policy') || 'FIFO') as AllocationPolicy;

    if (!harvestId || !expectedHarvestId) {
      return NextResponse.json({ error: 'expected_harvest_id and harvest_id are required' }, { status: 400 });
    }

    const batches = await dbRepository.getHarvestBatches();
    const batch = batches.find((hb) => hb.harvest_id === harvestId);
    if (!batch) {
      return NextResponse.json({ error: 'Harvest batch not found' }, { status: 404 });
    }

    const preOrders = (await dbRepository.getPreOrders()).filter(
      (po) => po.expected_harvest_id === expectedHarvestId
    );

    const customers = await dbRepository.getCustomers();
    const plan = previewAllocation(batch, preOrders, policy);

    // Enrich with customer names
    plan.items.forEach((it) => {
      const cust = customers.find((c) => c.customer_id === it.customer_id);
      it.customer_name = cust ? cust.full_name : 'Customer';
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = AllocationExecutionSchema.parse(body);

    const result = await executeAllocationTransaction(
      validated.expected_harvest_id,
      validated.harvest_id,
      validated.policy
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Allocation execution failed' }, { status: 400 });
  }
}

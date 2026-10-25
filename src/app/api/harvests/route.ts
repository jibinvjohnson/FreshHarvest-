import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { HarvestBatchSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const batches = await dbRepository.getHarvestBatches();
    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = HarvestBatchSchema.parse(body);
    const created = await dbRepository.createHarvestBatch(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

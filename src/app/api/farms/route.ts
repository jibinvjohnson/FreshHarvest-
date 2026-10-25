import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { FarmSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const farms = await dbRepository.getFarms();
    return NextResponse.json(farms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = FarmSchema.parse(body);
    const created = await dbRepository.createFarm(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

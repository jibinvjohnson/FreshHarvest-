import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { FarmerSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const farmers = await dbRepository.getFarmers();
    return NextResponse.json(farmers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = FarmerSchema.parse(body);
    const created = await dbRepository.createFarmer(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

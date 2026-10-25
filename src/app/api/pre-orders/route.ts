import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { PreOrderSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const preOrders = await dbRepository.getPreOrders();
    return NextResponse.json(preOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = PreOrderSchema.parse(body);
    const created = await dbRepository.createPreOrder(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

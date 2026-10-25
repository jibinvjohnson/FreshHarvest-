import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { OrderCreateSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const orders = await dbRepository.getOrders();
    const items = await dbRepository.getOrderItems();
    return NextResponse.json({ orders, items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = OrderCreateSchema.parse(body);
    const result = await dbRepository.createOrderWithItems(
      validated.customer_id,
      validated.items,
      validated.notes
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

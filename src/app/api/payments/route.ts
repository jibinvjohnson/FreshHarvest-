import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { PaymentCreateSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const payments = await dbRepository.getPayments();
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = PaymentCreateSchema.parse(body);
    const created = await dbRepository.recordPayment(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

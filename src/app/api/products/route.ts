import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { ProductSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const products = await dbRepository.getProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ProductSchema.parse(body);
    const created = await dbRepository.createProduct(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

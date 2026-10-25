import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { CategorySchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const categories = await dbRepository.getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CategorySchema.parse(body);
    const created = await dbRepository.createCategory(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

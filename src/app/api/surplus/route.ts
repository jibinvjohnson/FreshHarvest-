import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { SurplusListingSchema, SurplusPurchaseSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const listings = await dbRepository.getSurplusListings();
    return NextResponse.json(listings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = SurplusListingSchema.parse(body);
    const created = await dbRepository.createSurplusListing(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validated = SurplusPurchaseSchema.parse(body);
    const result = await dbRepository.purchaseSurplus(
      validated.surplus_id,
      validated.customer_id,
      validated.quantity
    );
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Surplus purchase failed' }, { status: 400 });
  }
}

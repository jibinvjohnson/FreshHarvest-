import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';

export async function GET() {
  try {
    const audits = await dbRepository.getHarvestAudits();
    return NextResponse.json(audits);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

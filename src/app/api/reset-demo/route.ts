import { NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';

export async function POST() {
  try {
    const res = dbRepository.resetDemo();
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { saveEvaluation } from '@/app/lib/storage';
import { Evaluation } from '@/app/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Evaluation;
    const saved = await saveEvaluation(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 });
  }
}
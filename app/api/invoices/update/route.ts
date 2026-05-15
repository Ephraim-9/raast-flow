import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { z } from 'zod';

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'reconciled', 'disputed']),
  warehouseBlocked: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.issues }, { status: 400 });
    }

    const { id, status, warehouseBlocked } = parsed.data;

    const docRef = db.collection('invoices').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await docRef.update({
      status,
      warehouseBlocked
    });

    return NextResponse.json({ id, status, warehouseBlocked }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

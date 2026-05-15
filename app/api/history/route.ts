import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    const wfRef = db.collection('workflow_executions')
                    .orderBy('createdAt', 'desc')
                    .limit(limit);
                    
    const wfSnap = await wfRef.get();

    const items = wfSnap.docs.map((doc: any) => {
      const data = doc.data();
      return {
        workflowId: doc.id,
        extractedReference: data.extractedReference,
        finalAction: data.finalAction,
        matchType: data.matchType,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({ items }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

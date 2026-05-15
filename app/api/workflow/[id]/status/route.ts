import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const wfRef = db.collection('workflow_executions').doc(id);
    const wfSnap = await wfRef.get();

    if (!wfSnap.exists) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const wfData = wfSnap.data();
    
    // Fetch traces
    const tracesRef = wfRef.collection('traces');
    const tracesSnap = await tracesRef.get();
    
    const agents = tracesSnap.docs.map((doc: any) => doc.data()).sort((a: any, b: any) => a.order - b.order);

    return NextResponse.json({
      workflowId: id,
      status: wfData?.status,
      currentStep: wfData?.currentStep,
      agents
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

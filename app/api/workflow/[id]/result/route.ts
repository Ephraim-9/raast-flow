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
    
    if (wfData?.status !== 'completed' && wfData?.status !== 'failed') {
      return NextResponse.json({ error: 'Workflow is still running' }, { status: 409 });
    }

    return NextResponse.json({
      workflowId: id,
      matchType: wfData?.matchType,
      recommendedAction: wfData?.recommendedAction,
      finalAction: wfData?.finalAction,
      actionId: wfData?.actionId,
      extractedAmount: wfData?.extractedAmount,
      extractedReference: wfData?.extractedReference,
      beforeState: wfData?.beforeState,
      afterState: wfData?.afterState,
      simulationLogs: wfData?.simulationLogs,
      whatsappPreview: wfData?.whatsappPreview,
      banner: wfData?.banner
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching result:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

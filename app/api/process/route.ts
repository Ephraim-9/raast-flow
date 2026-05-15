import { NextRequest, NextResponse } from 'next/server';
import { antigravityClient } from '@/lib/antigravity-client';

export async function POST(request: NextRequest) {
  try {
    let inputData: any = {};
    
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      inputData.inputType = formData.get('inputType') || 'image';
      const file = formData.get('file');
      if (file && file instanceof Blob) {
         // Convert to base64 or pass as is
         // inputData.imageBase64 = ... 
      }
    } else {
      inputData = await request.json();
    }

    if (!inputData.inputType) {
      return NextResponse.json({ error: 'inputType is required' }, { status: 400 });
    }

    const workflowId = await antigravityClient.startWorkflow(inputData);

    return NextResponse.json({ workflowId }, { status: 201 });
  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

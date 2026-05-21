import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { antigravityClient } from '@/lib/antigravity-client';
import { z } from 'zod';

const manualSchema = z.object({
  inputType: z.literal('manual'),
  manual: z.object({
    invoiceId: z.string().min(1, 'invoiceId is required'),
    amount: z.number().positive('amount must be positive'),
  }),
  skipParser: z.boolean().optional(),
});

const imageSchema = z.object({
  inputType: z.literal('image'),
  imageBase64: z.string().optional(),
  mimeType: z.string().optional(),
  text: z.string().optional(),
  skipParser: z.boolean().optional(),
}).refine(
  (data) => data.imageBase64 || data.text,
  { message: 'Either imageBase64 or text must be provided for image input' }
);

const textSchema = z.object({
  inputType: z.union([z.literal('whatsapp'), z.literal('text')]),
  text: z.string().min(1, 'text is required'),
  skipParser: z.boolean().optional(),
});

const processSchema = z.discriminatedUnion('inputType', [
  manualSchema,
  imageSchema,
  textSchema,
]);

export async function POST(request: NextRequest) {
  try {
    let inputData: any = {};
    
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      inputData.inputType = formData.get('inputType') || 'image';
      
      const file = formData.get('file');
      if (file && file instanceof Blob) {
         const buffer = Buffer.from(await file.arrayBuffer());
         inputData.imageBase64 = buffer.toString('base64');
         inputData.mimeType = file.type;
      } else if (typeof file === 'string') {
         inputData.text = file; // Fallback if file was sent as string
      }
    } else {
      inputData = await request.json();
    }

    const parsed = processSchema.safeParse(inputData);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const workflowId = await antigravityClient.startWorkflow(parsed.data);
    // Trigger pipeline in background using Vercel's waitUntil
    waitUntil(antigravityClient.runPipeline(workflowId, parsed.data));
    return NextResponse.json({ workflowId, status: 'running' }, { status: 201 });
  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { runPipeline } from '@/lib/raast-flow/runPipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await runPipeline(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        step: result.step,
        data: result.ctx,
      });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message,
    });
  }
}

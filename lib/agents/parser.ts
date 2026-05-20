import { Agent, AgentResult, WorkflowContext } from '../workflow-types';
import { VertexAI } from '@google-cloud/vertexai';

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'demo-project',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
});
const model = process.env.MOCK_MODE === 'true' ? null : vertex_ai.preview.getGenerativeModel({
  model: 'gemini-2.5-flash-001',
});

export class ParserAgent implements Agent {
  readonly name = 'parser';

  async run(ctx: WorkflowContext): Promise<AgentResult> {
    if (ctx.input.skipParser && ctx.inputType === 'manual') {
      return {
        status: 'completed',
        reasoning: 'Manual input provided. Parser skipped.',
        output: {
          extractedAmount: ctx.input.amount,
          extractedReference: ctx.input.invoiceId,
          extractedConfidence: 1.0,
        }
      };
    }

    let extractedAmount = 0;
    let extractedReference = '';
    let confidence = 0;

    if (!model) {
      // MOCK_MODE
      extractedAmount = 25000;
      extractedReference = 'INV-1001';
      confidence = 0.98;
      
      if (ctx.input.text) {
         const match = ctx.input.text.match(/INV-\d+/);
         if (match) extractedReference = match[0];
         if (ctx.input.text.includes('20000')) extractedAmount = 20000;
         if (ctx.input.text.includes('30000')) extractedAmount = 30000;
      }
    } else {
      // Real Gemini parsing
      try {
        let contents: any[] = [];
        if (ctx.input.imageBase64 && ctx.input.mimeType) {
          contents.push({
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: ctx.input.imageBase64,
                  mimeType: ctx.input.mimeType,
                }
              },
              {
                text: "Extract the invoice ID (reference) and amount from this image. Also provide a confidence score between 0.0 and 1.0. Return a JSON object with keys: invoiceId, amount, confidence. Do not wrap in markdown."
              }
            ]
          });
        } else if (ctx.input.text) {
          contents.push({
            role: 'user',
            parts: [{ text: `Extract the invoice ID (reference) and amount from this text: "${ctx.input.text}". Also provide a confidence score between 0.0 and 1.0. Return a JSON object with keys: invoiceId, amount, confidence. Do not wrap in markdown.` }]
          });
        } else {
           throw new Error('No valid input for parser');
        }

        const result = await model.generateContent({
           contents,
           generationConfig: { responseMimeType: 'application/json' }
        });

        let text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        // Clean markdown backticks if they are there
        text = text.replace(/```json\n?/, '').replace(/```/, '');
        const parsed = JSON.parse(text);
        extractedAmount = Number(parsed.amount) || 0;
        extractedReference = parsed.invoiceId || '';
        confidence = Number(parsed.confidence) || 0.95;
      } catch (e: any) {
        return {
           status: 'failed',
           reasoning: `Parser failed: ${e.message}`,
           output: {}
        };
      }
    }

    return {
      status: 'completed',
      reasoning: `Extracted amount ${extractedAmount}, reference ${extractedReference}, confidence ${confidence}`,
      output: {
        extractedAmount,
        extractedReference,
        extractedConfidence: confidence,
      }
    };
  }
}

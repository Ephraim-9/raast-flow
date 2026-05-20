import { Agent, AgentResult, WorkflowContext } from '../workflow-types';
import { db } from '../firebase-admin';

export class LookupAgent implements Agent {
  readonly name = 'lookup';

  async run(ctx: WorkflowContext): Promise<AgentResult> {
    try {
      const extractedReference = ctx.extracted?.invoiceId || '';
      if (!extractedReference) {
        return {
          status: 'failed',
          reasoning: 'Lookup failed: No invoiceId provided in context',
          output: {}
        };
      }

      const invoiceRef = db.collection('invoices').doc(extractedReference);
      const invoiceSnap = await invoiceRef.get();
      
      const invoiceFound = invoiceSnap.exists;
      let invoiceData = invoiceSnap.data() || null;
      const beforeState = invoiceFound ? { invoiceStatus: invoiceData?.status, warehouseBlocked: invoiceData?.warehouseBlocked } : null;

      return {
        status: 'completed',
        reasoning: invoiceFound ? `Invoice ${extractedReference} found.` : `Invoice not found.`,
        output: {
          invoiceFound,
          invoiceData,
          beforeState
        }
      };
    } catch (e: any) {
      return {
         status: 'failed',
         reasoning: `Lookup failed: ${e.message}`,
         output: {}
      };
    }
  }
}

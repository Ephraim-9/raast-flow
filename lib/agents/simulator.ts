import { Agent, AgentResult, WorkflowContext } from '../workflow-types';
import { db } from '../firebase-admin';

export class SimulatorAgent implements Agent {
  readonly name = 'simulator';

  async run(ctx: WorkflowContext): Promise<AgentResult> {
    try {
      const invoiceFound = ctx.lookup?.found;
      const extractedReference = ctx.extracted?.invoiceId;
      const recommendedAction = ctx.decision?.action;
      const actionId = ctx.decision?.actionId;
      const invoiceData = ctx.lookup?.invoice;
      const beforeState = ctx.lookup?.beforeState;

      let afterState = { ...beforeState };
      const simulationLogs = [];
      let whatsappPreview = '';
      
      if (invoiceFound && extractedReference) {
        let newStatus = invoiceData?.status;
        let newBlocked = invoiceData?.warehouseBlocked;

        if (recommendedAction === 'approve') {
          newStatus = 'reconciled';
          newBlocked = false;
          whatsappPreview = `✅ Release order ${actionId} generated for ${extractedReference}. Goods released.`;
          simulationLogs.push("Updated warehouse status to RELEASED");
          simulationLogs.push(`Generated release order ${actionId}`);
        } else if (recommendedAction === 'dispute') {
          newStatus = 'disputed';
          whatsappPreview = `⚠️ Short payment or issue detected for ${extractedReference}. Dispute ${actionId} created.`;
          simulationLogs.push("Warehouse remains BLOCKED");
          simulationLogs.push(`Created dispute ticket ${actionId}`);
        } else if (recommendedAction === 'credit_note') {
          newStatus = 'reconciled';
          newBlocked = false;
          whatsappPreview = `✅ Release order ${actionId} generated for ${extractedReference}. Credit note issued for overpayment.`;
          simulationLogs.push("Updated warehouse status to RELEASED");
          simulationLogs.push("Generated credit note request");
        }

        const invoiceRef = db.collection('invoices').doc(extractedReference);
        await invoiceRef.update({
          status: newStatus,
          warehouseBlocked: newBlocked
        });
        
        afterState = { invoiceStatus: newStatus, warehouseBlocked: newBlocked };
      } else {
        whatsappPreview = `❌ Payment received but no invoice found for reference ${extractedReference || 'unknown'}. Dispute ${actionId} created.`;
        simulationLogs.push(`Created dispute ticket ${actionId} for missing invoice`);
      }

      return {
        status: 'completed',
        reasoning: 'Simulation complete. State updated.',
        output: { afterState, simulationLogs, whatsappPreview }
      };

    } catch (e: any) {
      return {
        status: 'failed',
        reasoning: `Simulation failed: ${e.message}`,
        output: {}
      };
    }
  }
}

import { Agent, AgentResult, WorkflowContext } from '../workflow-types';

export class MatcherAgent implements Agent {
  readonly name = 'matcher';

  async run(ctx: WorkflowContext): Promise<AgentResult> {
    try {
      const invoiceFound = ctx.lookup?.found;
      const invoiceData = ctx.lookup?.invoice;
      const extractedAmount = ctx.extracted?.amount;

      let matchType = 'no_invoice';
      let matcherReasoning = 'Invoice not found in the system.';
      
      if (invoiceFound && invoiceData) {
        if (extractedAmount === undefined) {
           return {
             status: 'failed',
             reasoning: 'Matcher failed: extractedAmount is undefined.',
             output: {}
           };
        }
        if (invoiceData.amount === undefined) {
           return {
             status: 'failed',
             reasoning: 'Matcher failed: invoiceData.amount is undefined.',
             output: {}
           };
        }

        if (extractedAmount === invoiceData.amount) {
          matchType = 'exact';
          matcherReasoning = `Payment of Rs.${extractedAmount} matches invoice exactly.`;
        } else if (extractedAmount > invoiceData.amount) {
          matchType = 'overpayment';
          matcherReasoning = `Overpayment detected. Expected Rs.${invoiceData.amount}, got Rs.${extractedAmount}.`;
        } else {
          matchType = 'underpayment';
          matcherReasoning = `Underpayment detected. Expected Rs.${invoiceData.amount}, got Rs.${extractedAmount}.`;
        }
      }

      return {
        status: 'completed',
        reasoning: matcherReasoning,
        output: { matchType }
      };
    } catch (e: any) {
      return {
        status: 'failed',
        reasoning: `Matcher failed: ${e.message}`,
        output: {}
      };
    }
  }
}

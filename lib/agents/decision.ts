import { Agent, AgentResult, WorkflowContext } from '../workflow-types';

function generateId(prefix: string) {
  return `${prefix}_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8)}_${Math.floor(Math.random() * 1000)}`;
}

export class DecisionAgent implements Agent {
  readonly name = 'decision';

  async run(ctx: WorkflowContext): Promise<AgentResult> {
    try {
      const matchType = ctx.match?.type;

      if (!matchType) {
         return {
           status: 'failed',
           reasoning: 'Decision failed: matchType not provided in context.',
           output: {}
         };
      }

      let recommendedAction = 'dispute';
      let actionId = '';
      
      if (matchType === 'exact') {
        recommendedAction = 'approve';
        actionId = generateId('RO');
      } else if (matchType === 'overpayment') {
        recommendedAction = 'credit_note';
        actionId = generateId('CN');
      } else {
        recommendedAction = 'dispute';
        actionId = generateId('D');
      }

      return {
        status: 'completed',
        reasoning: `Recommended action: ${recommendedAction}. Generated ID: ${actionId}`,
        output: { recommendedAction, finalAction: recommendedAction, actionId }
      };
    } catch (e: any) {
      return {
        status: 'failed',
        reasoning: `Decision failed: ${e.message}`,
        output: {}
      };
    }
  }
}

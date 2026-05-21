import { ParserAgent } from '../agents/parser';
import { LookupAgent } from '../agents/lookup';
import { MatcherAgent } from '../agents/matcher';
import { DecisionAgent } from '../agents/decision';
import { SimulatorAgent } from '../agents/simulator';
import { WorkflowContext } from '../workflow-types';

export async function runPipeline(input: any) {
  const ctx: WorkflowContext = {
    workflowId: `sync_${Date.now()}`,
    inputType: input.inputType || input.type || 'manual',
    input: {
      ...input,
      skipParser: input.skipParser || (input.inputType === 'manual' || input.type === 'manual')
    }
  };

  // 1. PARSER
  const parser = new ParserAgent();
  const parserResult = await parser.run(ctx);

  if (parserResult.status === 'failed') {
      return { success: false, error: parserResult.reasoning, step: 'parser', ctx };
  }

  // Map parser output to context using consistent keys
  ctx.extracted = {
    amount: parserResult.output.extractedAmount as number,
    invoiceId: parserResult.output.extractedReference as string,
    confidence: parserResult.output.extractedConfidence as number,
  };

  // 2. LOOKUP
  const lookup = new LookupAgent();
  const lookupResult = await lookup.run(ctx);

  if (lookupResult.status === 'failed') {
      return { success: false, error: lookupResult.reasoning, step: 'lookup', ctx };
  }

  // Map lookup output to context
  ctx.lookup = {
    found: lookupResult.output.invoiceFound as boolean,
    invoice: lookupResult.output.invoiceData as any,
    beforeState: lookupResult.output.beforeState as any,
  };

  // 3. MATCHER
  const matcher = new MatcherAgent();
  const matcherResult = await matcher.run(ctx);

  if (matcherResult.status === 'failed') {
      return { success: false, error: matcherResult.reasoning, step: 'matcher', ctx };
  }

  // Map matcher output
  ctx.match = {
    type: matcherResult.output.matchType as any,
    reasoning: matcherResult.reasoning
  };

  // 4. DECISION
  const decision = new DecisionAgent();
  const decisionResult = await decision.run(ctx);

  if (decisionResult.status === 'failed') {
      return { success: false, error: decisionResult.reasoning, step: 'decision', ctx };
  }

  // Map decision output
  ctx.decision = {
    action: decisionResult.output.finalAction as any,
    actionId: decisionResult.output.actionId as string,
    reasoning: decisionResult.reasoning
  };

  // 5. SIMULATOR
  const simulator = new SimulatorAgent();
  const simulatorResult = await simulator.run(ctx);

  if (simulatorResult.status === 'failed') {
      return { success: false, error: simulatorResult.reasoning, step: 'simulator', ctx };
  }

  ctx.result = {
    finalStatus: 'completed',
    banner: ctx.decision?.action === 'approve' ? 'approved' : (ctx.decision?.action === 'dispute' ? 'dispute' : 'credit_note'),
    afterState: simulatorResult.output.afterState as any,
    simulationLogs: simulatorResult.output.simulationLogs as string[],
    whatsappPreview: simulatorResult.output.whatsappPreview as string,
  };

  return { success: true, data: ctx };
}

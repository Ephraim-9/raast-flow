import { db } from './firebase-admin';
import { WorkflowContext } from './workflow-types';
import { ParserAgent } from './agents/parser';
import { LookupAgent } from './agents/lookup';
import { MatcherAgent } from './agents/matcher';
import { DecisionAgent } from './agents/decision';
import { SimulatorAgent } from './agents/simulator';

function generateId(prefix: string) {
  return `${prefix}_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8)}_${Math.floor(Math.random() * 1000)}`;
}

async function writeTrace(workflowId: string, traceData: any) {
  const traceRef = db.collection('workflow_executions').doc(workflowId).collection('traces').doc(`step_${traceData.order}`);
  await traceRef.set({ ...traceData, timestamp: new Date() });
}

async function updateWorkflowStatus(workflowId: string, updateData: any) {
  const wfRef = db.collection('workflow_executions').doc(workflowId);
  await wfRef.update(updateData);
}

export class AntigravityClient {
  // Start workflow: create execution doc and return workflowId
  async startWorkflow(input: any) {
    const workflowId = generateId('wf');
    const initialDoc = {
      id: workflowId,
      inputType: input.inputType,
      inputPreview: input.text?.slice(0, 100) || input.manual?.invoiceId || 'Image input',
      status: 'running',
      currentStep: 1,
      createdAt: new Date(),
    };
    await db.collection('workflow_executions').doc(workflowId).set(initialDoc);
    // Do NOT start pipeline here; caller should trigger it (e.g., via Vercel waitUntil)
    return workflowId;
  }

  // Public method to run the full pipeline; can be awaited in background
  async runPipeline(workflowId: string, input: any) {
    try {
      const ctx: WorkflowContext = {
        workflowId,
        inputType: input.inputType || 'image',
        input: {
          invoiceId: input.manual?.invoiceId,
          amount: input.manual?.amount,
          imageBase64: input.imageBase64,
          mimeType: input.mimeType,
          text: input.text,
          skipParser: input.skipParser || (input.inputType === 'manual')
        }
      };

      const agents = [
        new ParserAgent(),
        new LookupAgent(),
        new MatcherAgent(),
        new DecisionAgent(),
        new SimulatorAgent()
      ];

      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        const order = i + 1;
        await writeTrace(workflowId, { agentName: agent.name, order, status: 'running' });
        const result = await agent.run(ctx);
        if (result.status === 'failed') {
          await writeTrace(workflowId, { agentName: agent.name, order, status: 'failed', reasoning: result.reasoning, output: result.output });
          await updateWorkflowStatus(workflowId, { status: 'failed', error: result.reasoning });
          return;
        }
        // Merge outputs (same logic as before)
        if (agent.name === 'parser') {
          ctx.extracted = { invoiceId: result.output.extractedReference as string, amount: result.output.extractedAmount as number, confidence: result.output.extractedConfidence as number };
          await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'lookup') {
          ctx.lookup = { found: result.output.invoiceFound as boolean, invoice: result.output.invoiceData as any, beforeState: result.output.beforeState as any };
          await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'matcher') {
          ctx.match = { type: result.output.matchType as any, reasoning: result.reasoning };
          await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'decision') {
          ctx.decision = { action: result.output.recommendedAction as any, actionId: result.output.actionId as string, reasoning: result.reasoning };
          await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'simulator') {
          ctx.result = {
            finalStatus: 'completed',
            banner: ctx.decision?.action === 'approve' ? 'approved' : (ctx.decision?.action === 'dispute' ? 'dispute' : 'credit_note'),
            afterState: result.output.afterState as any,
            simulationLogs: result.output.simulationLogs as string[],
            whatsappPreview: result.output.whatsappPreview as string,
          };
          await updateWorkflowStatus(workflowId, {
            afterState: ctx.result.afterState,
            simulationLogs: ctx.result.simulationLogs,
            whatsappPreview: ctx.result.whatsappPreview,
            banner: ctx.result.banner,
            status: 'completed',
            currentStep: order
          });
        }
        await writeTrace(workflowId, { agentName: agent.name, order, status: 'completed', reasoning: result.reasoning, output: result.output });
      }
    } catch (e: any) {
      console.error(e);
      await updateWorkflowStatus(workflowId, { status: 'failed', error: e.message });
    }
  }

  // Existing private runPipeline removed; public version above is used instead

  async startWorkflow(input: any) {
    const workflowId = generateId('wf');
    
    const initialDoc = {
      id: workflowId,
      inputType: input.inputType,
      inputPreview: input.text?.slice(0, 100) || input.manual?.invoiceId || 'Image input',
      status: 'running',
      currentStep: 1,
      createdAt: new Date(),
    };
    
    await db.collection('workflow_executions').doc(workflowId).set(initialDoc);
    
    // Start processing asynchronously
    this.runPipeline(workflowId, input).catch(console.error);
    
    return workflowId;
  }

  private async runPipeline(workflowId: string, input: any) {
    try {
      const ctx: WorkflowContext = {
        workflowId,
        inputType: input.inputType || 'image',
        input: {
          invoiceId: input.manual?.invoiceId,
          amount: input.manual?.amount,
          imageBase64: input.imageBase64,
          mimeType: input.mimeType,
          text: input.text,
          skipParser: input.skipParser || (input.inputType === 'manual')
        }
      };

      const agents = [
        new ParserAgent(),
        new LookupAgent(),
        new MatcherAgent(),
        new DecisionAgent(),
        new SimulatorAgent()
      ];

      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        const order = i + 1;
        await writeTrace(workflowId, { agentName: agent.name, order, status: 'running' });

        const result = await agent.run(ctx);

        if (result.status === 'failed') {
          await writeTrace(workflowId, {
            agentName: agent.name,
            order,
            status: 'failed',
            reasoning: result.reasoning,
            output: result.output
          });
          await updateWorkflowStatus(workflowId, { status: 'failed', error: result.reasoning });
          return; // Stop pipeline on failure
        }

        // Merge output into context based on agent name
        if (agent.name === 'parser') {
           ctx.extracted = {
             invoiceId: result.output.extractedReference as string,
             amount: result.output.extractedAmount as number,
             confidence: result.output.extractedConfidence as number,
           };
           await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'lookup') {
           ctx.lookup = {
             found: result.output.invoiceFound as boolean,
             invoice: result.output.invoiceData as any,
             beforeState: result.output.beforeState as any,
           };
           await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'matcher') {
           ctx.match = {
             type: result.output.matchType as any,
             reasoning: result.reasoning
           };
           await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'decision') {
           ctx.decision = {
             action: result.output.recommendedAction as any,
             actionId: result.output.actionId as string,
             reasoning: result.reasoning
           };
           await updateWorkflowStatus(workflowId, { ...result.output, currentStep: order + 1 });
        } else if (agent.name === 'simulator') {
           ctx.result = {
             finalStatus: 'completed',
             banner: ctx.decision?.action === 'approve' ? 'approved' : (ctx.decision?.action === 'dispute' ? 'dispute' : 'credit_note'),
             afterState: result.output.afterState as any,
             simulationLogs: result.output.simulationLogs as string[],
             whatsappPreview: result.output.whatsappPreview as string,
           };
           await updateWorkflowStatus(workflowId, {
             afterState: ctx.result.afterState,
             simulationLogs: ctx.result.simulationLogs,
             whatsappPreview: ctx.result.whatsappPreview,
             banner: ctx.result.banner,
             status: 'completed',
             currentStep: order
           });
        }

        await writeTrace(workflowId, {
          agentName: agent.name,
          order,
          status: 'completed',
          reasoning: result.reasoning,
          output: result.output
        });
      }

    } catch (e: any) {
      console.error(e);
      await updateWorkflowStatus(workflowId, { status: 'failed', error: e.message });
    }
  }
}

export const antigravityClient = new AntigravityClient();

export type InvoiceRecord = {
  id?: string;
  amount?: number;
  status?: string;
  warehouseBlocked?: boolean;
  [key: string]: any;
};

export type WorkflowContext = {
  workflowId: string;
  inputType: 'manual' | 'image' | 'text';
  input: {
    invoiceId?: string;
    amount?: number;
    imageBase64?: string;
    mimeType?: string;
    text?: string;
    skipParser?: boolean;
  };
  extracted?: {
    invoiceId?: string;      // API/trace: also extractedReference
    amount?: number;         // API/trace: also extractedAmount
    confidence?: number;
    rawText?: string;
  };
  lookup?: {
    found: boolean;
    invoice?: InvoiceRecord | null;
    beforeState?: { invoiceStatus?: string; warehouseBlocked?: boolean } | null;
  };
  match?: {
    type: 'exact' | 'overpayment' | 'underpayment' | 'no_invoice';
    reasoning?: string;
  };
  decision?: {
    action: 'approve' | 'dispute' | 'credit_note' | 'manual_review';
    actionId?: string;
    reasoning?: string;
  };
  result?: {
    finalStatus: string;
    banner: 'approved' | 'dispute' | 'credit_note';
    afterState?: object;
    simulationLogs?: string[];
    whatsappPreview?: string;
  };
};

export type AgentResult = {
  status: 'completed' | 'failed';
  reasoning: string;
  output: Record<string, unknown>;
};

export interface Agent {
  readonly name: string;
  run(ctx: WorkflowContext): Promise<AgentResult>;
}

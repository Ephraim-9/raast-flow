const testScenarios = [
  {
    name: "Exact match",
    payload: {
      inputType: "text",
      text: "Please pay invoice INV-1001 for 25000."
    },
    expectedAction: "approve",
    expectedMatch: "exact"
  },
  {
    name: "Underpayment",
    payload: {
      inputType: "text",
      text: "Please pay invoice INV-1002 for 20000."
    },
    expectedAction: "dispute",
    expectedMatch: "underpayment"
  },
  {
    name: "Overpayment",
    payload: {
      inputType: "text",
      text: "Please pay invoice INV-1003 for 30000."
    },
    expectedAction: "credit_note",
    expectedMatch: "overpayment"
  },
  {
    name: "No Invoice found",
    payload: {
      inputType: "text",
      text: "Please pay invoice INV-9999 for 10000."
    },
    expectedAction: "dispute",
    expectedMatch: "no_invoice"
  },
  {
    name: "Manual Entry",
    payload: {
      inputType: "manual",
      manual: {
        amount: 25000,
        invoiceId: "INV-1001",
        date: "2026-05-15",
        notes: "test manual"
      }
    },
    expectedAction: "approve",
    expectedMatch: "exact"
  }
];

async function runTests() {
  const baseUrl = "http://localhost:3000";
  console.log("Starting workflow tests...\n");

  for (const scenario of testScenarios) {
    console.log(`Running scenario: ${scenario.name}`);
    try {
      const res = await fetch(`${baseUrl}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario.payload)
      });
      
      const data = await res.json();
      if (!data.workflowId) {
        console.error(`❌ Failed to start workflow: ${JSON.stringify(data)}`);
        continue;
      }
      
      console.log(`Started workflow: ${data.workflowId}. Polling for completion...`);
      let resultData;
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusRes = await fetch(`${baseUrl}/api/workflow/${data.workflowId}/status`);
        const statusData = await statusRes.json();
        
        if (statusData.status === "completed" || statusData.status === "failed") {
          console.log(`Workflow finished with status: ${statusData.status}`);
          break;
        }
      }
      
      const resultRes = await fetch(`${baseUrl}/api/workflow/${data.workflowId}/result`);
      resultData = await resultRes.json();
      
      const actionMatch = resultData.finalAction === scenario.expectedAction;
      const matchTypeMatch = resultData.matchType === scenario.expectedMatch;
      
      if (actionMatch && matchTypeMatch) {
        console.log(`✅ Passed. Action: ${resultData.finalAction}, Match: ${resultData.matchType}\n`);
      } else {
        console.error(`❌ Failed. Expected Action/Match: ${scenario.expectedAction}/${scenario.expectedMatch}, got: ${resultData.finalAction}/${resultData.matchType}\n`);
      }
    } catch (e) {
      console.error(`❌ Error running scenario:`, e.message, "\n");
    }
  }
  
  console.log("Tests completed.");
}

runTests();

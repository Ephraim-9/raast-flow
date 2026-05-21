const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'demo-raast-flow',
  });
}

const db = admin.firestore();

async function exportLogs() {
  console.log("Exporting agent logs...");
  try {
    const workflowsSnapshot = await db.collection('workflow_executions').orderBy('createdAt', 'desc').limit(5).get();
    const exportData = [];

    for (const doc of workflowsSnapshot.docs) {
      const workflowData = doc.data();
      const tracesSnapshot = await db.collection('workflow_executions').doc(doc.id).collection('traces').orderBy('order').get();
      
      const traces = tracesSnapshot.docs.map(t => t.data());
      
      exportData.push({
        workflowId: doc.id,
        status: workflowData.status,
        createdAt: workflowData.createdAt,
        traces: traces
      });
    }

    fs.writeFileSync('antigravity/logs/agent_traces_export.json', JSON.stringify(exportData, null, 2));
    console.log(`✅ Exported ${exportData.length} workflow logs to antigravity/logs/agent_traces_export.json`);
  } catch (e) {
    console.error("❌ Failed to export logs:", e.message);
  }
}

exportLogs();

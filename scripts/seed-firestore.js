require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (serviceAccount.privateKey && serviceAccount.clientEmail) {
  initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  console.log("No valid service account found, using demo project");
  initializeApp({ projectId: serviceAccount.projectId });
}

const db = getFirestore();

async function seed() {
  const dataPath = path.join(__dirname, '../mock-data/invoices.json');
  const invoices = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const invoice of invoices) {
    const docRef = db.collection('invoices').doc(invoice.id);
    await docRef.set(invoice);
    console.log(`Seeded invoice: ${invoice.id}`);
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);

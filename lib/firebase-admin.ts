import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { mockDb } from './mock-db';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let dbInstance: any;

if (process.env.MOCK_MODE === 'true') {
  dbInstance = mockDb;
} else {
  if (!getApps().length) {
    if (serviceAccount.projectId) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      initializeApp({ projectId: "demo-project" });
    }
  }
  dbInstance = getFirestore();
}

export const db = dbInstance;

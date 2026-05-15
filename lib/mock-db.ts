import fs from 'fs';
import path from 'path';

// In-memory mock DB
const DB = {
  invoices: new Map(),
  workflow_executions: new Map(),
};

// Seed invoices
try {
  const dataPath = path.join(process.cwd(), 'mock-data/invoices.json');
  const invoices = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  invoices.forEach((inv: any) => DB.invoices.set(inv.id, inv));
} catch (e) {
  console.log('Could not load mock invoices from JSON. Using empty DB.', e);
}

// Minimal Firestore-like API
export class MockFirestore {
  collection(name: 'invoices' | 'workflow_executions') {
    return {
      doc: (id: string) => {
        return {
          get: async () => {
            const data = DB[name].get(id);
            return {
              id,
              exists: !!data,
              data: () => data || null
            };
          },
          set: async (data: any) => {
            DB[name].set(id, { id, ...data });
          },
          update: async (data: any) => {
            const existing = DB[name].get(id) || {};
            DB[name].set(id, { ...existing, ...data });
          },
          collection: (subName: string) => {
            // Very hacky sub-collection support for traces
            const subMapName = `${name}_${id}_${subName}` as keyof typeof DB;
            if (!DB[subMapName]) DB[subMapName] = new Map() as any;
            return {
              doc: (subId: string) => ({
                set: async (data: any) => {
                  (DB[subMapName] as Map<string, any>).set(subId, { id: subId, ...data });
                }
              }),
              get: async () => {
                const docs = Array.from((DB[subMapName] as Map<string, any> || new Map()).values()).map(data => ({
                  id: data.id,
                  data: () => data
                }));
                return { docs };
              }
            };
          }
        };
      },
      orderBy: (field: string, direction: string) => ({
        limit: (limitNum: number) => ({
          get: async () => {
            const allDocs = Array.from(DB[name].values());
            // Sort logic simplified
            allDocs.sort((a, b) => {
               const valA = a[field] || '';
               const valB = b[field] || '';
               if (direction === 'desc') return valB > valA ? 1 : -1;
               return valA > valB ? 1 : -1;
            });
            const docs = allDocs.slice(0, limitNum).map(data => ({
              id: data.id,
              data: () => data
            }));
            return { docs };
          }
        })
      })
    };
  }
}

export const mockDb = new MockFirestore();

"use client";
import { TopBar } from '@/components/TopBar';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HistoryPage() {
  const { data, error, isLoading } = useSWR('/api/history', fetcher);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Recent Activity" />
      
      <div className="p-4 space-y-4">
        {isLoading && <p className="text-center text-text-secondary text-sm mt-10">Loading history...</p>}
        {error && <p className="text-center text-danger text-sm mt-10">Failed to load history</p>}
        
        {data?.items?.length === 0 && (
          <p className="text-center text-text-secondary text-sm mt-10">No recent transactions</p>
        )}

        {data?.items?.map((item: any) => (
          <Link key={item.workflowId} href={`/result?workflowId=${item.workflowId}`}>
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-border hover:border-primary transition-colors flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold">{item.extractedReference || 'Unknown'}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                  item.finalAction === 'approve' ? 'bg-green-100 text-green-700' : 
                  item.finalAction === 'dispute' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.finalAction}
                </span>
                <p className="text-xs text-text-secondary mt-1 capitalize">{item.matchType?.replace('_', ' ')}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

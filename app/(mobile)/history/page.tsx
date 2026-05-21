"use client";
import { TopBar } from '@/components/TopBar';
import useSWR from 'swr';
import Link from 'next/link';
import { Ticket, Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HistoryPage() {
  const { data, error, isLoading } = useSWR('/api/history', fetcher);

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="Stats & History" />
      
      <div className="p-4 pt-2">
        <p className="text-[18px] font-bold mb-1">Dashboard</p>
        <p className="text-[11px] text-white/35 mb-3.5">May 2026 overview</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-surface rounded-[14px] p-3 border border-white/5">
            <p className="text-[9.5px] text-white/40 mb-1.5 uppercase font-medium">Total Payments</p>
            <p className="text-[24px] font-bold">{data?.items?.length || 0}</p>
            <p className="text-[9.5px] text-secondary mt-1">↑ 12% vs last month</p>
          </div>
          <div className="bg-surface rounded-[14px] p-3 border border-white/5">
            <p className="text-[9.5px] text-white/40 mb-1.5 uppercase font-medium">Amount Paid</p>
            <p className="text-[24px] font-bold">$2,450</p>
            <p className="text-[9.5px] text-secondary mt-1">↑ 8% vs last month</p>
          </div>
          <div className="bg-surface rounded-[14px] p-3 border border-white/5">
            <p className="text-[9.5px] text-white/40 mb-1.5 uppercase font-medium">Active Tickets</p>
            <p className="text-[24px] font-bold">3</p>
            <p className="text-[9.5px] text-white/30 mt-1">Expiring soon: 1</p>
          </div>
          <div className="bg-surface rounded-[14px] p-3 border border-white/5">
            <p className="text-[9.5px] text-white/40 mb-1.5 uppercase font-medium">Pending</p>
            <p className="text-[24px] font-bold text-warning">1</p>
            <p className="text-[9.5px] text-warning mt-1">Due today</p>
          </div>
        </div>

        <p className="text-[10.5px] text-white/40 mb-2.5 font-medium tracking-wide">PAYMENT HISTORY</p>
        <div className="flex flex-col gap-2">
          {isLoading && <p className="text-center text-white/40 text-[12px] py-10">Loading history...</p>}
          {error && <p className="text-center text-danger text-[12px] py-10">Failed to load history</p>}
          
          {data?.items?.length === 0 && (
            <p className="text-center text-white/40 text-[12px] py-10">No recent transactions</p>
          )}

          {data?.items?.map((item: any) => {
            const isApproved = item.finalAction === 'approve';
            const isDispute = item.finalAction === 'dispute';
            const isCredit = item.finalAction === 'credit_note';
            
            return (
              <Link key={item.workflowId} href={`/result?workflowId=${item.workflowId}`} className="bg-surface rounded-xl p-3 border border-white/10 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${isApproved ? 'bg-secondary/10 text-secondary' : isDispute ? 'bg-danger/10 text-danger' : isCredit ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                    {isApproved ? <CheckCircle2 size={17} /> : isDispute ? <AlertTriangle size={17} /> : <Info size={17} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">{item.extractedReference || 'Unknown'}</p>
                    <p className="text-[9.5px] text-white/35 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-[13px] font-semibold mb-1 capitalize">{item.matchType?.replace('_', ' ') || 'Manual'}</p>
                  <span className={`inline-flex items-center text-[9.5px] px-2 py-0.5 rounded-full font-semibold ${isApproved ? 'bg-secondary/15 text-secondary' : isDispute ? 'bg-danger/15 text-danger' : isCredit ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
                    {item.finalAction || 'pending'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}

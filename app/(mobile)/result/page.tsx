"use client";
import { TopBar } from '@/components/TopBar';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CheckCircle2, AlertTriangle, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');

  const { data, error, isLoading } = useSWR(
    workflowId ? `/api/workflow/${workflowId}/result` : null, 
    fetcher
  );

  if (isLoading) return <div className="p-4 mt-14">Loading result...</div>;
  if (error || !data) return <div className="p-4 mt-14">Error loading result</div>;

  const isApproved = data.banner === 'approved';
  const isCredit = data.banner === 'credit_note';
  const isDispute = data.banner === 'dispute';

  return (
    <>
      <div className={`p-6 flex flex-col items-center justify-center text-center text-white ${
        isApproved ? 'bg-secondary' : isCredit ? 'bg-primary' : 'bg-danger'
      }`}>
        {isApproved || isCredit ? <CheckCircle2 size={48} className="mb-2" /> : <AlertTriangle size={48} className="mb-2" />}
        <h2 className="text-2xl font-bold">
          {isApproved ? 'Release Approved' : isCredit ? 'Credit Note Issued' : 'Dispute Created'}
        </h2>
        <p className="text-white/80 text-sm mt-1">
          {data.actionId ? `ID: ${data.actionId}` : 'Manual review required'}
        </p>
      </div>

      <div className="p-4 space-y-6 -mt-4">
        <div className="bg-surface rounded-xl p-5 shadow-md border border-border relative z-10 space-y-4">
          <h3 className="font-semibold text-sm text-text-secondary border-b border-border pb-2">Warehouse Status</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs text-text-secondary mb-1">Before</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${data.beforeState?.warehouseBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {data.beforeState?.warehouseBlocked ? 'BLOCKED' : 'RELEASED'}
              </span>
            </div>
            <ArrowRight size={16} className="text-gray-300 mx-2" />
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs text-text-secondary mb-1">After</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${data.afterState?.warehouseBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {data.afterState?.warehouseBlocked ? 'BLOCKED' : 'RELEASED'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border">
           <h3 className="font-semibold text-sm text-text-secondary mb-3">Reconciliation Details</h3>
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <p className="text-text-secondary text-xs">Reference</p>
               <p className="font-medium">{data.extractedReference}</p>
             </div>
             <div>
               <p className="text-text-secondary text-xs">Amount Paid</p>
               <p className="font-medium">Rs. {data.extractedAmount}</p>
             </div>
             <div className="col-span-2">
               <p className="text-text-secondary text-xs">Match Analysis</p>
               <p className="font-medium capitalize">{data.matchType?.replace('_', ' ')}</p>
             </div>
           </div>
        </div>

        {data.whatsappPreview && (
          <div className="bg-[#EFEAE2] rounded-xl overflow-hidden shadow-sm border border-border">
            <div className="bg-[#00A884] px-3 py-2 flex items-center text-white">
              <MessageCircle size={16} className="mr-2" />
              <span className="text-sm font-medium">Notification Sent</span>
            </div>
            <div className="p-3">
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm inline-block">
                {data.whatsappPreview}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        <Link href="/" className="block w-full text-center bg-gray-100 text-text-primary font-medium p-3 rounded-lg hover:bg-gray-200 transition-colors">
          Process Another
        </Link>
      </div>
    </>
  );
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Outcome" />
      <Suspense fallback={<div className="p-4 mt-14">Loading result...</div>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}

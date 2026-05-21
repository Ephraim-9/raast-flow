"use client";
import { TopBar } from '@/components/TopBar';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CheckCircle2, AlertTriangle, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const [animPlay, setAnimPlay] = useState(false);

  const { data, error, isLoading } = useSWR(
    workflowId ? `/api/workflow/${workflowId}/result` : null, 
    fetcher
  );

  useEffect(() => {
    if (data) {
      setTimeout(() => setAnimPlay(true), 100);
    }
  }, [data]);

  if (isLoading) return <div className="p-4 pt-[70px] text-center text-white/50 text-[13px]">Loading result...</div>;
  if (error || !data) return <div className="p-4 pt-[70px] text-center text-danger text-[13px]">Error loading result</div>;

  const isApproved = data.banner === 'approved';
  const isCredit = data.banner === 'credit_note';
  const isDispute = data.banner === 'dispute';

  const accentColor = isApproved ? 'text-[#25D166]' : isCredit ? 'text-[#6C5CE7]' : 'text-[#FF4757]';
  const accentBg = isApproved ? 'bg-[#25D166]' : isCredit ? 'bg-[#6C5CE7]' : 'bg-[#FF4757]';
  const accentBorder = isApproved ? 'border-[#25D166]' : isCredit ? 'border-[#6C5CE7]' : 'border-[#FF4757]';
  const accentGlow = isApproved ? 'shadow-[0_0_40px_rgba(37,209,102,0.4)]' : isCredit ? 'shadow-[0_0_40px_rgba(108,92,231,0.4)]' : 'shadow-[0_0_40px_rgba(255,71,87,0.4)]';

  return (
    <div className="absolute inset-0 bg-[#040408] text-white overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Header (TopBar replacement for overlay) */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-[46px] pb-[14px] px-4 flex justify-between items-center pointer-events-auto">
        <Link 
          href="/"
          className="w-[30px] h-[30px] rounded-full bg-white/10 flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={15} />
        </Link>
        <p className="text-[15px] font-semibold">Reconciliation Result</p>
        <div className="w-[30px] h-[30px]"></div>
      </div>

      <div className={`flex flex-col items-center mt-10 transition-all duration-700 ease-out transform ${animPlay ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
        <div className={`w-[80px] h-[80px] rounded-full ${accentBg}/10 flex items-center justify-center border-2 ${accentBorder}/30 ${accentGlow} mb-4 relative`}>
          {isApproved || isCredit ? (
            <CheckCircle2 size={40} className={accentColor} />
          ) : (
            <AlertTriangle size={40} className={accentColor} />
          )}
          {/* Animated rings */}
          <div className={`absolute inset-0 rounded-full border border-${isApproved ? 'secondary' : isCredit ? 'primary' : 'danger'} animate-cring opacity-0`}></div>
        </div>
        
        <h2 className="text-[22px] font-bold tracking-tight text-center">
          {isApproved ? 'Release Approved' : isCredit ? 'Credit Note Issued' : 'Dispute Created'}
        </h2>
        <p className="text-[13px] text-white/50 mt-1.5 mb-8">
          {data.actionId ? `ID: ${data.actionId}` : 'Manual review required'}
        </p>

        {/* Custom Ticket Card */}
        <div className="w-full max-w-[320px] bg-white rounded-2xl p-5 relative text-black overflow-hidden shadow-2xl">
          {/* Ticket perforations */}
          <div className="absolute top-0 left-4 right-4 h-1 flex justify-between">
             {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-[#040408] rounded-full -mt-[3px]"></div>
             ))}
          </div>

          <div className="text-center mb-5 mt-2">
             <p className="text-[10px] text-gray-400 font-bold tracking-[1.5px] uppercase mb-1">Total Amount</p>
             <p className="text-[32px] font-black tracking-tight leading-none">${data.extractedAmount}</p>
          </div>

          <div className="border-t-2 border-dashed border-gray-200 py-4 mb-4 flex flex-col gap-3">
             <div className="flex justify-between">
                <span className="text-[11px] text-gray-400 font-medium">Reference</span>
                <span className="text-[11px] font-bold">{data.extractedReference}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-[11px] text-gray-400 font-medium">Match Analysis</span>
                <span className="text-[11px] font-bold capitalize">{data.matchType?.replace('_', ' ')}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium">Warehouse</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${data.beforeState?.warehouseBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {data.beforeState?.warehouseBlocked ? 'BLOCK' : 'REL'}
                  </span>
                  <ArrowRight size={10} className="text-gray-400" />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${data.afterState?.warehouseBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {data.afterState?.warehouseBlocked ? 'BLOCK' : 'REL'}
                  </span>
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center opacity-40">
             {/* Fake Barcode */}
             <div className="flex h-10 gap-[2px] items-end justify-center w-full px-2">
                {Array.from({length: 40}).map((_, i) => (
                  <div key={i} className="bg-black" style={{ width: `${Math.random() * 3 + 1}px`, height: `${Math.random() > 0.8 ? '80%' : '100%'}` }}></div>
                ))}
             </div>
             <p className="text-[9px] font-mono mt-1 tracking-widest">{data.actionId || '94038194301'}</p>
          </div>
        </div>

        {data.whatsappPreview && (
          <div className="mt-6 w-full max-w-[320px] bg-white/5 border border-[#25D166]/30 rounded-xl p-3 flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-[#25D166]/20 flex items-center justify-center shrink-0">
               <MessageCircle size={16} className="text-[#25D166]" />
             </div>
             <div>
                <p className="text-[11px] font-semibold text-[#25D166] mb-1">WhatsApp Notification Sent</p>
                <p className="text-[11px] text-white/70 italic leading-snug">"{data.whatsappPreview}"</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#040408] text-white">Loading result...</div>}>
      <ResultContent />
    </Suspense>
  );
}

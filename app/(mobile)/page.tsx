"use client";
import { useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Scan, Ticket, FileText, Clock, Receipt, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useSWR('/api/history', fetcher);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'camera' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      sessionStorage.setItem('pending_capture', imageData);
      sessionStorage.setItem('pending_filename', file.name);
      router.push(`/camera?mode=${mode}&source=home`);
    };
    reader.readAsDataURL(file);
  };

  const stats = useMemo(() => {
    if (!data?.items) return { totalPaid: 0, active: 0, pending: 0, recent: [] };
    
    let totalPaid = 0;
    let active = 0;
    let pending = 0;

    data.items.forEach((item: any) => {
      const amount = Number(item.extractedAmount) || 0;
      if (item.finalAction === 'approve') {
        totalPaid += amount;
      } else if (item.finalAction === 'dispute' || item.finalAction === 'manual_review') {
        pending++;
      } else if (item.finalAction === 'credit_note') {
        active++;
      }
    });

    return {
      totalPaid,
      active,
      pending,
      recent: data.items.slice(0, 3)
    };
  }, [data]);

  return (
    <div className="p-4 pb-24">
      {/* Hidden Input for Scan */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={(e) => handleFileChange(e, 'camera')} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />

      <div className="flex justify-between items-center mb-4 mt-2">
        <div>
          <p className="text-[20px] font-semibold tracking-tight">Good morning 👋</p>
        </div>
      </div>

      {/* Balance card */}
      <div className="bg-primary rounded-[20px] p-[18px] mb-4 relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -right-5 -top-5 w-[100px] h-[100px] rounded-full bg-white/10"></div>
        <div className="absolute right-2.5 -bottom-7 w-[80px] h-[80px] rounded-full bg-white/5"></div>
        
        <p className="text-[10px] text-white/65 mb-[3px]">Total Paid</p>
        <p className="text-[26px] font-bold mb-3.5 tracking-tight">
          ${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        
        <div className="flex justify-between pt-3 border-t border-white/20">
          <div>
            <p className="text-[8.5px] text-white/55 mb-0.5 font-medium tracking-wide">TOTAL TRANSACTIONS</p>
            <p className="text-[14px] font-semibold">{data?.items?.length || 0}</p>
          </div>
          <div>
            <p className="text-[8.5px] text-white/55 mb-0.5 font-medium tracking-wide">PENDING</p>
            <p className={`text-[14px] font-semibold ${stats.pending > 0 ? 'text-warning' : ''}`}>{stats.pending}</p>
          </div>
          <div>
            <p className="text-[8.5px] text-white/55 mb-0.5 font-medium tracking-wide">CREDITS</p>
            <p className="text-[14px] font-semibold">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <p className="text-[10.5px] text-white/40 mb-2.5 font-medium tracking-wide">QUICK ACTIONS</p>
      <div className="grid grid-cols-4 gap-1.5 mb-5">
        <Link href="/manual" className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-[46px] h-[46px] rounded-[13px] bg-surface border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors">
            <CreditCard size={20} className="text-primary" />
          </div>
          <span className="text-[8.5px] text-white/40 font-medium">Pay</span>
        </Link>
        <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-[46px] h-[46px] rounded-[13px] bg-surface border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors">
            <Scan size={20} className="text-secondary" />
          </div>
          <span className="text-[8.5px] text-white/40 font-medium">Scan</span>
        </button>
        <Link href="/history" className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-[46px] h-[46px] rounded-[13px] bg-surface border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors">
            <Ticket size={20} className="text-warning" />
          </div>
          <span className="text-[8.5px] text-white/40 font-medium">History</span>
        </Link>
        <Link href="/whatsapp" className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-[46px] h-[46px] rounded-[13px] bg-surface border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors">
            <FileText size={20} className="text-[#25D166]" />
          </div>
          <span className="text-[8.5px] text-white/40 font-medium">WhatsApp</span>
        </Link>
      </div>

      <p className="text-[10.5px] text-white/40 mb-2.5 font-medium tracking-wide">RECENT TRANSACTIONS</p>
      <div className="flex flex-col gap-2">
        {isLoading && <p className="text-center text-white/40 text-[12px] py-4">Loading...</p>}
        {!isLoading && stats.recent.length === 0 && (
          <p className="text-center text-white/40 text-[12px] py-4 bg-surface rounded-xl border border-white/5">No recent transactions</p>
        )}
        
        {stats.recent.map((item: any) => {
          const isApproved = item.finalAction === 'approve';
          const isDispute = item.finalAction === 'dispute';
          const isCredit = item.finalAction === 'credit_note';
          
          return (
            <Link key={item.workflowId} href={`/result?workflowId=${item.workflowId}`} className="bg-surface rounded-xl p-3 border border-white/10 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${isApproved ? 'bg-secondary/10 text-secondary' : isDispute ? 'bg-danger/10 text-danger' : isCredit ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                  {isApproved ? <Receipt size={17} /> : isDispute ? <AlertTriangle size={17} /> : <Ticket size={17} />}
                </div>
                <div>
                  <p className="text-[13px] font-medium">{item.extractedReference || 'Unknown'}</p>
                  <p className="text-[9.5px] text-white/35 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[13px] font-semibold mb-1">${Number(item.extractedAmount || 0).toFixed(2)}</p>
                <span className={`inline-flex items-center text-[9.5px] px-2 py-0.5 rounded-full font-semibold ${isApproved ? 'bg-secondary/15 text-secondary' : isDispute ? 'bg-danger/15 text-danger' : isCredit ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
                  {item.finalAction || 'pending'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


"use client";
import { TopBar } from '@/components/TopBar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Keyboard, ArrowRight } from 'lucide-react';

export default function ManualEntryPage() {
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId || !amount) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputType: 'manual', 
          skipParser: true,
          manual: { invoiceId, amount: parseFloat(amount) } 
        })
      });
      const data = await res.json();
      if (data.workflowId) {
        router.push(`/process?workflowId=${data.workflowId}`);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Manual Entry" />
      <div className="p-4 pb-[30px] pt-2">
        <div className="text-center py-4">
          <div className="w-[60px] h-[60px] rounded-full bg-warning/10 mx-auto mb-2.5 flex items-center justify-center border-[1.5px] border-warning/25">
            <Keyboard size={28} className="text-warning" />
          </div>
          <p className="text-[15px] font-bold mb-1">Enter Ticket Details</p>
          <p className="text-[11px] text-white/40">Type in your ticket number from the notice</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-5 mt-2">
          <div>
            <p className="text-[10.5px] text-white/40 mb-1.5 font-medium">TICKET NUMBER</p>
            <input 
              type="text" 
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value.toUpperCase())}
              placeholder="TKT-XXXX" 
              className="w-full bg-white/5 border border-white/10 rounded-[10px] p-3 text-[15px] text-white outline-none focus:border-primary transition-colors tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-white/30"
              required
            />
          </div>
          <div>
            <p className="text-[10.5px] text-white/40 mb-1.5 font-medium">AMOUNT DUE</p>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$0.00" 
              className="w-full bg-white/5 border border-white/10 rounded-[10px] p-3 text-[14px] text-white outline-none focus:border-primary transition-colors placeholder:text-white/30"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <p className="text-[10.5px] text-white/40 mb-1.5 font-medium">NOTE (OPTIONAL)</p>
            <textarea 
              rows={2}
              placeholder="Add a note..." 
              className="w-full bg-white/5 border border-white/10 rounded-[10px] p-3 text-[13px] text-white outline-none focus:border-primary transition-colors resize-none placeholder:text-white/30"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !invoiceId || !amount}
            className="w-full mt-2 p-[13px] rounded-xl bg-primary text-white text-[14px] font-semibold border-none flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Look Up Ticket'} 
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
          <button 
            type="button"
            onClick={() => router.back()}
            className="w-full p-3 rounded-xl bg-white/5 text-white text-[13px] border border-white/10 flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { TopBar } from '@/components/TopBar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppPage() {
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'whatsapp', text: 'Sent via WhatsApp' })
      });
      const data = await res.json();
      if (data.workflowId) {
        router.push(`/process?workflowId=${data.workflowId}`);
      }
    } catch (e) {
      console.error(e);
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <TopBar title="WhatsApp Pay" />
      
      <div className="p-4 pb-[30px] pt-2">
        <div className="text-center py-[18px]">
          <div className="w-[68px] h-[68px] rounded-full bg-[#25D166]/10 mx-auto mb-2.5 flex items-center justify-center border-[1.5px] border-[#25D166]/30">
            <MessageCircle size={32} className="text-[#25D166]" />
          </div>
          <p className="text-[16px] font-bold mb-1">Pay via WhatsApp</p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            We'll send a secure payment link<br/>directly to your WhatsApp
          </p>
        </div>

        <div className="flex flex-col gap-[11px] mb-5">
          <div>
            <p className="text-[10.5px] text-white/40 mb-[5px] font-medium">WHATSAPP NUMBER</p>
            <input className="w-full bg-white/5 border border-white/10 rounded-[10px] p-[11px] px-3 text-[13px] text-white outline-none focus:border-primary transition-colors placeholder:text-white/30" placeholder="+1 (555) 000-0000" type="tel" />
          </div>
          <div>
            <p className="text-[10.5px] text-white/40 mb-[5px] font-medium">TICKET / REFERENCE NO.</p>
            <input className="w-full bg-white/5 border border-white/10 rounded-[10px] p-[11px] px-3 text-[13px] text-white outline-none focus:border-primary transition-colors placeholder:text-white/30" placeholder="e.g. TKT-4821" />
          </div>
          <div>
            <p className="text-[10.5px] text-white/40 mb-[5px] font-medium">AMOUNT DUE</p>
            <input className="w-full bg-white/5 border border-white/10 rounded-[10px] p-[11px] px-3 text-[13px] text-white outline-none focus:border-primary transition-colors placeholder:text-white/30" placeholder="$0.00" type="number" />
          </div>
          <div>
            <p className="text-[10.5px] text-white/40 mb-[5px] font-medium">NOTE (OPTIONAL)</p>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-[10px] p-[11px] px-3 text-[13px] text-white outline-none focus:border-primary transition-colors resize-none placeholder:text-white/30" rows={2} placeholder="Add a note..."></textarea>
          </div>
        </div>

        <button 
          onClick={handleSend}
          disabled={isSending}
          className="w-full p-[13px] rounded-xl bg-[#25D166] text-white text-[14px] font-semibold border-none flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-[9px] disabled:opacity-50"
        >
          <MessageCircle size={18} /> {isSending ? 'Sending...' : 'Send Payment Link'}
        </button>
        <button 
          onClick={() => router.back()}
          className="w-full p-3 rounded-xl bg-white/5 text-white text-[13px] border border-white/10 flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

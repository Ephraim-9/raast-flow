"use client";
import { TopBar } from '@/components/TopBar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send } from 'lucide-react';

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
    <div className="flex flex-col h-screen bg-[#EFEAE2]">
      <div className="h-14 bg-[#00A884] text-white flex items-center px-4 shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
          <MessageCircle size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-lg leading-tight">Raast-Flow Bot</h1>
          <p className="text-[11px] text-white/80 leading-tight">Online</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end space-y-4">
        {/* Mock chat bubble */}
        <div className="bg-white p-3 rounded-lg rounded-tl-none self-start max-w-[80%] shadow-sm text-sm">
          Welcome to Raast-Flow. Please forward your payment receipt to begin reconciliation.
        </div>
        
        {/* Mock user input ready to send */}
        <div className="bg-[#D9FDD3] p-2 rounded-lg rounded-tr-none self-end max-w-[80%] shadow-sm flex flex-col">
          <div className="w-full aspect-square bg-gray-200 rounded mb-1 flex items-center justify-center overflow-hidden relative">
            {/* Mock image placeholder */}
            <div className="absolute inset-0 bg-[url('https://via.placeholder.com/150')] bg-cover opacity-50"></div>
            <span className="text-xs text-gray-500 z-10 font-medium">Receipt.jpg</span>
          </div>
          <span className="text-xs text-right text-gray-500">10:42 AM</span>
        </div>
      </div>

      <div className="p-2 bg-[#F0F2F5] shrink-0 flex items-center gap-2">
        <div className="flex-1 bg-white rounded-full h-10 px-4 flex items-center text-gray-400 text-sm shadow-sm">
          Message
        </div>
        <button 
          onClick={handleSend}
          disabled={isSending}
          className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-sm shrink-0 hover:bg-[#008F6F]"
        >
          <Send size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
}

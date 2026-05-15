"use client";
import { TopBar } from '@/components/TopBar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="p-4 mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Number</label>
            <input 
              type="text" 
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value.toUpperCase())}
              placeholder="e.g. INV-1001" 
              className="w-full p-3 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-text-secondary">Rs.</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full p-3 pl-10 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !invoiceId || !amount}
            className="w-full bg-primary text-white font-medium p-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 mt-8"
          >
            {isSubmitting ? 'Processing...' : 'Verify Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { TopBar } from '@/components/TopBar';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ProcessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');

  const { data, error } = useSWR(
    workflowId ? `/api/workflow/${workflowId}/status` : null, 
    fetcher, 
    { refreshInterval: 1000 }
  );

  useEffect(() => {
    if (data?.status === 'completed' || data?.status === 'failed') {
      setTimeout(() => {
        router.push(`/result?workflowId=${workflowId}`);
      }, 1500);
    }
  }, [data, router, workflowId]);

  if (!workflowId) return <div className="p-4 pt-[70px] text-center text-white/50 text-[13px]">No workflow ID provided</div>;
  if (error) return <div className="p-4 pt-[70px] text-center text-danger text-[13px]">Error loading workflow status</div>;

  const currentStep = data?.currentStep || 1;
  const agents = data?.agents || [];

  const steps = [
    { num: 1, title: 'Extracting Details', desc: 'Reading amount & reference' },
    { num: 2, title: 'Database Lookup', desc: 'Searching internal records' },
    { num: 3, title: 'Payment Verification', desc: 'Matching payment vs invoice' },
    { num: 4, title: 'Action Decision', desc: 'Determining next steps' },
    { num: 5, title: 'System Update', desc: 'Updating warehouse status' },
  ];

  const pct = Math.min(100, Math.round(((currentStep - 1) / steps.length) * 100));

  return (
    <div className="p-4 pt-2">
      <div className="text-center py-6">
        <div className="relative w-[80px] h-[80px] mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="40" cy="40" r="39" 
              fill="none" 
              stroke="#6C5CE7" 
              strokeWidth="2" 
              strokeDasharray="245" 
              strokeDashoffset={245 - (245 * pct) / 100}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <Sparkles size={24} className="text-primary animate-pulse" />
        </div>
        <p className="text-[17px] font-bold mb-1">AI Processing</p>
        <p className="text-[12px] text-white/40">{pct}% Complete</p>
      </div>

      <div className="bg-surface rounded-2xl p-5 border border-white/5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>

        <div className="relative border-l-2 border-white/10 ml-3 space-y-[22px] py-1">
          {steps.map((step) => {
            const agentData = agents.find((a: any) => a.order === step.num);
            const status = agentData?.status || (currentStep > step.num ? 'completed' : currentStep === step.num ? 'running' : 'pending');
            
            let icon;
            if (status === 'completed') {
              icon = <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center absolute -left-[13px] shadow-[0_0_10px_rgba(37,209,102,0.3)]"><CheckCircle2 size={14} className="text-white" /></div>;
            } else if (status === 'running') {
              icon = <div className="w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center absolute -left-[13px] shadow-[0_0_10px_rgba(108,92,231,0.3)]"><Loader2 size={12} className="text-primary animate-spin" /></div>;
            } else {
              icon = <div className="w-6 h-6 rounded-full border-2 border-white/10 bg-surface absolute -left-[13px]"></div>;
            }

            return (
              <div key={step.num} className="relative pl-7 transition-opacity duration-300" style={{ opacity: status === 'pending' ? 0.4 : 1 }}>
                {icon}
                <div className="flex flex-col">
                  <span className={`font-semibold text-[13px] ${status === 'running' ? 'text-white' : 'text-white/80'}`}>{step.title}</span>
                  <span className="text-[10px] text-white/40 mt-0.5">{step.desc}</span>
                  
                  {status === 'completed' && agentData?.reasoning && (
                    <div className="mt-2 text-[10px] bg-white/5 px-2.5 py-2 rounded-lg text-white/60 font-mono border border-white/5">
                      &gt; {agentData.reasoning}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <TopBar title="Processing..." />
      <Suspense fallback={<div className="p-4 pt-[70px] text-center text-[12px] text-white/50">Loading...</div>}>
        <ProcessContent />
      </Suspense>
    </div>
  );
}

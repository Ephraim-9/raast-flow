"use client";
import { TopBar } from '@/components/TopBar';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleDashed, Check } from 'lucide-react';
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

  if (!workflowId) return <div className="p-4 mt-14">No workflow ID provided</div>;
  if (error) return <div className="p-4 mt-14">Error loading workflow status</div>;

  const currentStep = data?.currentStep || 1;
  const agents = data?.agents || [];

  const steps = [
    { num: 1, title: 'Parser Agent', desc: 'Extracting amount & reference' },
    { num: 2, title: 'Lookup Agent', desc: 'Searching internal database' },
    { num: 3, title: 'Matcher Agent', desc: 'Verifying payment vs invoice' },
    { num: 4, title: 'Decision Agent', desc: 'Determining next action' },
    { num: 5, title: 'Simulator Agent', desc: 'Updating warehouse status' },
  ];

  return (
    <div className="p-4 mt-4 space-y-6">
      <div className="bg-surface rounded-xl p-4 shadow-sm border border-border">
        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 py-2">
          {steps.map((step) => {
            const agentData = agents.find((a: any) => a.order === step.num);
            const status = agentData?.status || (currentStep > step.num ? 'completed' : currentStep === step.num ? 'running' : 'pending');
            
            let icon;
            if (status === 'completed') {
              icon = <CheckCircle2 size={24} className="text-secondary bg-surface absolute -left-3.5 fill-green-50" />;
            } else if (status === 'running') {
              icon = <CircleDashed size={24} className="text-primary bg-surface absolute -left-3.5 animate-spin" />;
            } else {
              icon = <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-surface absolute -left-[13px]"></div>;
            }

            return (
              <div key={step.num} className="relative pl-6">
                {icon}
                <div className="flex flex-col">
                  <span className={`font-semibold text-sm ${status === 'pending' ? 'text-gray-400' : 'text-text-primary'}`}>{step.title}</span>
                  <span className="text-xs text-text-secondary mt-0.5">{step.desc}</span>
                  
                  {status === 'completed' && agentData?.reasoning && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-text-secondary font-mono">
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
    <div className="min-h-screen bg-background">
      <TopBar title="Processing..." />
      <Suspense fallback={<div className="p-4 mt-14">Loading...</div>}>
        <ProcessContent />
      </Suspense>
    </div>
  );
}

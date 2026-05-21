"use client";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TopBar({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="h-10 flex items-center justify-between px-4 sticky top-0 z-10 bg-background pt-2">
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => router.back()} 
          className="w-[30px] h-[30px] rounded-full bg-white/10 flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={15} className="text-white" />
        </button>
        <p className="text-[15px] font-semibold text-white">{title}</p>
      </div>
    </div>
  );
}

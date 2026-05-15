"use client";
import { TopBar } from '@/components/TopBar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CameraPage() {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleCapture = async () => {
    setIsUploading(true);
    // Simulate image capture and API call
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'image', text: 'Scanned image with INV-1001 and amount 25000' })
      });
      const data = await res.json();
      if (data.workflowId) {
        router.push(`/process?workflowId=${data.workflowId}`);
      }
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <TopBar title="Scan Document" />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        {/* Viewfinder simulation */}
        <div className="w-64 h-80 border-2 border-white/50 rounded-xl relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
        </div>
      </div>

      <div className="h-32 bg-black flex items-center justify-center pb-safe">
        <button 
          onClick={handleCapture}
          disabled={isUploading}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:bg-white/20 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-white"></div>
        </button>
      </div>
    </div>
  );
}

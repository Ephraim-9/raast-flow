"use client";
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

function CameraContent() {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isGallery = searchParams.get('gallery') === 'true';
  const isFromHome = searchParams.get('source') === 'home';

  useEffect(() => {
    // Check for image data passed from Home screen
    const pendingData = sessionStorage.getItem('pending_capture');
    const pendingFile = sessionStorage.getItem('pending_filename');
    
    if (pendingData) {
      setPreview(pendingData);
      sessionStorage.removeItem('pending_capture');
      sessionStorage.removeItem('pending_filename');
      
      // Convert Data URL to Blob
      let arr = pendingData.split(','), mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type:mime});
      
      startProcessing(pendingFile || 'image.png', blob);
    } else if (fileInputRef.current && (isGallery || !isFromHome)) {
      if (isGallery) fileInputRef.current.click();
    }
  }, [isGallery, isFromHome]);

  const startProcessing = async (fileName: string, file: File | Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('inputType', 'image');
      formData.append('file', file);

      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    await startProcessing(file.name, file);
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 bg-[#040408] text-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-[46px] pb-[14px] px-4 flex justify-between items-center bg-gradient-to-b from-[#040408]/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button 
            onClick={() => router.back()}
            className="w-[30px] h-[30px] rounded-full bg-white/15 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <p className="text-[15px] font-semibold">Scan QR Code</p>
        </div>
        <Zap size={21} className="text-warning pointer-events-auto" />
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture={isGallery ? undefined : "environment"}
        className="hidden"
      />

      {preview ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-60" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="font-medium animate-pulse text-sm">Extracting details...</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Grid overlay */}
          <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.12] pointer-events-none">
            <line x1="33.3%" y1="0" x2="33.3%" y2="100%" stroke="#fff" strokeWidth=".5"/>
            <line x1="66.6%" y1="0" x2="66.6%" y2="100%" stroke="#fff" strokeWidth=".5"/>
            <line x1="0" y1="33.3%" x2="100%" y2="33.3%" stroke="#fff" strokeWidth=".5"/>
            <line x1="0" y1="66.6%" x2="100%" y2="66.6%" stroke="#fff" strokeWidth=".5"/>
          </svg>

          {/* Scan frame */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] w-[200px] h-[200px] pointer-events-none">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-[26px] h-[26px] border-t-[3px] border-l-[3px] border-primary rounded-tl-[4px]"></div>
            <div className="absolute top-0 right-0 w-[26px] h-[26px] border-t-[3px] border-r-[3px] border-primary rounded-tr-[4px]"></div>
            <div className="absolute bottom-0 left-0 w-[26px] h-[26px] border-b-[3px] border-l-[3px] border-primary rounded-bl-[4px]"></div>
            <div className="absolute bottom-0 right-0 w-[26px] h-[26px] border-b-[3px] border-r-[3px] border-primary rounded-br-[4px]"></div>
            
            {/* Scanning line */}
            <div className="absolute left-[6px] right-[6px] h-[2px] bg-primary/90 shadow-[0_0_8px_rgba(108,92,231,0.6)] animate-scanl"></div>
            
            {/* Faint QR placeholder */}
            <div className="absolute inset-6 opacity-[0.12]">
              <svg viewBox="0 0 80 80" fill="#fff" width="100%" height="100%">
                <rect x="2" y="2" width="28" height="28" rx="3"/><rect x="7" y="7" width="18" height="18" rx="1" fill="#040408"/><rect x="10" y="10" width="12" height="12"/>
                <rect x="50" y="2" width="28" height="28" rx="3"/><rect x="55" y="7" width="18" height="18" rx="1" fill="#040408"/><rect x="58" y="10" width="12" height="12"/>
                <rect x="2" y="50" width="28" height="28" rx="3"/><rect x="7" y="55" width="18" height="18" rx="1" fill="#040408"/><rect x="10" y="58" width="12" height="12"/>
                <rect x="50" y="38" width="8" height="8" rx="1"/><rect x="62" y="38" width="8" height="8" rx="1"/><rect x="50" y="50" width="8" height="8" rx="1"/><rect x="62" y="50" width="8" height="8" rx="1"/><rect x="72" y="38" width="8" height="8" rx="1"/>
                <rect x="38" y="2" width="8" height="8" rx="1"/><rect x="38" y="14" width="8" height="8" rx="1"/><rect x="38" y="26" width="8" height="8" rx="1"/>
                <rect x="2" y="38" width="8" height="8" rx="1"/><rect x="14" y="38" width="8" height="8" rx="1"/><rect x="26" y="38" width="8" height="8" rx="1"/>
                <rect x="62" y="62" width="8" height="8" rx="1"/><rect x="72" y="50" width="8" height="8" rx="1"/>
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 pt-16 px-4 pb-7 bg-gradient-to-t from-[#040408]/95 via-[#040408]/80 to-transparent">
        <p className="text-center text-[12px] text-white/40 mb-3.5">Position QR code within the frame</p>
        <div className="flex gap-[9px]">
          <Link href="/manual" className="flex-1 py-3 rounded-xl bg-white/5 border border-white/20 text-[13px] text-center font-medium hover:bg-white/10 transition-colors">
            Manual Entry
          </Link>
          <button onClick={triggerInput} className="flex-1 py-3 rounded-xl bg-primary text-[14px] font-semibold text-center hover:opacity-90 transition-opacity">
            Select Photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#040408] text-white">Loading...</div>}>
      <CameraContent />
    </Suspense>
  );
}


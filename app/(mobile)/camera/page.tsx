"use client";
import { TopBar } from '@/components/TopBar';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

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
      startProcessing(pendingFile || 'image.png');
    } else if (fileInputRef.current && (isGallery || !isFromHome)) {
      // If we didn't come from Home with data, or it's gallery mode, trigger picker
      // (Direct navigation to /camera still allows manual trigger)
      if (isGallery) fileInputRef.current.click();
    }
  }, [isGallery, isFromHome]);

  const startProcessing = async (fileName: string) => {
    setIsUploading(true);
    try {
      // Simulate network delay for processing/OCR
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputType: 'image', 
          fileName: fileName,
          text: `Processed ${fileName}. Found INV-1001 for amount 25000.` // Mock OCR result
        })
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

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    await startProcessing(file.name);
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <TopBar title={isGallery ? "Upload Receipt" : "Scan Receipt"} />
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture={isGallery ? undefined : "environment"}
        className="hidden"
      />

      <div className="flex-1 flex items-center justify-center p-6">
        {preview ? (
          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary/50 shadow-2xl">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="font-medium animate-pulse">Extracting payment details...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-64 h-80 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center space-y-4 text-white/50 cursor-pointer" onClick={triggerInput}>
            {isGallery ? <ImageIcon size={48} /> : <Camera size={48} />}
            <p className="text-sm font-medium">
              {isGallery ? "Choose from gallery" : "Align receipt in frame"}
            </p>
          </div>
        )}
      </div>

      <div className="h-40 bg-black flex flex-col items-center justify-center space-y-4 pb-safe">
        {!preview && (
          <button 
            onClick={triggerInput}
            disabled={isUploading}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:bg-white/20 transition-all hover:scale-105"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black">
               {isGallery ? <ImageIcon size={28} /> : <div className="w-12 h-12 rounded-full border-2 border-black/10" />}
            </div>
          </button>
        )}
        
        {preview && !isUploading && (
          <button 
            onClick={() => setPreview(null)}
            className="text-white/70 text-sm font-medium underline"
          >
            Retake Photo
          </button>
        )}
      </div>
    </div>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>}>
      <CameraContent />
    </Suspense>
  );
}


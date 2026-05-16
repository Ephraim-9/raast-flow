"use client";
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Edit3, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'camera' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file and store in sessionStorage for the camera page to pick up
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      sessionStorage.setItem('pending_capture', imageData);
      sessionStorage.setItem('pending_filename', file.name);
      router.push(`/camera?mode=${mode}&source=home`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="p-4 space-y-6">
      <header className="pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">New Reconciliation</h1>
        <p className="text-text-secondary text-sm mt-1">Select payment proof type to begin</p>
      </header>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={(e) => handleFileChange(e, 'camera')} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={(e) => handleFileChange(e, 'gallery')} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Card: Camera */}
        <button 
          onClick={() => cameraInputRef.current?.click()}
          className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center aspect-square space-y-3 hover:border-primary transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center">
            <Camera size={24} />
          </div>
          <span className="font-medium text-sm">Take Photo</span>
        </button>
        
        {/* Card: Gallery */}
        <button 
          onClick={() => galleryInputRef.current?.click()}
          className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center aspect-square space-y-3 hover:border-primary transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center">
            <FileText size={24} />
          </div>
          <span className="font-medium text-sm">Upload File</span>
        </button>

        {/* Card: WhatsApp Forward */}
        <Link href="/whatsapp" className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center aspect-square space-y-3 hover:border-secondary transition-colors">
          <div className="w-12 h-12 rounded-full bg-green-50 text-secondary flex items-center justify-center">
            <MessageCircle size={24} />
          </div>
          <span className="font-medium text-sm">WhatsApp</span>
        </Link>

        {/* Card: Manual Entry */}
        <Link href="/manual" className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center aspect-square space-y-3 hover:border-text-secondary transition-colors">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-text-secondary flex items-center justify-center">
            <Edit3 size={24} />
          </div>
          <span className="font-medium text-sm">Manual</span>
        </Link>
      </div>
    </main>
  );
}


import Link from 'next/link';
import { Camera, Edit3, MessageCircle, FileText } from 'lucide-react';

export default function Home() {
  return (
    <main className="p-4 space-y-6">
      <header className="pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">New Reconciliation</h1>
        <p className="text-text-secondary text-sm mt-1">Select payment proof type to begin</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {/* Card: Camera */}
        <Link href="/camera" className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center aspect-square space-y-3 hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center">
            <Camera size={24} />
          </div>
          <span className="font-medium text-sm">Take Photo</span>
        </Link>
        
        {/* Card: Gallery (Mocked as WhatsApp input style for now, since we only need 4 paths) */}
        <Link href="/camera?gallery=true" className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center aspect-square space-y-3 hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center">
            <FileText size={24} />
          </div>
          <span className="font-medium text-sm">Upload File</span>
        </Link>

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

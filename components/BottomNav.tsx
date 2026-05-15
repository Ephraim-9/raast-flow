"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  
  // Only show on root and history
  if (pathname !== '/' && pathname !== '/history') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex justify-around items-center px-4 pb-safe z-50">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-primary' : 'text-text-secondary'}`}>
        <Home size={24} />
        <span className="text-xs font-medium">Home</span>
      </Link>
      <Link href="/history" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/history' ? 'text-primary' : 'text-text-secondary'}`}>
        <Clock size={24} />
        <span className="text-xs font-medium">History</span>
      </Link>
    </div>
  );
}

"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChartBar, Plus, Ticket, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  
  // Define where bottom nav should show (basically everything except deep flows)
  const showNav = pathname === '/' || pathname === '/history' || pathname === '/profile';

  if (!showNav) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto h-[66px] bg-[#0D0E20] border-t border-white/10 flex items-center justify-around px-2 pb-2 z-50">
      <Link href="/" className={`flex flex-col items-center gap-1 cursor-pointer ${pathname === '/' ? 'text-primary' : 'text-white/30'}`}>
        <Home size={19} />
        <p className="text-[9px]">Home</p>
      </Link>
      
      <Link href="/history" className={`flex flex-col items-center gap-1 cursor-pointer ${pathname === '/history' ? 'text-primary' : 'text-white/30'}`}>
        <ChartBar size={19} />
        <p className="text-[9px]">Stats</p>
      </Link>

      <Link href="/manual" className="flex flex-col items-center gap-1 cursor-pointer">
        <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center -mt-[18px]">
          <Plus size={21} className="text-white" />
        </div>
        <span className="text-[9px] text-white/30">Pay</span>
      </Link>

      <div className="flex flex-col items-center gap-1 cursor-pointer text-white/30">
        <Ticket size={19} />
        <p className="text-[9px]">Tickets</p>
      </div>

      <div className="flex flex-col items-center gap-1 cursor-pointer text-white/30">
        <User size={19} />
        <p className="text-[9px]">Profile</p>
      </div>
    </div>
  );
}

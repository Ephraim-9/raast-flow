import { BottomNav } from '@/components/BottomNav';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090A17] relative max-w-[480px] mx-auto text-white overflow-x-hidden pt-1">
      <OfflineBanner />
      {children}
      <BottomNav />
    </div>
  );
}


import { BottomNav } from '@/components/BottomNav';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090A17] relative max-w-[480px] mx-auto text-white overflow-x-hidden">
      {children}
      <BottomNav />
    </div>
  );
}

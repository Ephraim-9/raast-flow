import { BottomNav } from '@/components/BottomNav';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 bg-background relative max-w-md mx-auto sm:border-x sm:border-border sm:shadow-sm">
      {children}
      <BottomNav />
    </div>
  );
}

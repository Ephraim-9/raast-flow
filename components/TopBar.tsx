import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function TopBar({ title }: { title: string }) {
  return (
    <div className="h-14 border-b border-border bg-surface flex items-center px-4 sticky top-0 z-10">
      <Link href="/" className="mr-4 text-text-secondary hover:text-text-primary">
        <ArrowLeft size={24} />
      </Link>
      <h1 className="font-semibold text-lg">{title}</h1>
    </div>
  );
}

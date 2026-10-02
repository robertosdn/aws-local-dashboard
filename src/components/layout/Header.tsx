import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { navigation } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useEndpointStatus } from '@/lib/useEndpointStatus';

export function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const location = useLocation();
  const currentItem = navigation.find((item) => item.path === location.pathname) ?? navigation[0];
  const { isOnline, isChecking } = useEndpointStatus();
  const statusLabel = isChecking ? 'Checking...' : isOnline ? 'ONLINE' : 'OFFLINE';
  const statusTone = isChecking
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : isOnline
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : 'border-red-500/30 bg-red-500/10 text-red-300';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-400">
              AWS Local
            </p>
            <h1 className="text-lg font-semibold text-slate-50 md:text-xl">{currentItem.label}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(`hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium md:flex`, statusTone)}>
            <span className={cn('h-2.5 w-2.5 rounded-full', isOnline ? 'bg-emerald-400' : isChecking ? 'bg-amber-400' : 'bg-red-400')} />
            {statusLabel}
          </div>
          <Button type="button" variant="secondary" size="sm">
            Local Stack
          </Button>
        </div>
      </div>
    </header>
  );
}

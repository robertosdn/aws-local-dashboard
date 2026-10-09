import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { navigation } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useEndpointStatus } from '@/lib/useEndpointStatus';
import { useSettings } from '@/features/settings/hooks/useSettings';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { endpoint, settings } = useSettings();
  const { isOnline, isChecking } = useEndpointStatus(endpoint);
  const statusLabel = isChecking ? 'Checking...' : isOnline ? 'ONLINE' : 'OFFLINE';
  const statusTone = isChecking
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : isOnline
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : 'border-red-500/30 bg-red-500/10 text-red-300';

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/80 transition-opacity duration-200 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950/95 transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 lg:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">AWS</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Local Dashboard</h2>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-b border-slate-800 p-4">
          <div className={cn('rounded-xl border p-3', statusTone)}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-current">
                Endpoint
              </span>
              <span className="rounded-full bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-current">
                {statusLabel}
              </span>
            </div>
            <p className="mt-2 break-all text-sm font-medium text-slate-50">{endpoint}</p>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {navigation.map(({ path, label, icon: Icon, comingSoon, disabled }) => (
              <NavLink
                key={path}
                to={path}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
                onClick={(event) => {
                  if (disabled) {
                    event.preventDefault();
                    return;
                  }
                  onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/30'
                      : disabled
                        ? 'cursor-not-allowed text-slate-500'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {comingSoon && (
                  <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                    Soon
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <Separator className="my-4 bg-slate-800" />

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
              Local context
            </p>
            <p className="mt-2 text-sm text-slate-200">Region: {settings.region}</p>
            <p className="mt-1 text-sm text-slate-200">Mode: emulator</p>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

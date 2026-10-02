import { useEndpointStatus } from '@/lib/useEndpointStatus';
import { useSettings } from '@/features/settings/hooks/useSettings';

export default function DashboardPage() {
  const { endpoint, settings } = useSettings();
  const { isOnline, isChecking } = useEndpointStatus(endpoint);
  const statusText = isChecking ? 'Checking...' : isOnline ? 'ONLINE' : 'OFFLINE';
  const statusTone = isChecking
    ? 'text-amber-400'
    : isOnline
      ? 'text-emerald-400'
      : 'text-red-400';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Overview</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Local AWS resource overview and connection status for the current emulator session.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Endpoint</p>
          <p className="mt-2 break-all text-lg font-medium text-white">{endpoint}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Region</p>
          <p className="mt-2 text-lg font-medium text-white">{settings.region}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Status</p>
          <p className={`mt-2 text-lg font-medium ${statusTone}`}>{statusText}</p>
        </div>
      </div>
    </div>
  );
}

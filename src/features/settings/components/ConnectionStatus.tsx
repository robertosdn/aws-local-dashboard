interface ConnectionStatusProps {
  endpoint: string;
  isOnline: boolean;
  isChecking: boolean;
  lastTestedAt: Date | null;
}

export function ConnectionStatus({
  endpoint,
  isOnline,
  isChecking,
  lastTestedAt,
}: ConnectionStatusProps) {
  const statusText = isChecking ? 'Checking...' : isOnline ? 'ONLINE' : 'OFFLINE';
  const statusTone = isChecking
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : isOnline
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : 'border-red-500/30 bg-red-500/10 text-red-300';

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Connection status</h3>
          <p className="mt-1 break-all font-mono text-sm text-slate-400">{endpoint}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
          {statusText}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {lastTestedAt
          ? `Last tested: ${lastTestedAt.toLocaleString()}`
          : 'Endpoint is checked automatically every 5 seconds.'}
      </p>
    </section>
  );
}
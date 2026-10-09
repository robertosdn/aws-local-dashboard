import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <Card aria-live="polite">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Connection status</h3>
            <p className="mt-1 break-all font-mono text-sm text-slate-400">{endpoint}</p>
          </div>
          <Badge
            variant={isChecking ? 'outline' : isOnline ? 'success' : 'destructive'}
            className={isChecking ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : ''}
          >
            {statusText}
          </Badge>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {lastTestedAt
            ? `Last tested: ${lastTestedAt.toLocaleString()}`
            : 'Endpoint is checked automatically every 5 seconds.'}
        </p>
      </CardContent>
    </Card>
  );
}

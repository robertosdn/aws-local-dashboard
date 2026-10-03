import { useEndpointStatus } from '@/lib/useEndpointStatus';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { endpoint, settings } = useSettings();
  const { isOnline, isChecking } = useEndpointStatus(endpoint);
  const statusText = isChecking ? 'Checking...' : isOnline ? 'ONLINE' : 'OFFLINE';
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Overview</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Local AWS resource overview and connection status for the current emulator session.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">Endpoint</p>
            <p className="mt-2 break-all text-lg font-medium text-white">{endpoint}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">Region</p>
            <p className="mt-2 text-lg font-medium text-white">{settings.region}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-start gap-2 p-5">
            <p className="text-sm text-slate-400">Status</p>
            <Badge variant={isChecking ? 'outline' : isOnline ? 'success' : 'destructive'}>
              {statusText}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

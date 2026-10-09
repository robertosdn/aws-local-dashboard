import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ScheduleGroupDetail } from '../types/scheduler';

interface ScheduleGroupDetailsProps {
  scheduleGroupDetails?: ScheduleGroupDetail;
  loading: boolean;
  onBack: () => void;
  onViewSchedules: () => void;
}

function formatDate(value?: Date) {
  return value ? format(value, 'yyyy-MM-dd HH:mm:ss') : 'Unknown';
}

export function ScheduleGroupDetails({
  scheduleGroupDetails,
  loading,
  onBack,
  onViewSchedules,
}: ScheduleGroupDetailsProps) {
  if (loading || !scheduleGroupDetails) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Button variant="outline" onClick={onBack}>
            Back to schedule groups
          </Button>
        </div>
        <Card className="space-y-4 bg-slate-900/50 p-6">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            EventBridge Scheduler
          </p>
          <h3 className="mt-1 break-all font-mono text-xl font-semibold text-white">
            {scheduleGroupDetails.name}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onViewSchedules}>
            View schedules
          </Button>
          <Button variant="ghost" onClick={onBack}>
            Back to schedule groups
          </Button>
        </div>
      </div>

      <Card className="space-y-5 bg-slate-900/50 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Name
            </label>
            <p className="mt-1 break-all font-mono text-white">{scheduleGroupDetails.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Created
            </label>
            <p className="mt-1 text-white">{formatDate(scheduleGroupDetails.createdAt)}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Last modified
            </label>
            <p className="mt-1 text-white">{formatDate(scheduleGroupDetails.lastModifiedAt)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              ARN
            </label>
            <p className="mt-1 break-all font-mono text-xs text-slate-300">
              {scheduleGroupDetails.arn || 'Unknown'}
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}

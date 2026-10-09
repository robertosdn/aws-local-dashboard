import { format } from 'date-fns';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ScheduleExpressionDisplay,
  ScheduleTargetDisplay,
  useScheduleDetails,
} from '@/features/eventbridge';

function formatDate(value?: Date) {
  return value ? format(value, 'yyyy-MM-dd HH:mm:ss') : 'Not set';
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-300">{children}</div>
    </div>
  );
}

export default function SchedulerScheduleDetailPage() {
  const { groupName, scheduleName } = useParams<{ groupName: string; scheduleName: string }>();
  const navigate = useNavigate();
  const details = useScheduleDetails(groupName ?? null, scheduleName ?? null);

  const goBack = () =>
    navigate(`/eventbridge/scheduler/groups/${encodeURIComponent(groupName ?? '')}/schedules`);

  if (details.error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6" role="alert">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">
            EventBridge Scheduler
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Schedule not found</h2>
          <p className="mt-4 break-all text-sm text-slate-300">
            {details.error instanceof Error
              ? details.error.message
              : 'Unable to load this schedule.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void details.refetch()}>
              Retry
            </Button>
            <Button variant="ghost" onClick={goBack}>
              Back to schedules
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (details.loading || !details.scheduleDetails) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Button variant="outline" onClick={goBack}>
            Back to schedules
          </Button>
        </div>
        <Card className="space-y-4 bg-slate-900/50 p-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </Card>
      </section>
    );
  }

  const schedule = details.scheduleDetails;

  return (
    <div className="min-w-0 space-y-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              EventBridge Scheduler
            </p>
            <h3 className="mt-1 break-all font-mono text-xl font-semibold text-white">
              {schedule.name}
            </h3>
          </div>
          <Button variant="outline" onClick={goBack}>
            Back to schedules
          </Button>
        </div>

        <Card className="space-y-5 bg-slate-900/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Name">
              <p className="break-all font-mono">{schedule.name}</p>
            </Field>
            <Field label="State">
              <Badge variant={schedule.state === 'ENABLED' ? 'success' : 'secondary'}>
                {schedule.state}
              </Badge>
            </Field>
            <Field label="Group">
              <p className="break-all font-mono">{schedule.groupName}</p>
            </Field>
            <Field label="Action after completion">
              <p>{schedule.actionAfterCompletion ?? 'NONE'}</p>
            </Field>
            <Field label="ARN">
              <p className="break-all font-mono text-xs">{schedule.arn || 'Unknown'}</p>
            </Field>
            <Field label="Last modified">
              <p>{formatDate(schedule.lastModifiedAt)}</p>
            </Field>
            {schedule.description ? (
              <div className="md:col-span-2">
                <Field label="Description">
                  <p>{schedule.description}</p>
                </Field>
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Field label="Schedule expression">
                <ScheduleExpressionDisplay
                  expression={schedule.scheduleExpression}
                  timezone={schedule.scheduleExpressionTimezone}
                />
              </Field>
            </div>
            <Field label="Start date">
              <p>{formatDate(schedule.startDate)}</p>
            </Field>
            <Field label="End date">
              <p>{formatDate(schedule.endDate)}</p>
            </Field>
            <Field label="Flexible time window">
              <p>
                {schedule.flexibleTimeWindow
                  ? `${schedule.flexibleTimeWindow.mode}${
                      schedule.flexibleTimeWindow.maximumWindowInMinutes
                        ? ` · up to ${schedule.flexibleTimeWindow.maximumWindowInMinutes} minutes`
                        : ''
                    }`
                  : 'Not set'}
              </p>
            </Field>
            {schedule.kmsKeyArn ? (
              <Field label="KMS key ARN">
                <p className="break-all font-mono text-xs">{schedule.kmsKeyArn}</p>
              </Field>
            ) : null}
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Target</h3>
        <Card className="bg-slate-900/50 p-6">
          <ScheduleTargetDisplay target={schedule.target} />
        </Card>
      </section>
    </div>
  );
}

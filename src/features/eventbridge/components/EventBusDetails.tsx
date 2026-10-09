import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { EventBusDetail } from '../types/eventbridge';
import { EventBusPolicyDisplay } from './EventBusPolicyDisplay';

interface EventBusDetailsProps {
  eventBusDetails?: EventBusDetail;
  loading: boolean;
  onBack: () => void;
}

export function EventBusDetails({ eventBusDetails, loading, onBack }: EventBusDetailsProps) {
  if (loading || !eventBusDetails) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Button variant="outline" onClick={onBack}>
            Back to event buses
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
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">EventBridge</p>
          <h3 className="mt-1 break-all font-mono text-xl font-semibold text-white">
            {eventBusDetails.name}
          </h3>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to event buses
        </Button>
      </div>

      <Card className="space-y-5 bg-slate-900/50 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Name
            </label>
            <p className="mt-1 break-all font-mono text-white">{eventBusDetails.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Created
            </label>
            <p className="mt-1 text-white">
              {eventBusDetails.createdAt
                ? format(eventBusDetails.createdAt, 'yyyy-MM-dd HH:mm:ss')
                : 'Unknown'}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              ARN
            </label>
            <p className="mt-1 break-all font-mono text-xs text-slate-300">
              {eventBusDetails.arn || 'Unknown'}
            </p>
          </div>
          {eventBusDetails.description ? (
            <div className="md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Description
              </label>
              <p className="mt-1 text-slate-300">{eventBusDetails.description}</p>
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Policy
          </label>
          <EventBusPolicyDisplay policy={eventBusDetails.policy} />
        </div>
      </Card>
    </section>
  );
}

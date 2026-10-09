import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScheduleTable, useSchedules } from '@/features/eventbridge';
import type { ScheduleState } from '@/features/eventbridge';

type ScheduleStateFilter = 'all' | ScheduleState;

export default function SchedulerSchedulesPage() {
  const { groupName } = useParams<{ groupName: string }>();
  const navigate = useNavigate();
  const [stateFilter, setStateFilter] = useState<ScheduleStateFilter>('all');
  const [pageTokens, setPageTokens] = useState<Array<string | undefined>>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  const resolvedState = stateFilter === 'all' ? undefined : stateFilter;
  const cursor = pageTokens[pageIndex];
  const { schedules, nextToken, loading, fetching, error, refetch } = useSchedules(
    groupName ?? null,
    resolvedState,
    cursor,
  );

  const goBack = () =>
    navigate(`/eventbridge/scheduler/groups/${encodeURIComponent(groupName ?? '')}`);

  const changeFilter = (value: string) => {
    setStateFilter(value as ScheduleStateFilter);
    setPageTokens([undefined]);
    setPageIndex(0);
  };

  const loadNextPage = () => {
    if (!nextToken) return;
    setPageTokens((tokens) => [...tokens.slice(0, pageIndex + 1), nextToken]);
    setPageIndex((index) => index + 1);
  };

  const openSchedule = (name: string) =>
    navigate(
      `/eventbridge/scheduler/groups/${encodeURIComponent(groupName ?? '')}/schedules/${encodeURIComponent(name)}`,
    );

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            EventBridge Scheduler
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Schedules</h2>
          <p className="mt-1 break-all font-mono text-sm text-slate-400">{groupName}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="schedule-state-filter">State</Label>
            <Select value={stateFilter} onValueChange={changeFilter}>
              <SelectTrigger id="schedule-state-filter" className="w-40">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                <SelectItem value="ENABLED">Enabled</SelectItem>
                <SelectItem value="DISABLED">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => void refetch()} disabled={fetching}>
            {fetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="ghost" onClick={goBack}>
            Back to schedule group
          </Button>
        </div>
      </div>

      <ScheduleTable
        schedules={schedules}
        loading={loading}
        error={error}
        hasNextPage={Boolean(nextToken)}
        onViewSchedule={openSchedule}
        onLoadMore={loadNextPage}
        onRetry={() => void refetch()}
      />

      {schedules.length > 0 ? (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">Page {pageIndex + 1}</span>
          <Button variant="outline" size="sm" onClick={loadNextPage} disabled={!nextToken}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

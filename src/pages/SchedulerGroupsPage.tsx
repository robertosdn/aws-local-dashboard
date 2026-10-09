import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScheduleGroupTable, useScheduleGroups } from '@/features/eventbridge';

export default function SchedulerGroupsPage() {
  const navigate = useNavigate();
  const [pageTokens, setPageTokens] = useState<Array<string | undefined>>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  const cursor = pageTokens[pageIndex];
  const { scheduleGroups, nextToken, loading, fetching, error, refetch } = useScheduleGroups(cursor);

  const loadNextPage = () => {
    if (!nextToken) return;
    setPageTokens((tokens) => [...tokens.slice(0, pageIndex + 1), nextToken]);
    setPageIndex((index) => index + 1);
  };

  const openGroup = (name: string) =>
    navigate(`/eventbridge/scheduler/groups/${encodeURIComponent(name)}`);

  const openSchedules = (name: string) =>
    navigate(`/eventbridge/scheduler/groups/${encodeURIComponent(name)}/schedules`);

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            EventBridge Scheduler
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Schedule Groups</h2>
        </div>
        <Button variant="outline" onClick={() => void refetch()} disabled={fetching}>
          {fetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error ? (
        <Alert className="border-red-500/50 bg-red-500/10 text-red-200" role="alert">
          <AlertDescription>
            <p>Failed to load schedule groups.</p>
            <p className="mt-1 break-all text-sm text-slate-300">{errorMessage}</p>
            <Button variant="outline" onClick={() => void refetch()} className="mt-3">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <ScheduleGroupTable
            scheduleGroups={scheduleGroups}
            loading={loading}
            onViewGroup={openGroup}
            onViewSchedules={openSchedules}
          />

          {scheduleGroups.length > 0 ? (
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
        </>
      )}
    </div>
  );
}

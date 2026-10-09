import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScheduleGroupDetails, useScheduleGroupDetails } from '@/features/eventbridge';

export default function SchedulerGroupDetailPage() {
  const { groupName } = useParams<{ groupName: string }>();
  const navigate = useNavigate();
  const details = useScheduleGroupDetails(groupName ?? null);

  const goBack = () => navigate('/eventbridge/scheduler/groups');
  const viewSchedules = () =>
    navigate(`/eventbridge/scheduler/groups/${encodeURIComponent(groupName ?? '')}/schedules`);

  if (details.error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6" role="alert">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">
            EventBridge Scheduler
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Schedule group not found</h2>
          <p className="mt-4 break-all text-sm text-slate-300">
            {details.error instanceof Error
              ? details.error.message
              : 'Unable to load this schedule group.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void details.refetch()}>
              Retry
            </Button>
            <Button variant="ghost" onClick={goBack}>
              Back to schedule groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScheduleGroupDetails
      scheduleGroupDetails={details.scheduleGroupDetails}
      loading={details.loading}
      onBack={goBack}
      onViewSchedules={viewSchedules}
    />
  );
}

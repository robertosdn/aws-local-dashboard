import { format } from 'date-fns';
import { Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ScheduleState, ScheduleSummary } from '../types/scheduler';

interface ScheduleTableProps {
  schedules: ScheduleSummary[];
  loading: boolean;
  error?: unknown;
  hasNextPage: boolean;
  onViewSchedule: (name: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onCreateSchedule?: () => void;
  onEditSchedule?: (schedule: ScheduleSummary) => void;
  onDeleteSchedule?: (schedule: ScheduleSummary) => void;
  onSetScheduleState?: (schedule: ScheduleSummary, state: ScheduleState) => void;
  actionsDisabled?: boolean;
  pendingScheduleName?: string | null;
}

function formatDate(value?: Date) {
  return value ? format(value, 'yyyy-MM-dd HH:mm:ss') : '-';
}

export function ScheduleTable({
  schedules,
  loading,
  error,
  hasNextPage,
  onViewSchedule,
  onLoadMore,
  onRetry,
  onCreateSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onSetScheduleState,
  actionsDisabled = false,
  pendingScheduleName,
}: ScheduleTableProps) {
  if (loading) {
    return (
      <Card className="space-y-3 bg-slate-900/50 p-6">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-6 w-full" />
        ))}
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-3 border-red-500/50 bg-red-500/10 p-6" role="alert">
        <p className="font-medium text-red-300">Failed to load schedules</p>
        <p className="break-all text-sm text-slate-300">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <div>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="space-y-3 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-300">No schedules found</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a schedule to start automating this group.
        </p>
        {onCreateSchedule ? (
          <Button onClick={onCreateSchedule} disabled={actionsDisabled}>
            <Plus className="mr-2 h-4 w-4" />
            Create schedule
          </Button>
        ) : null}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {onCreateSchedule ? (
        <div className="flex justify-end">
          <Button onClick={onCreateSchedule} disabled={actionsDisabled}>
            <Plus className="mr-2 h-4 w-4" />
            Create schedule
          </Button>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl">
        <Card className="min-w-[60rem] overflow-hidden bg-slate-900/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schedule</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Target ARN</TableHead>
                <TableHead>Last modified</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.arn || schedule.name}>
                  <TableCell className="font-mono text-cyan-300">{schedule.name}</TableCell>
                  <TableCell>
                    <Badge variant={schedule.state === 'ENABLED' ? 'success' : 'secondary'}>
                      {schedule.state}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="max-w-xs truncate font-mono text-xs text-slate-400"
                    title={schedule.targetArn}
                  >
                    {schedule.targetArn ?? '-'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {formatDate(schedule.lastModifiedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewSchedule(schedule.name)}
                        aria-label={`View details for ${schedule.name}`}
                        title="View details"
                        disabled={actionsDisabled}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      {onSetScheduleState ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionsDisabled || pendingScheduleName === schedule.name}
                          onClick={() =>
                            onSetScheduleState(
                              schedule,
                              schedule.state === 'ENABLED' ? 'DISABLED' : 'ENABLED',
                            )
                          }
                          aria-label={`${
                            schedule.state === 'ENABLED' ? 'Disable' : 'Enable'
                          } schedule ${schedule.name}`}
                        >
                          {schedule.state === 'ENABLED' ? 'Disable' : 'Enable'}
                        </Button>
                      ) : null}
                      {onEditSchedule ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditSchedule(schedule)}
                          aria-label={`Edit schedule ${schedule.name}`}
                          title="Edit schedule"
                          disabled={actionsDisabled}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {onDeleteSchedule ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteSchedule(schedule)}
                          aria-label={`Delete schedule ${schedule.name}`}
                          title="Delete schedule"
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          disabled={actionsDisabled}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load more schedules
          </Button>
        </div>
      ) : null}
    </div>
  );
}

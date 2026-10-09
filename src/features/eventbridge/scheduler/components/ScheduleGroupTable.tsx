import { format } from 'date-fns';
import { Info, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ScheduleGroupSummary } from '../types/scheduler';

interface ScheduleGroupTableProps {
  scheduleGroups: ScheduleGroupSummary[];
  loading: boolean;
  onViewGroup: (name: string) => void;
  onViewSchedules: (name: string) => void;
}

function formatDate(value?: Date) {
  return value ? format(value, 'yyyy-MM-dd HH:mm:ss') : '-';
}

export function ScheduleGroupTable({
  scheduleGroups,
  loading,
  onViewGroup,
  onViewSchedules,
}: ScheduleGroupTableProps) {
  if (loading) {
    return (
      <Card className="bg-slate-900/50 p-8 text-center text-slate-400">
        Loading schedule groups...
      </Card>
    );
  }

  if (scheduleGroups.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <p className="text-slate-300">No schedule groups found</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a schedule group in the configured endpoint to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <Card className="min-w-[44rem] overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schedule group</TableHead>
              <TableHead>ARN</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleGroups.map((scheduleGroup) => (
              <TableRow key={scheduleGroup.arn || scheduleGroup.name}>
                <TableCell className="font-mono text-cyan-300">{scheduleGroup.name}</TableCell>
                <TableCell
                  className="max-w-xs truncate font-mono text-xs text-slate-400"
                  title={scheduleGroup.arn}
                >
                  {scheduleGroup.arn}
                </TableCell>
                <TableCell className="text-sm text-slate-400">
                  {formatDate(scheduleGroup.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewGroup(scheduleGroup.name)}
                      aria-label={`View details for ${scheduleGroup.name}`}
                      title="View details"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewSchedules(scheduleGroup.name)}
                      aria-label={`View schedules in ${scheduleGroup.name}`}
                      title="View schedules"
                    >
                      <TableIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

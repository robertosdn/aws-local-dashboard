import { format } from 'date-fns';
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
import { Info, Trash2 } from 'lucide-react';
import type { EventBusSummary } from '../types/eventbridge';
import { DEFAULT_EVENT_BUS_NAME } from '../types/eventbridge';

interface EventBusTableProps {
  eventBuses: EventBusSummary[];
  loading: boolean;
  onViewEventBus: (name: string) => void;
  onDeleteEventBus: (name: string) => void;
}

export function EventBusTable({
  eventBuses,
  loading,
  onViewEventBus,
  onDeleteEventBus,
}: EventBusTableProps) {
  if (loading) {
    return (
      <Card className="bg-slate-900/50 p-8 text-center text-slate-400">
        Loading event buses...
      </Card>
    );
  }

  if (eventBuses.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <p className="text-slate-300">No event buses found</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a custom event bus in the configured endpoint to get started.
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
              <TableHead>Event bus</TableHead>
              <TableHead>ARN</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-48 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventBuses.map((eventBus) => {
              const isDefault = eventBus.name === DEFAULT_EVENT_BUS_NAME;

              return (
                <TableRow key={eventBus.name}>
                  <TableCell className="font-mono text-cyan-300">{eventBus.name}</TableCell>
                  <TableCell
                    className="max-w-xs truncate font-mono text-xs text-slate-400"
                    title={eventBus.arn}
                  >
                    {eventBus.arn}
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {eventBus.createdAt ? format(eventBus.createdAt, 'yyyy-MM-dd HH:mm:ss') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewEventBus(eventBus.name)}
                        aria-label={`View details for ${eventBus.name}`}
                        title="View details"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      {isDefault ? null : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteEventBus(eventBus.name)}
                          aria-label={`Delete event bus ${eventBus.name}`}
                          title="Delete event bus"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

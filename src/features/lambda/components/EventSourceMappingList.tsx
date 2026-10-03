'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { Loader2, ExternalLink, Zap, Database, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { EventSourceMapping } from '../types';
import { useUpdateEventSourceMapping, useDeleteEventSourceMapping, useSQSQueueInfo, useEventSourceMappings } from '../hooks';

function getStateColor(state: string): string {
  switch (state) {
    case 'Enabled':
    case 'Active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Enabling':
    case 'Disabling':
    case 'Updating':
    case 'Creating':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Disabled':
    case 'Inactive':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Deleting':
    case 'Deleted':
    case 'Failed':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

function getEventSourceType(arn: string): { label: string; icon: React.ReactNode } {
  if (arn.includes(':sqs:')) return { label: 'SQS', icon: <Database className="h-3 w-3" /> };
  if (arn.includes(':dynamodb:')) return { label: 'DynamoDB', icon: <Zap className="h-3 w-3" /> };
  if (arn.includes(':kinesis:')) return { label: 'Kinesis', icon: <Zap className="h-3 w-3" /> };
  return { label: 'Other', icon: <ExternalLink className="h-3 w-3" /> };
}

function extractQueueNameFromArn(arn: string): string {
  const parts = arn.split(':');
  return parts[parts.length - 1] || arn;
}

function EventSourceMappingRowWithQueue({
  mapping,
  onToggle,
  onDelete,
}: {
  mapping: EventSourceMapping;
  onToggle: (mapping: EventSourceMapping, enabled: boolean) => void;
  onDelete: (mapping: EventSourceMapping) => void;
}) {
  const queueName = extractQueueNameFromArn(mapping.eventSourceArn);
  const { data: sqsQueue, isLoading: sqsLoading } = useSQSQueueInfo(queueName);

  const { label: typeLabel, icon: typeIcon } = getEventSourceType(mapping.eventSourceArn);
  const isEnabled = mapping.state === 'Enabled';
  const isTransitioning = ['Enabling', 'Disabling', 'Updating', 'Creating', 'Deleting'].includes(mapping.state);

  const handleToggle = () => {
    if (isTransitioning) return;
    onToggle(mapping, !isEnabled);
  };

  const handleDelete = () => {
    if (isTransitioning) return;
    onDelete(mapping);
  };

  return (
    <TableRow>
      <TableCell className="max-w-xs truncate">
        <div className="flex items-center gap-2">
          {typeIcon}
          <span className="text-slate-300 font-mono text-xs truncate max-w-xs" title={mapping.eventSourceArn}>
            {extractQueueNameFromArn(mapping.eventSourceArn)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs gap-1">
          {typeIcon}
          {typeLabel}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getStateColor(mapping.state)} variant="outline">
          {mapping.state}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-300 font-mono">{mapping.batchSize}</span>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-300 font-mono">{mapping.maximumBatchingWindowInSeconds}s</span>
      </TableCell>
      <TableCell>
        {sqsLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500 mx-auto" />
        ) : sqsQueue ? (
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Messages: {sqsQueue.attributes.ApproximateNumberOfMessages}</p>
            <p className="text-xs text-slate-400">In Flight: {sqsQueue.attributes.ApproximateNumberOfMessagesNotVisible}</p>
            <p className="text-xs text-slate-400">Delayed: {sqsQueue.attributes.ApproximateNumberOfMessagesDelayed}</p>
          </div>
        ) : (
          <span className="text-slate-500 text-xs">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Toggle
            pressed={isEnabled}
            onPressedChange={handleToggle}
            disabled={isTransitioning}
            aria-label={isEnabled ? 'Disable event source mapping' : 'Enable event source mapping'}
            title={isEnabled ? 'Disable' : 'Enable'}
            className="data-[state=on]:bg-green-500/20 data-[state=on]:border-green-500/30"
          >
            <Zap className="h-4 w-4" />
          </Toggle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isTransitioning}
            aria-label="Delete event source mapping"
            title="Delete"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface EventSourceMappingListProps {
  functionName: string;
}

export function EventSourceMappingList({ functionName }: EventSourceMappingListProps) {
  const { data: mappings, isLoading, error, refetch } = useEventSourceMappings({ functionName });
  const updateMapping = useUpdateEventSourceMapping();
  const deleteMapping = useDeleteEventSourceMapping();
  const [deleteConfirm, setDeleteConfirm] = useState<EventSourceMapping | null>(null);

  const handleToggle = async (mapping: EventSourceMapping, enabled: boolean) => {
    try {
      await updateMapping.mutateAsync({ uuid: mapping.uuid, updates: { enabled } });
      toast({
        title: 'Success',
        description: `Event source mapping ${enabled ? 'enabled' : 'disabled'}`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update mapping',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (mapping: EventSourceMapping) => {
    setDeleteConfirm(mapping);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMapping.mutateAsync(deleteConfirm.uuid);
      toast({
        title: 'Success',
        description: 'Event source mapping deleted',
        variant: 'success',
      });
      setDeleteConfirm(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete mapping',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
        <p className="text-red-300">Failed to load event source mappings</p>
        <p className="text-sm text-slate-400 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Source</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-right">Batch Size</TableHead>
            <TableHead className="text-right">Max Batching Window</TableHead>
            <TableHead>SQS Queue Info</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><div className="h-4 w-48 bg-slate-800 animate-pulse rounded" /></TableCell>
              <TableCell><div className="h-5 w-16 bg-slate-800 animate-pulse rounded mx-auto" /></TableCell>
              <TableCell><div className="h-5 w-20 bg-slate-800 animate-pulse rounded mx-auto" /></TableCell>
              <TableCell className="text-right"><div className="h-4 w-16 bg-slate-800 animate-pulse rounded ml-auto" /></TableCell>
              <TableCell className="text-right"><div className="h-4 w-20 bg-slate-800 animate-pulse rounded ml-auto" /></TableCell>
              <TableCell><div className="h-20 bg-slate-800 animate-pulse rounded" /></TableCell>
              <TableCell><div className="h-8 w-20 bg-slate-800 animate-pulse rounded mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!mappings || mappings.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-12 text-center">
        <Zap className="h-12 w-12 mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400">No event source mappings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Event Source Mappings</h3>

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Batch Size</TableHead>
              <TableHead className="text-right">Max Batching Window</TableHead>
              <TableHead>SQS Queue Info</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappings.map((mapping) => (
              <EventSourceMappingRowWithQueue
                key={mapping.uuid}
                mapping={mapping}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event Source Mapping</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the event source mapping for <strong>{deleteConfirm ? extractQueueNameFromArn(deleteConfirm.eventSourceArn) : ''}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMapping.isPending}>
              {deleteMapping.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
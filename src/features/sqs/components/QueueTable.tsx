'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueueRow } from './QueueRow';
import type { SQSQueue } from '../types/sqs';

interface QueueTableProps {
  queues: SQSQueue[];
  loading: boolean;
  onViewDetails: (queue: SQSQueue) => void;
  onViewMessages: (queue: SQSQueue) => void;
  onSendMessage: (queue: SQSQueue) => void;
  onPurge: (queue: SQSQueue) => void;
}

export function QueueTable({ queues, loading, onViewDetails, onViewMessages, onSendMessage, onPurge }: QueueTableProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Messages</TableHead>
              <TableHead className="text-right">In Flight</TableHead>
              <TableHead className="text-right">Delayed</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-64" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (queues.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">No queues found</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a queue in the AWS emulator to get started
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="text-right">Messages</TableHead>
            <TableHead className="text-right">In Flight</TableHead>
            <TableHead className="text-right">Delayed</TableHead>
            <TableHead className="w-48">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queues.map((queue) => (
            <QueueRow
              key={queue.url}
              queue={queue}
              onViewDetails={onViewDetails}
              onViewMessages={onViewMessages}
              onSendMessage={onSendMessage}
              onPurge={onPurge}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

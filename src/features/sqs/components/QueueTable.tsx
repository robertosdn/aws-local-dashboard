'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QueueRow } from './QueueRow';
import type { SQSQueue } from '../types/sqs';

interface QueueTableProps {
  queues: SQSQueue[];
  loading: boolean;
  onViewMessages: (queue: SQSQueue) => void;
  onPurge: (queue: SQSQueue) => void;
}

export function QueueTable({ queues, loading, onViewMessages, onPurge }: QueueTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Messages</TableHead>
              <TableHead className="text-right">In Flight</TableHead>
              <TableHead className="text-right">Delayed</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-48 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-64 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell className="text-right"><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell className="text-right"><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell className="text-right"><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-8 w-24 bg-slate-800 animate-pulse rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (queues.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">No queues found</p>
        <p className="text-sm text-slate-500 mt-1">Create a queue in the AWS emulator to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="text-right">Messages</TableHead>
            <TableHead className="text-right">In Flight</TableHead>
            <TableHead className="text-right">Delayed</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queues.map((queue) => (
            <QueueRow
              key={queue.url}
              queue={queue}
              onViewMessages={onViewMessages}
              onPurge={onPurge}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
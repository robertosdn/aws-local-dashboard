'use client';

import { useState } from 'react';
import { Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Eye, Copy, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SQSMessage } from '../types/sqs';

interface MessageListProps {
  messages: SQSMessage[];
  loading: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

const MESSAGES_PER_PAGE = 10;

function formatJson(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return '-';
  const date = new Date(parseInt(timestamp, 10));
  return date.toLocaleString();
}

export function MessageList({
  messages,
  loading,
  onPageChange,
  currentPage,
  totalPages,
}: MessageListProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message ID</TableHead>
              <TableHead>Body</TableHead>
              <TableHead className="w-32">Receive Count</TableHead>
              <TableHead className="w-32">Sent</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-slate-700" />
        <p className="mt-4 text-slate-400">No messages in queue</p>
      </Card>
    );
  }

  const startIndex = currentPage * MESSAGES_PER_PAGE;
  const endIndex = startIndex + MESSAGES_PER_PAGE;
  const paginatedMessages = messages.slice(startIndex, endIndex);

  return (
    <Card className="overflow-hidden bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message ID</TableHead>
            <TableHead>Body</TableHead>
            <TableHead className="w-32">Receive Count</TableHead>
            <TableHead className="w-32">Sent</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedMessages.map((message) => (
            <Fragment key={message.messageId}>
              <TableRow className={cn(expandedRow === message.messageId && 'bg-slate-800/50')}>
                <TableCell className="max-w-[150px] truncate font-mono text-xs text-slate-300">
                  {message.messageId}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <pre className="block truncate whitespace-pre-wrap font-mono text-xs text-slate-400">
                    {formatJson(message.body).slice(0, 100)}
                    {formatJson(message.body).length > 100 ? '...' : ''}
                  </pre>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {message.attributes.ApproximateReceiveCount || '1'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-xs text-slate-400">
                  {formatTimestamp(message.attributes.SentTimestamp)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedRow(expandedRow === message.messageId ? null : message.messageId)
                      }
                      aria-label={expandedRow === message.messageId ? 'Collapse' : 'Expand'}
                      title={expandedRow === message.messageId ? 'Collapse' : 'Expand'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(message.body)}
                      aria-label="Copy message body"
                      title="Copy body"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRow === message.messageId && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <div className="border-t border-slate-800 bg-slate-900/50 p-4">
                      <div className="grid gap-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Message ID
                          </label>
                          <p className="mt-1 break-all font-mono text-xs text-slate-300">
                            {message.messageId}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Receipt Handle
                          </label>
                          <p className="mt-1 break-all font-mono text-xs text-slate-300">
                            {message.receiptHandle}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Body
                          </label>
                          <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 font-mono text-xs text-slate-300">
                            {formatJson(message.body)}
                          </pre>
                        </div>
                        {message.messageAttributes &&
                          Object.keys(message.messageAttributes).length > 0 && (
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Message Attributes
                              </label>
                              <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 font-mono text-xs text-slate-300">
                                {JSON.stringify(message.messageAttributes, null, 2)}
                              </pre>
                            </div>
                          )}
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Attributes
                          </label>
                          <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 font-mono text-xs text-slate-300">
                            {JSON.stringify(message.attributes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-sm text-slate-400">
            Page {currentPage + 1} of {totalPages} ({messages.length} messages)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

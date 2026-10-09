'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eraser, Eye, Info, Send } from 'lucide-react';

import type { SQSQueue } from '../types/sqs';

interface QueueRowProps {
  queue: SQSQueue;
  onViewDetails: (queue: SQSQueue) => void;
  onViewMessages: (queue: SQSQueue) => void;
  onSendMessage: (queue: SQSQueue) => void;
  onPurge: (queue: SQSQueue) => void;
}

export function QueueRow({ queue, onViewDetails, onViewMessages, onSendMessage, onPurge }: QueueRowProps) {
  const { attributes } = queue;
  const visibleCount = parseInt(attributes.ApproximateNumberOfMessages || '0', 10);
  const inFlightCount = parseInt(attributes.ApproximateNumberOfMessagesNotVisible || '0', 10);
  const delayedCount = parseInt(attributes.ApproximateNumberOfMessagesDelayed || '0', 10);

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 3) + '...';
  };

  return (
    <TableRow>
      <TableCell>
        <span className="font-medium text-white">{queue.name}</span>
      </TableCell>
      <TableCell>
        <span className="text-slate-400 font-mono text-xs truncate block max-w-xs" title={queue.url}>
          {truncateUrl(queue.url)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant={visibleCount > 0 ? 'default' : 'secondary'}>
          {visibleCount}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant={inFlightCount > 0 ? 'destructive' : 'secondary'}>
          {inFlightCount}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant={delayedCount > 0 ? 'success' : 'secondary'}>
          {delayedCount}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(queue)}
            aria-label={`View details for ${queue.name}`}
            title="View queue details"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewMessages(queue)}
            aria-label={`View messages for ${queue.name}`}
            title="View messages"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSendMessage(queue)}
            aria-label={`Send message to ${queue.name}`}
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPurge(queue)}
            aria-label={`Purge queue ${queue.name}`}
            title="Purge queue"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
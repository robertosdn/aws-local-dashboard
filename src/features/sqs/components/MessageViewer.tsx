'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageList } from './MessageList';
import { useQueueMessages } from '../hooks/useQueueMessages';
import { RefreshButton } from './RefreshButton';
import type { SQSQueue } from '../types/sqs';

interface MessageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: SQSQueue | null;
  onPurge: () => void;
  purgePending: boolean;
}

export function MessageViewer({ open, onOpenChange, queue, onPurge, purgePending }: MessageViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const { messages, loading, refetch } = useQueueMessages(queue?.url || null, open);

  useEffect(() => {
    if (open) {
      setCurrentPage(0);
    }
  }, [open, queue?.url]);

  const totalPages = Math.ceil(messages.length / 10);

  if (!open || !queue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{queue.name}</DialogTitle>
            <DialogDescription>Peek mode - messages remain in queue</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton onClick={refetch} loading={loading} />
            <Button variant="outline" size="sm" onClick={onPurge} disabled={purgePending}>
              Purge Queue
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <MessageList
            messages={messages}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
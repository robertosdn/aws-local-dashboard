'use client';

import { useState } from 'react';
import { useQueues, usePurgeQueue, useSendMessage, useInvalidateQueues } from '@/features/sqs/hooks';
import { QueueTable } from '@/features/sqs/components/QueueTable';
import { MessageViewer } from '@/features/sqs/components/MessageViewer';
import { PurgeConfirmDialog } from '@/features/sqs/components/PurgeConfirmDialog';
import { SendMessageDialog, type SendMessagePayload } from '@/features/sqs/components/SendMessageDialog';
import { QueueDetailsDialog } from '@/features/sqs/components/QueueDetailsDialog';
import { RefreshButton } from '@/features/sqs/components/RefreshButton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { SQSQueue } from '@/features/sqs/types/sqs';

export default function QueuesPage() {
  const { queues, loading, error, refetch } = useQueues();
  const { purge, pending: purgePending } = usePurgeQueue();
  const { send, pending: sendPending } = useSendMessage();
  const invalidateQueues = useInvalidateQueues();

  const [selectedQueue, setSelectedQueue] = useState<SQSQueue | null>(null);
  const [messageViewerOpen, setMessageViewerOpen] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [queueToPurge, setQueueToPurge] = useState<SQSQueue | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [queueForSend, setQueueForSend] = useState<SQSQueue | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [queueForDetails, setQueueForDetails] = useState<SQSQueue | null>(null);

  const handleViewMessages = (queue: SQSQueue) => {
    setSelectedQueue(queue);
    setMessageViewerOpen(true);
  };

  const handleViewDetails = (queue: SQSQueue) => {
    setQueueForDetails(queue);
    setDetailsDialogOpen(true);
  };

  const handleSendClick = (queue: SQSQueue) => {
    setQueueForSend(queue);
    setSendDialogOpen(true);
  };

  const handleSend = async (payload: SendMessagePayload) => {
    try {
      const result = await send(payload);
      toast({
        title: 'Message sent',
        description: `Message ID: ${result.messageId}`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to send message',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const handlePurgeClick = (queue: SQSQueue) => {
    setQueueToPurge(queue);
    setPurgeDialogOpen(true);
  };

  const handlePurgeConfirm = async () => {
    if (!queueToPurge) return;

    try {
      await purge(queueToPurge.url);
      toast({
        title: 'Queue purged',
        description: `All messages in ${queueToPurge.name} have been deleted`,
        variant: 'success',
      });
      invalidateQueues();
      setPurgeDialogOpen(false);
      setQueueToPurge(null);
      if (selectedQueue?.url === queueToPurge.url) {
        setMessageViewerOpen(false);
        setSelectedQueue(null);
      }
    } catch (err) {
      toast({
        title: 'Failed to purge queue',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Refreshing',
      description: 'Fetching latest queue data...',
    });
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">SQS</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Queues</h2>
        <div className="mt-4 text-red-300">
          <p>Failed to connect to SQS endpoint</p>
          <p className="mt-1 text-sm text-slate-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button variant="outline" onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">SQS</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Queues</h2>
        </div>
        <RefreshButton onClick={handleRefresh} loading={loading} />
      </div>

      <QueueTable
        queues={queues}
        loading={loading}
        onViewDetails={handleViewDetails}
        onViewMessages={handleViewMessages}
        onSendMessage={handleSendClick}
        onPurge={handlePurgeClick}
      />

      <QueueDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        queue={queueForDetails}
      />

      <SendMessageDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        queue={queueForSend}
        onSend={handleSend}
        pending={sendPending}
      />

      <MessageViewer
        open={messageViewerOpen}
        onOpenChange={setMessageViewerOpen}
        queue={selectedQueue}
        onPurge={() => {
          if (selectedQueue) {
            setQueueToPurge(selectedQueue);
            setPurgeDialogOpen(true);
            setMessageViewerOpen(false);
          }
        }}
        purgePending={purgePending}
      />

      <PurgeConfirmDialog
        open={purgeDialogOpen}
        onOpenChange={setPurgeDialogOpen}
        queue={queueToPurge}
        onConfirm={handlePurgeConfirm}
        pending={purgePending}
      />
    </div>
  );
}

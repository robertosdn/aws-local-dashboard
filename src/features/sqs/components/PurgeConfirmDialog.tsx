'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogAction } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { SQSQueue } from '../types/sqs';

interface PurgeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: SQSQueue | null;
  onConfirm: () => void;
  pending: boolean;
}

export function PurgeConfirmDialog({ open, onOpenChange, queue, onConfirm, pending }: PurgeConfirmDialogProps) {
  if (!queue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Purge Queue
          </DialogTitle>
          <DialogDescription>
            This will permanently delete all messages in <strong>{queue.name}</strong>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogAction onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </DialogAction>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'Purging...' : 'Purge Queue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
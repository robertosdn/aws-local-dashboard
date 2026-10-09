'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogAction,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DynamoKey } from '../types/dynamodb';

function formatKey(key?: DynamoKey): string {
  if (!key) return '';
  return Object.entries(key)
    .map(([k, v]) => {
      if (v instanceof Uint8Array) {
        let binary = '';
        for (let i = 0; i < v.length; i++) {
          binary += String.fromCharCode(v[i]);
        }
        return `${k}: ${btoa(binary)}`;
      }
      return `${k}: ${v}`;
    })
    .join(', ');
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
  title: string;
  description: string;
  itemKey?: DynamoKey;
  tableName?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
  title,
  description,
  itemKey,
  tableName,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <div className="space-y-2 text-sm text-slate-400">
            {tableName && (
              <p>
                Table: <code className="font-mono text-white">{tableName}</code>
              </p>
            )}
            {itemKey && (
              <p>
                Item key:{' '}
                <code className="rounded bg-slate-800 px-2 py-1 font-mono text-slate-300">
                  {formatKey(itemKey)}
                </code>
              </p>
            )}
            <p className="text-red-400">This action cannot be undone.</p>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogAction onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </DialogAction>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

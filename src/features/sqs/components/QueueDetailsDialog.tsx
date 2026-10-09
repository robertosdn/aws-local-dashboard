'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

import { useQueueDetails } from '../hooks/useQueueDetails';
import type { SQSQueue } from '../types/sqs';

interface QueueDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: SQSQueue | null;
}

const PREFERRED_ORDER = ['QueueArn', 'CreatedTimestamp', 'LastModifiedTimestamp'];
const TIMESTAMP_ATTRIBUTES = new Set(['CreatedTimestamp', 'LastModifiedTimestamp']);
const JSON_ATTRIBUTES = new Set(['RedrivePolicy', 'Policy']);

function formatAttributeLabel(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function formatAttributeValue(key: string, value: string): string {
  if (TIMESTAMP_ATTRIBUTES.has(key)) {
    const seconds = Number(value);
    if (Number.isFinite(seconds)) {
      return new Date(seconds * 1000).toLocaleString();
    }
  }
  return value;
}

function sortAttributes(attributes: Record<string, string>): [string, string][] {
  return Object.entries(attributes).sort(([a], [b]) => {
    const indexA = PREFERRED_ORDER.indexOf(a);
    const indexB = PREFERRED_ORDER.indexOf(b);
    if (indexA !== -1 || indexB !== -1) {
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }
    return a.localeCompare(b);
  });
}

export function QueueDetailsDialog({ open, onOpenChange, queue }: QueueDetailsDialogProps) {
  const { details, loading, error, refetch } = useQueueDetails(queue?.url ?? null, open);

  if (!open || !queue) return null;

  const attributes = details ? sortAttributes(details.attributes) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{queue.name}</DialogTitle>
          <DialogDescription className="break-all font-mono text-xs">{queue.url}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-300">
              <p className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Failed to load queue details
              </p>
              <p className="mt-1 text-sm text-red-200/80">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                Retry
              </Button>
            </div>
          ) : attributes.length === 0 ? (
            <p className="text-sm text-slate-400">No attributes available for this queue.</p>
          ) : (
            <dl className="space-y-3">
              {attributes.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-1 border-b border-slate-800 pb-3 last:border-b-0 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
                >
                  <dt className="text-sm font-medium text-slate-400">{formatAttributeLabel(key)}</dt>
                  <dd className="min-w-0">
                    {JSON_ATTRIBUTES.has(key) ? (
                      <CodeBlock value={value} />
                    ) : (
                      <span className="break-all font-mono text-sm text-slate-200">
                        {formatAttributeValue(key, value)}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

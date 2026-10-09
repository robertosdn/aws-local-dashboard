'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogAction,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Send, Trash2 } from 'lucide-react';

import type { SQSQueue, SendMessageOptions } from '../types/sqs';

export interface SendMessagePayload {
  queueUrl: string;
  body: string;
  options?: SendMessageOptions;
}

interface AttributeRow {
  id: number;
  key: string;
  value: string;
}

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: SQSQueue | null;
  onSend: (payload: SendMessagePayload) => Promise<void>;
  pending: boolean;
}

let attributeRowId = 0;

function buildMessageAttributes(rows: AttributeRow[]): SendMessageOptions['messageAttributes'] {
  return Object.fromEntries(
    rows.map((row) => [
      row.key.trim(),
      { dataType: 'String' as const, stringValue: row.value },
    ]),
  );
}

export function SendMessageDialog({ open, onOpenChange, queue, onSend, pending }: SendMessageDialogProps) {
  const [body, setBody] = useState('');
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setBody('');
      setAttributes([]);
      setValidationError(null);
    }
  }, [open, queue?.url]);

  if (!queue) return null;

  const addAttribute = () => {
    attributeRowId += 1;
    setAttributes((rows) => [...rows, { id: attributeRowId, key: '', value: '' }]);
  };

  const updateAttribute = (id: number, field: 'key' | 'value', value: string) => {
    setAttributes((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeAttribute = (id: number) => {
    setAttributes((rows) => rows.filter((row) => row.id !== id));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!body.trim()) {
      setValidationError('Message body is required');
      return;
    }

    const usedAttributes = attributes.filter((row) => row.key.trim() || row.value.trim());
    if (usedAttributes.some((row) => !row.key.trim() || !row.value.trim())) {
      setValidationError('Each attribute needs a key and a value');
      return;
    }

    const keys = usedAttributes.map((row) => row.key.trim());
    if (new Set(keys).size !== keys.length) {
      setValidationError('Attribute keys must be unique');
      return;
    }

    setValidationError(null);

    const messageAttributes = usedAttributes.length ? buildMessageAttributes(usedAttributes) : undefined;

    try {
      await onSend({
        queueUrl: queue.url,
        body,
        options: messageAttributes ? { messageAttributes } : undefined,
      });
      setBody('');
      setAttributes([]);
    } catch {
      // The parent surfaces the failure via a toast; keep the entered content so it can be retried.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Publish a message to {queue.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="sqs-message-body">Message body</Label>
            <Textarea
              id="sqs-message-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              placeholder='{"message":"hello"}'
              disabled={pending}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Message attributes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAttribute} disabled={pending}>
                <Plus className="h-4 w-4" />
                Add attribute
              </Button>
            </div>
            {attributes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Optional. Add string key/value pairs to attach as message attributes.
              </p>
            ) : (
              <div className="space-y-2">
                {attributes.map((row) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <Input
                      aria-label="Attribute key"
                      placeholder="Key"
                      value={row.key}
                      onChange={(event) => updateAttribute(row.id, 'key', event.target.value)}
                      disabled={pending}
                    />
                    <Input
                      aria-label="Attribute value"
                      placeholder="Value"
                      value={row.value}
                      onChange={(event) => updateAttribute(row.id, 'value', event.target.value)}
                      disabled={pending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(row.id)}
                      aria-label="Remove attribute"
                      disabled={pending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {validationError && (
            <Alert className="border-red-500/50 bg-red-500/10 text-red-300">
              <AlertTitle>Cannot send message</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogAction type="button" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </DialogAction>
            <Button type="submit" disabled={pending}>
              <Send className="h-4 w-4" />
              {pending ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

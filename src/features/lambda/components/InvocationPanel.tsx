'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { LambdaFunction } from '../types/lambda';
import { useInvokeFunction } from '../hooks/useInvokeFunction';

type InvocationType = 'RequestResponse' | 'Event' | 'DryRun';
type LogType = 'None' | 'Tail';

interface InvocationPanelProps {
  function: LambdaFunction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvocationPanel({ function: fn, open, onOpenChange }: InvocationPanelProps) {
  const [payload, setPayload] = useState('{}');
  const [invocationType, setInvocationType] = useState<InvocationType>('RequestResponse');
  const [logType, setLogType] = useState<LogType>('Tail');
  const [showResponse, setShowResponse] = useState(false);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  const { mutate: invoke, isPending: invoking, data: response, reset } = useInvokeFunction();

  const handleInvoke = () => {
    try {
      JSON.parse(payload);
      setPayloadError(null);
      invoke(
        { functionName: fn!.functionName, payload, invocationType, logType },
        {
          onSuccess: () => {
            setShowResponse(true);
          },
        }
      );
    } catch {
      setPayloadError('Invalid JSON');
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      toast({ title: 'Copied', description: 'Response copied to clipboard', variant: 'success' });
    }
  };

  const copyLogs = () => {
    if (response?.logResult) {
      navigator.clipboard.writeText(response.logResult);
      toast({ title: 'Copied', description: 'Logs copied to clipboard', variant: 'success' });
    }
  };

  if (!fn) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) reset(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-400">Invoke Function</p>
              <h3 className="text-lg font-semibold text-white">{fn.functionName}</h3>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div>
            <Label className="text-sm font-medium text-slate-300">Request Payload (JSON)</Label>
            <Textarea
              value={payload}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPayload(e.target.value)}
              className="mt-2 font-mono text-sm bg-slate-900/50 border-slate-700"
              rows={10}
              placeholder='{"key": "value"}'
              aria-invalid={!!payloadError}
            />
            {payloadError && <p className="mt-1 text-sm text-red-400">{payloadError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-300">Invocation Type</Label>
              <Select value={invocationType} onValueChange={(v) => setInvocationType(v as InvocationType)}>
                <SelectTrigger className="mt-2 bg-slate-900/50 border-slate-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RequestResponse">RequestResponse (sync)</SelectItem>
                  <SelectItem value="Event">Event (async)</SelectItem>
                  <SelectItem value="DryRun">DryRun (validate only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-300">Log Type</Label>
              <Select value={logType} onValueChange={(v) => setLogType(v as LogType)}>
                <SelectTrigger className="mt-2 bg-slate-900/50 border-slate-700">
                  <SelectValue placeholder="Select log type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tail">Tail (last 4KB)</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={invoking}>
              Cancel
            </Button>
            <Button onClick={handleInvoke} disabled={invoking || !!payloadError}>
              <Play className="h-4 w-4 mr-2" />
              {invoking ? 'Invoking...' : 'Invoke'}
            </Button>
          </div>

          {response && (
            <div className="space-y-4 pt-4 border-t border-slate-800" role="region" aria-label="Invocation response">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={response.functionError ? 'destructive' : response.statusCode === 200 ? 'success' : 'default'}>
                    Status: {response.statusCode}
                  </Badge>
                  {response.functionError && (
                    <Badge variant="destructive">Function Error</Badge>
                  )}
                  {response.executedVersion && (
                    <Badge variant="outline">Version: {response.executedVersion}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={copyResponse} title="Copy response">
                    <Copy className="h-4 w-4" />
                  </Button>
                  {response.logResult && (
                    <Button variant="ghost" size="icon" onClick={copyLogs} title="Copy logs">
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-300">Response Payload</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowResponse(!showResponse)}
                  aria-expanded={showResponse}
                >
                  {showResponse ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showResponse && (
                <pre className="p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300 overflow-auto max-h-64 font-mono">
                  {JSON.stringify(JSON.parse(response.payload), null, 2)}
                </pre>
              )}

              {response.logResult && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-300">Execution Logs</Label>
                    <Button variant="ghost" size="icon" onClick={copyLogs} title="Copy logs">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="mt-2 p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300 overflow-auto max-h-48 font-mono whitespace-pre-wrap">
                    {response.logResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
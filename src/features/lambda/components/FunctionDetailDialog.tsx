'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { LambdaFunction } from '../types/lambda';

interface FunctionDetailDialogProps {
  function: LambdaFunction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FunctionDetailDialog({ function: fn, open, onOpenChange }: FunctionDetailDialogProps) {
  if (!fn) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard`, variant: 'success' });
  };

  const formatJson = (obj: unknown) => JSON.stringify(obj, null, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-400">Function Details</p>
              <h3 className="text-lg font-semibold text-white">{fn.functionName}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(fn.functionArn, 'ARN')}>
              <Copy className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Runtime</label>
              <p className="mt-1 text-white">{fn.runtime}</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Handler</label>
              <p className="mt-1 text-white font-mono text-sm">{fn.handler}</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Memory</label>
              <p className="mt-1 text-white">{fn.memorySize} MB</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Timeout</label>
              <p className="mt-1 text-white">{fn.timeout} seconds</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Code Size</label>
              <p className="mt-1 text-white">{(fn.codeSize / 1024).toFixed(2)} KB</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Version</label>
              <p className="mt-1 text-white font-mono text-sm">{fn.version}</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Last Modified</label>
              <p className="mt-1 text-white">{new Date(fn.lastModified).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Code SHA256</label>
              <p className="mt-1 text-white font-mono text-xs truncate max-w-xs">{fn.codeSha256}</p>
            </div>
          </div>

          {fn.description && (
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Description</label>
              <p className="mt-1 text-slate-300">{fn.description}</p>
            </div>
          )}

          {fn.environment?.variables && Object.keys(fn.environment.variables).length > 0 && (
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Environment Variables</label>
              <pre className="mt-2 p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300 overflow-auto max-h-48">
                {formatJson(fn.environment.variables)}
              </pre>
            </div>
          )}

          {fn.vpcConfig && (
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">VPC Configuration</label>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">VPC ID</p>
                  <p className="text-white font-mono">{fn.vpcConfig.vpcId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Subnets</p>
                  <p className="text-white font-mono">{fn.vpcConfig.subnetIds.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Security Groups</p>
                  <p className="text-white font-mono">{fn.vpcConfig.securityGroupIds.join(', ') || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {fn.layers && fn.layers.length > 0 && (
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Layers</label>
              <ul className="mt-2 space-y-1">
                {fn.layers.map((layer, i) => (
                  <li key={i} className="text-sm text-slate-300 font-mono truncate max-w-md">
                    {layer.arn} ({layer.codeSize} bytes)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
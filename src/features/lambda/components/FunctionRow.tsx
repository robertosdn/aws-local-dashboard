'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, Copy } from 'lucide-react';

import type { LambdaFunction } from '../types/lambda';

interface FunctionRowProps {
  function: LambdaFunction;
  onInvoke: (fn: LambdaFunction) => void;
  onViewDetails: (fn: LambdaFunction) => void;
}

export function FunctionRow({ function: fn, onInvoke, onViewDetails }: FunctionRowProps) {
  const truncate = (str: string, maxLength = 40) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <span className="font-medium text-white">{fn.functionName}</span>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">{fn.runtime}</Badge>
      </TableCell>
      <TableCell>
        <span className="text-slate-400 font-mono text-xs truncate block max-w-xs" title={fn.handler}>
          {truncate(fn.handler, 30)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-300 font-mono">{fn.memorySize}</span>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-300 font-mono">{fn.timeout}</span>
      </TableCell>
      <TableCell>
        <span className="text-slate-400 text-sm">{formatDate(fn.lastModified)}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onInvoke(fn)}
            aria-label={`Invoke ${fn.functionName}`}
            title="Invoke function"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(fn)}
            aria-label={`View details for ${fn.functionName}`}
            title="View details"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigator.clipboard.writeText(fn.functionArn)}
            aria-label="Copy ARN"
            title="Copy ARN"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
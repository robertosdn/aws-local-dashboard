'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import type { DynamoItem, DynamoKey } from '../types/dynamodb';

interface ItemResultsProps {
  items: DynamoItem[];
  loading: boolean;
  error: Error | null;
  onDeleteItem: (item: DynamoItem, key: DynamoKey) => void;
  getItemKey: (item: DynamoItem) => DynamoKey;
  onRetry?: () => void;
  emptyMessage?: string;
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Circular]';
    }
  }
  if (typeof value === 'bigint') return `${value}n`;
  return String(value);
}

function isBinary(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

function binaryToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function ItemRow({
  item,
  index,
  getItemKey,
  onDeleteItem,
}: {
  item: DynamoItem;
  index: number;
  getItemKey: (item: DynamoItem) => DynamoKey;
  onDeleteItem: (item: DynamoItem, key: DynamoKey) => void;
}) {
  const key = getItemKey(item);
  const entries = Object.entries(item);

  return (
    <tbody key={index} className="divide-y divide-slate-800">
      {entries.map(([attrKey, value], attrIndex) => (
        <tr key={`${index}-${attrKey}`} className={attrIndex === 0 ? '' : 'bg-slate-900/30'}>
          <td className="whitespace-nowrap p-3 font-mono text-sm text-cyan-400">
            {attrIndex === 0 ? (
              <>
                {attrKey}
                <span className="ml-2 rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">
                  {entries.length} attrs
                </span>
              </>
            ) : (
              attrKey
            )}
          </td>
          <td className="max-w-md break-all whitespace-pre-wrap p-3 font-mono text-sm text-slate-300">
            {isBinary(value)
              ? `Binary (${value.length} bytes): ${binaryToBase64(value)}`
              : formatValue(value)}
          </td>
          <td className="p-3">
            {attrIndex === 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteItem(item, key)}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                title="Delete item"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export function ItemResults({
  items,
  loading,
  error,
  onDeleteItem,
  getItemKey,
  onRetry,
  emptyMessage = 'No items found',
}: ItemResultsProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-3 text-left font-medium text-slate-400">Key</th>
                <th className="p-3 text-left font-medium text-slate-400">Value</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-800">
                  <td className="p-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-4 w-64" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-8 w-12" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card role="alert" className="border-red-500/20 bg-red-500/10 p-6 text-red-400">
        <p>Failed to load items</p>
        <p className="mt-1 text-sm text-slate-400">{error.message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="mt-4">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-slate-900/50">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="p-3 text-left font-medium text-slate-400">Attribute</th>
              <th className="p-3 text-left font-medium text-slate-400">Value</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          {items.map((item, index) => (
            <ItemRow
              key={index}
              item={item}
              index={index}
              getItemKey={getItemKey}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </table>
      </div>
    </Card>
  );
}

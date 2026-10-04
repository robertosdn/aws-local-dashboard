'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { DynamoKeyAttribute, SortKeyCondition, DynamoKeyValue } from '../types/dynamodb';

interface ItemQueryFormProps {
  partitionKey: DynamoKeyAttribute | undefined;
  sortKey: DynamoKeyAttribute | undefined;
  onQuery: (partitionKeyValue: DynamoKeyValue, sortKeyCondition?: SortKeyCondition) => void;
  loading: boolean;
}

const SORT_KEY_OPERATORS = [
  { value: 'EQ', label: 'Equals (EQ)' },
  { value: 'LT', label: 'Less Than (LT)' },
  { value: 'LE', label: 'Less Than or Equal (LE)' },
  { value: 'GT', label: 'Greater Than (GT)' },
  { value: 'GE', label: 'Greater Than or Equal (GE)' },
  { value: 'BETWEEN', label: 'Between (BETWEEN)' },
  { value: 'BEGINS_WITH', label: 'Begins With (BEGINS_WITH)' },
] as const;

type SortKeyOperator = 'EQ' | 'LT' | 'LE' | 'GT' | 'GE' | 'BETWEEN' | 'BEGINS_WITH';

export function ItemQueryForm({ partitionKey, sortKey, onQuery, loading }: ItemQueryFormProps) {
  const [partitionKeyValue, setPartitionKeyValue] = useState('');
  const [sortKeyOperator, setSortKeyOperator] = useState<SortKeyOperator>('EQ');
  const [sortKeyValue, setSortKeyValue] = useState('');
  const [sortKeyValue2, setSortKeyValue2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateAndSubmit = () => {
    setError(null);

    if (!partitionKey) {
      setError('Table has no partition key');
      return;
    }

    if (!partitionKeyValue.trim()) {
      setError('Partition key value is required');
      return;
    }

    let parsedPartitionKeyValue: DynamoKeyValue = partitionKeyValue;
    if (partitionKey.attributeType === 'N') {
      const num = Number(partitionKeyValue);
      if (!Number.isFinite(num)) {
        setError('Partition key must be a valid number');
        return;
      }
      parsedPartitionKeyValue = num;
    } else if (partitionKey.attributeType === 'B') {
      try {
        parsedPartitionKeyValue = Uint8Array.from(atob(partitionKeyValue), (c) => c.charCodeAt(0));
      } catch {
        setError('Partition key must be valid base64 for binary type');
        return;
      }
    }

    let sortKeyCondition: SortKeyCondition | undefined;
    if (sortKey) {
      if (sortKeyOperator === 'BETWEEN') {
        if (!sortKeyValue.trim() || !sortKeyValue2.trim()) {
          setError('Both values are required for BETWEEN');
          return;
        }
        let val1: DynamoKeyValue = sortKeyValue;
        let val2: DynamoKeyValue = sortKeyValue2;
        if (sortKey.attributeType === 'N') {
          const n1 = Number(sortKeyValue);
          const n2 = Number(sortKeyValue2);
          if (!Number.isFinite(n1) || !Number.isFinite(n2)) {
            setError('Both values must be valid numbers for BETWEEN');
            return;
          }
          val1 = n1;
          val2 = n2;
        } else if (sortKey.attributeType === 'B') {
          try {
            val1 = Uint8Array.from(atob(sortKeyValue), (c) => c.charCodeAt(0));
            val2 = Uint8Array.from(atob(sortKeyValue2), (c) => c.charCodeAt(0));
          } catch {
            setError('Both values must be valid base64 for binary type');
            return;
          }
        }
        sortKeyCondition = { operator: 'BETWEEN', value: [val1, val2] };
      } else if (sortKeyValue.trim()) {
        let parsedSortKeyValue: DynamoKeyValue = sortKeyValue;
        if (sortKey.attributeType === 'N') {
          const num = Number(sortKeyValue);
          if (!Number.isFinite(num)) {
            setError('Sort key must be a valid number');
            return;
          }
          parsedSortKeyValue = num;
        } else if (sortKey.attributeType === 'B') {
          try {
            parsedSortKeyValue = Uint8Array.from(atob(sortKeyValue), (c) => c.charCodeAt(0));
          } catch {
            setError('Sort key must be valid base64 for binary type');
            return;
          }
        }
        sortKeyCondition = { operator: sortKeyOperator, value: parsedSortKeyValue };
      }
    }

    onQuery(parsedPartitionKeyValue, sortKeyCondition);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="partition-key" className="text-sm font-medium text-slate-300">
          Partition Key:{' '}
          <code className="font-mono text-cyan-400">{partitionKey?.attributeName}</code>
          <span className="ml-1 text-slate-500">({partitionKey?.attributeType})</span>
        </Label>
        <Input
          id="partition-key"
          value={partitionKeyValue}
          onChange={(e) => setPartitionKeyValue(e.target.value)}
          placeholder={partitionKey?.attributeType === 'B' ? 'Enter base64 value' : 'Enter value'}
          disabled={loading}
          className="mt-1"
        />
      </div>

      {sortKey && (
        <div className="space-y-4">
          <Separator />
          <div>
            <Label htmlFor="sort-key-operator" className="text-sm font-medium text-slate-300">
              Sort Key Condition:{' '}
              <code className="font-mono text-cyan-400">{sortKey.attributeName}</code>
              <span className="ml-1 text-slate-500">({sortKey.attributeType})</span>
            </Label>
            <Select
              value={sortKeyOperator}
              onValueChange={(v) => setSortKeyOperator(v as SortKeyOperator)}
              disabled={loading}
            >
              <SelectTrigger id="sort-key-operator" className="mt-1">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {SORT_KEY_OPERATORS.filter(
                  (op) => op.value !== 'BEGINS_WITH' || sortKey.attributeType !== 'N',
                ).map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort-key-value" className="text-sm font-medium text-slate-300">
              Value
              {sortKeyOperator === 'BETWEEN' && (
                <span className="ml-1 text-slate-500">(Lower)</span>
              )}
            </Label>
            <Input
              id="sort-key-value"
              value={sortKeyValue}
              onChange={(e) => setSortKeyValue(e.target.value)}
              placeholder={sortKey.attributeType === 'B' ? 'Enter base64 value' : 'Enter value'}
              disabled={loading}
            />
            {sortKeyOperator === 'BETWEEN' && (
              <div>
                <Label htmlFor="sort-key-value-2" className="text-sm font-medium text-slate-300">
                  Value (Upper)
                </Label>
                <Input
                  id="sort-key-value-2"
                  value={sortKeyValue2}
                  onChange={(e) => setSortKeyValue2(e.target.value)}
                  placeholder={sortKey.attributeType === 'B' ? 'Enter base64 value' : 'Enter value'}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      <Button onClick={validateAndSubmit} disabled={loading} className="w-full">
        {loading ? 'Querying...' : 'Query Items'}
      </Button>
    </div>
  );
}

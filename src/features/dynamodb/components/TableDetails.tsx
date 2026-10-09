'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { DynamoTableDetails } from '../types/dynamodb';

interface TableDetailsProps {
  tableDetails: DynamoTableDetails | undefined;
  loading: boolean;
}

export function TableDetails({ tableDetails, loading }: TableDetailsProps) {
  if (loading || !tableDetails) {
    return (
      <Card className="bg-slate-900/50 p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Separator />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
      </Card>
    );
  }

  const partitionKey = tableDetails.keySchema.find((k) => k.keyType === 'HASH');
  const sortKey = tableDetails.keySchema.find((k) => k.keyType === 'RANGE');

  return (
    <Card className="space-y-4 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            Table View
          </p>
          <h3 className="mt-1 font-mono text-xl font-semibold text-white">
            {tableDetails.tableName}
          </h3>
        </div>
        <span className="text-sm text-slate-400">
          Status: <span className="font-medium text-white">{tableDetails.tableStatus}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-slate-500">Item Count</p>
          <p className="font-mono text-white">{tableDetails.itemCount?.toLocaleString() ?? '-'}</p>
        </div>
        <div>
          <p className="text-slate-500">Size (bytes)</p>
          <p className="font-mono text-white">
            {tableDetails.tableSizeBytes?.toLocaleString() ?? '-'}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Created</p>
          <p className="font-mono text-white">
            {tableDetails.creationDateTime
              ? new Date(tableDetails.creationDateTime).toLocaleString()
              : '-'}
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-300">Key Schema</h4>
        <div className="space-y-2">
          {partitionKey && (
            <div className="flex items-center gap-3 rounded border border-slate-700 bg-slate-800/50 p-3">
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/20 text-blue-400">
                Partition Key (HASH)
              </Badge>
              <code className="font-mono text-white">{partitionKey.attributeName}</code>
              <span className="text-slate-500">:</span>
              <code className="font-mono text-cyan-400">{partitionKey.attributeType}</code>
            </div>
          )}
          {sortKey && (
            <div className="flex items-center gap-3 rounded border border-slate-700 bg-slate-800/50 p-3">
              <Badge
                variant="outline"
                className="border-purple-500/30 bg-purple-500/20 text-purple-400"
              >
                Sort Key (RANGE)
              </Badge>
              <code className="font-mono text-white">{sortKey.attributeName}</code>
              <span className="text-slate-500">:</span>
              <code className="font-mono text-cyan-400">{sortKey.attributeType}</code>
            </div>
          )}
          {tableDetails.keySchema.length === 0 && (
            <p className="text-sm text-slate-500">No key schema available</p>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-300">Secondary Indexes</h4>
        {tableDetails.secondaryIndexes.length === 0 ? (
          <p className="text-sm text-slate-500">No secondary indexes</p>
        ) : (
          <div className="space-y-3">
            {tableDetails.secondaryIndexes.map((index) => (
              <div
                key={`${index.indexType}-${index.indexName}`}
                className="space-y-2 rounded border border-slate-700 bg-slate-800/50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <code className="break-all font-mono text-white">{index.indexName}</code>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                    {index.indexType === 'GLOBAL' ? 'Global secondary index' : 'Local secondary index'}
                  </Badge>
                  {index.indexStatus && (
                    <span className="text-xs text-slate-400">Status: {index.indexStatus}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {index.keySchema.map((key) => (
                    <span
                      key={`${key.keyType}-${key.attributeName}`}
                      className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300"
                    >
                      {key.keyType}: <code>{key.attributeName}</code> ({key.attributeType})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

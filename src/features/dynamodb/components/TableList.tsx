'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Info, Table as TableIcon, Trash2 } from 'lucide-react';
import type { DynamoTableSummary } from '../types/dynamodb';

interface TableListProps {
  tables: DynamoTableSummary[];
  loading: boolean;
  onViewTable: (tableName: string) => void;
  onViewItems: (tableName: string) => void;
  onDeleteTable: (tableName: string) => void;
  lastEvaluatedTableName?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function TableList({
  tables,
  loading,
  onViewTable,
  onViewItems,
  onDeleteTable,
  lastEvaluatedTableName,
  onLoadMore,
  hasMore,
  loadingMore = false,
}: TableListProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Size (bytes)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (tables.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">No tables found</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a table in the AWS emulator to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Size (bytes)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.tableName}>
                <TableCell className="font-mono text-cyan-400">{table.tableName}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                    {table.tableStatus || 'UNKNOWN'}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-slate-300">
                  {table.itemCount?.toLocaleString() ?? '-'}
                </TableCell>
                <TableCell className="text-right font-mono text-slate-300">
                  {table.tableSizeBytes?.toLocaleString() ?? '-'}
                </TableCell>
                <TableCell className="font-mono text-sm text-slate-400">
                  {table.creationDateTime
                    ? format(new Date(table.creationDateTime), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewTable(table.tableName)}
                      aria-label={`View details for ${table.tableName}`}
                      title="View table details"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewItems(table.tableName)}
                      aria-label={`View items in ${table.tableName}`}
                      title="View items"
                    >
                      <TableIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTable(table.tableName)}
                      aria-label={`Delete table ${table.tableName}`}
                      title="Delete table"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {hasMore && onLoadMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? 'Loading Tables...' : 'Load More Tables'}
          </button>
        </div>
      )}

      {lastEvaluatedTableName && !hasMore && (
        <p className="text-center text-sm text-slate-500">
          End of table list (last: {lastEvaluatedTableName})
        </p>
      )}
    </div>
  );
}

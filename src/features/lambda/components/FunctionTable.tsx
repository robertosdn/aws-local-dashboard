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
import { FunctionRow } from './FunctionRow';
import type { LambdaFunction } from '../types/lambda';

interface FunctionTableProps {
  functions: LambdaFunction[];
  loading: boolean;
  onInvoke: (fn: LambdaFunction) => void;
  onViewDetails: (fn: LambdaFunction) => void;
}

export function FunctionTable({ functions, loading, onInvoke, onViewDetails }: FunctionTableProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>Handler</TableHead>
              <TableHead className="text-right">Memory (MB)</TableHead>
              <TableHead className="text-right">Timeout (s)</TableHead>
              <TableHead>Last Modified</TableHead>
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
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
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

  if (functions.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">No functions found</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a function in the AWS emulator to get started
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead>Handler</TableHead>
            <TableHead className="text-right">Memory (MB)</TableHead>
            <TableHead className="text-right">Timeout (s)</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {functions.map((fn) => (
            <FunctionRow
              key={fn.functionArn}
              function={fn}
              onInvoke={onInvoke}
              onViewDetails={onViewDetails}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

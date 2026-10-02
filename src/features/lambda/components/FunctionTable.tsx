'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <div className="rounded-lg border border-slate-800 bg-slate-900/50">
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
                <TableCell><div className="h-4 w-48 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-40 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell className="text-right"><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell className="text-right"><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-36 bg-slate-800 animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-8 w-24 bg-slate-800 animate-pulse rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (functions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">No functions found</p>
        <p className="text-sm text-slate-500 mt-1">Create a function in the AWS emulator to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50">
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
    </div>
  );
}
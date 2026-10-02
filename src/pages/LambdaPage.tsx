'use client';

import { useState } from 'react';
import { useFunctions } from '@/features/lambda/hooks';
import { FunctionTable } from '@/features/lambda/components/FunctionTable';
import { FunctionDetailDialog } from '@/features/lambda/components/FunctionDetailDialog';
import { InvocationPanel } from '@/features/lambda/components/InvocationPanel';
import { RefreshButton } from '@/features/sqs/components/RefreshButton';
import { toast } from '@/hooks/use-toast';
import type { LambdaFunction } from '@/features/lambda/types/lambda';

export default function LambdaPage() {
  const { functions, loading, error, refetch } = useFunctions();

  const [selectedFunction, setSelectedFunction] = useState<LambdaFunction | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [invocationPanelOpen, setInvocationPanelOpen] = useState(false);
  const [functionToInvoke, setFunctionToInvoke] = useState<LambdaFunction | null>(null);

  const handleInvoke = (fn: LambdaFunction) => {
    setFunctionToInvoke(fn);
    setInvocationPanelOpen(true);
  };

  const handleViewDetails = (fn: LambdaFunction) => {
    setSelectedFunction(fn);
    setDetailDialogOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Refreshing',
      description: 'Fetching latest function data...',
    });
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">Lambda</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Functions</h2>
        <div className="mt-4 text-red-300">
          <p>Failed to connect to Lambda endpoint</p>
          <p className="text-sm text-slate-400 mt-1">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <RefreshButton onClick={handleRefresh} loading={loading} className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Lambda</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Functions</h2>
        </div>
        <RefreshButton onClick={handleRefresh} loading={loading} />
      </div>

      <FunctionTable
        functions={functions}
        loading={loading}
        onInvoke={handleInvoke}
        onViewDetails={handleViewDetails}
      />

      <FunctionDetailDialog
        function={selectedFunction}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      <InvocationPanel
        function={functionToInvoke}
        open={invocationPanelOpen}
        onOpenChange={(open) => {
          setInvocationPanelOpen(open);
          if (!open) setFunctionToInvoke(null);
        }}
      />
    </div>
  );
}
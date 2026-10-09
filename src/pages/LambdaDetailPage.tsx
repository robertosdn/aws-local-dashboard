'use client';

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ChevronLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getFunctionDetail } from '@/features/lambda/api';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { EventSourceMappingList } from '@/features/lambda/components/EventSourceMappingList';
import type { LambdaFunctionDetail } from '@/features/lambda/types';

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function getStateColor(state: string): string {
  switch (state) {
    case 'Active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Inactive':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Failed':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

function getStateIcon(state: string) {
  switch (state) {
    case 'Active':
      return <CheckCircle className="h-3 w-3 text-green-400" />;
    case 'Inactive':
      return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
    case 'Failed':
      return <XCircle className="h-3 w-3 text-red-400" />;
    default:
      return null;
  }
}

function ConfigurationTab({ functionConfig }: { functionConfig: LambdaFunctionDetail }) {
  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Function Name</label>
          <p className="mt-1 text-white font-medium">{functionConfig.functionName}</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Runtime</label>
          <p className="mt-1 text-white">{functionConfig.runtime}</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Handler</label>
          <p className="mt-1 text-white font-mono text-sm">{functionConfig.handler}</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Memory</label>
          <p className="mt-1 text-white">{functionConfig.memorySize} MB</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Timeout</label>
          <p className="mt-1 text-white">{functionConfig.timeout} seconds</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Code Size</label>
          <p className="mt-1 text-white">{(functionConfig.codeSize / 1024).toFixed(2)} KB</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Version</label>
          <p className="mt-1 text-white font-mono text-sm">{functionConfig.version}</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Last Modified</label>
          <p className="mt-1 text-white">{new Date(functionConfig.lastModified).toLocaleString()}</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">State</label>
          <p className="mt-1 text-white">{functionConfig.state}</p>
        </div>
      </div>

      {functionConfig.description && (
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Description</label>
          <p className="mt-1 text-slate-300">{functionConfig.description}</p>
        </div>
      )}

      <div className="pt-4 border-t border-slate-800">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Code Configuration</label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 text-sm">Repository Type</p>
            <p className="mt-1 text-white font-mono text-sm">{functionConfig.code.repositoryType}</p>
          </div>
          {functionConfig.code.location && (
            <div>
              <p className="text-slate-500 text-sm">S3 Location</p>
              <p className="mt-1 text-white font-mono text-xs truncate max-w-xs">{functionConfig.code.location}</p>
            </div>
          )}
          {functionConfig.code.imageUri && (
            <div className="md:col-span-2">
              <p className="text-slate-500 text-sm">Container Image URI</p>
              <p className="mt-1 text-white font-mono text-xs truncate">{functionConfig.code.imageUri}</p>
            </div>
          )}
          {functionConfig.code.resolvedImageUri && (
            <div className="md:col-span-2">
              <p className="text-slate-500 text-sm">Resolved Image URI</p>
              <p className="mt-1 text-white font-mono text-xs truncate">{functionConfig.code.resolvedImageUri}</p>
            </div>
          )}
        </div>
      </div>

      {functionConfig.environment?.variables && Object.keys(functionConfig.environment.variables).length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Environment Variables</label>
          <pre className="mt-2 p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300 overflow-auto max-h-64">
            {formatJson(functionConfig.environment.variables)}
          </pre>
        </div>
      )}

      {functionConfig.vpcConfig && (
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">VPC Configuration</label>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">VPC ID</p>
              <p className="text-white font-mono">{functionConfig.vpcConfig.vpcId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500">Subnets</p>
              <p className="text-white font-mono">{functionConfig.vpcConfig.subnetIds.join(', ') || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500">Security Groups</p>
              <p className="text-white font-mono">{functionConfig.vpcConfig.securityGroupIds.join(', ') || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {functionConfig.layers && functionConfig.layers.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Layers</label>
          <ul className="mt-2 space-y-1">
            {functionConfig.layers.map((layer, i) => (
              <li key={i} className="text-sm text-slate-300 font-mono truncate max-w-md">
                {layer.arn} ({layer.codeSize} bytes)
              </li>
            ))}
          </ul>
        </div>
      )}

      {functionConfig.tracingConfig && (
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Tracing Config</label>
          <p className="mt-1 text-white">{functionConfig.tracingConfig.mode}</p>
        </div>
      )}

      {functionConfig.revisionId && (
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Revision ID</label>
          <p className="mt-1 text-white font-mono text-sm">{functionConfig.revisionId}</p>
        </div>
      )}
    </div>
  );
}

export default function LambdaDetailPage() {
  const { functionName } = useParams<{ functionName: string }>();
  const navigate = useNavigate();
  const { endpoint, settings } = useSettings();

  const { data: functionConfig, isLoading, error } = useQuery({
    queryKey: ['lambda', 'function-detail', functionName, endpoint, settings.region],
    queryFn: () => getFunctionDetail(functionName!, { endpoint, region: settings.region }),
    enabled: !!functionName,
    staleTime: 30_000,
  });

  const handleBack = () => navigate('/lambda');

  const handleCopyArn = (arn: string) => {
    navigator.clipboard.writeText(arn);
    toast({ title: 'Copied', description: 'Function ARN copied to clipboard', variant: 'success' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Back to functions">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-slate-800 animate-pulse rounded" />
              <div className="h-8 w-full bg-slate-800 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !functionConfig) {
    return (
      <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">Lambda</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Function Not Found</h2>
          </div>
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Functions
          </Button>
        </div>
        <div className="mt-4 text-red-300">
          <p>Failed to load function configuration</p>
          <p className="text-sm text-slate-400 mt-1">
            {error instanceof Error ? error.message : 'Function not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Back to functions">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Lambda</p>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-semibold text-white">{functionConfig.functionName}</h2>
              <Badge variant="outline" className={getStateColor(functionConfig.state)}>
                {getStateIcon(functionConfig.state)}
                {functionConfig.state}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => handleCopyArn(functionConfig.functionArn)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy ARN
        </Button>
      </div>

      <Tabs defaultValue="configuration" className="bg-slate-900/50 rounded-2xl border border-slate-700">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="event-sources">Event Sources</TabsTrigger>
        </TabsList>
        <TabsContent value="configuration">
          <ConfigurationTab functionConfig={functionConfig as LambdaFunctionDetail} />
        </TabsContent>
        <TabsContent value="event-sources">
          <div className="p-4">
            <EventSourceMappingList functionName={functionConfig.functionName} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
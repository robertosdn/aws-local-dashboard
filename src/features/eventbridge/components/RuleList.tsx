import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Skeleton } from '@/components/ui/skeleton';
import { useRuleTargets } from '../hooks/useRuleTargets';
import type { EventBridgeRule } from '../types/eventbridge';

interface RuleTargetsProps {
  eventBusName: string;
  ruleName: string;
}

function RuleTargets({ eventBusName, ruleName }: RuleTargetsProps) {
  const { targets, loading, error } = useRuleTargets(eventBusName, ruleName);

  if (loading) {
    return <Skeleton className="h-4 w-48" />;
  }

  if (error) {
    return <p className="text-xs text-red-300">Failed to load targets.</p>;
  }

  if (targets.length === 0) {
    return <p className="text-xs text-slate-500">No targets.</p>;
  }

  return (
    <ul className="space-y-1">
      {targets.map((target) => (
        <li key={target.id} className="text-xs text-slate-300">
          <span className="font-mono text-cyan-300">{target.id}</span>
          <span className="mx-1 text-slate-500">→</span>
          <span className="break-all font-mono">{target.arn}</span>
          {target.roleArn ? (
            <span className="ml-1 break-all text-slate-500">(role: {target.roleArn})</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

interface RuleListProps {
  eventBusName: string;
  rules: EventBridgeRule[];
  loading: boolean;
  error?: unknown;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

export function RuleList({
  eventBusName,
  rules,
  loading,
  error,
  hasNextPage,
  onLoadMore,
  onRetry,
}: RuleListProps) {
  if (loading) {
    return (
      <Card className="space-y-3 bg-slate-900/50 p-6">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-6 w-full" />
        ))}
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-3 border-red-500/50 bg-red-500/10 p-6" role="alert">
        <p className="font-medium text-red-300">Failed to load rules</p>
        <p className="text-sm text-slate-300">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <div>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (rules.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-8 text-center">
        <p className="text-slate-300">No rules on this event bus</p>
        <p className="mt-1 text-sm text-slate-500">
          Rules are managed separately and will appear here once created.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.arn || rule.name} className="space-y-4 bg-slate-900/50 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="break-all font-mono text-white">{rule.name}</h4>
            <Badge variant={rule.state === 'ENABLED' ? 'success' : 'secondary'}>
              {rule.state}
            </Badge>
          </div>

          {rule.description ? <p className="text-sm text-slate-400">{rule.description}</p> : null}

          {rule.eventPattern ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Event pattern
              </p>
              <CodeBlock value={rule.eventPattern} />
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Targets</p>
            <RuleTargets eventBusName={eventBusName} ruleName={rule.name} />
          </div>
        </Card>
      ))}

      {hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load more rules
          </Button>
        </div>
      ) : null}
    </div>
  );
}

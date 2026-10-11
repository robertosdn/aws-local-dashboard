import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Skeleton } from '@/components/ui/skeleton';
import { useRuleTargets } from '../hooks/useRuleTargets';
import type { EventBridgeRule } from '../types/eventbridge';

interface RuleTargetsProps {
  eventBusName: string;
  ruleName: string;
  initialTargets?: EventBridgeRule['targets'];
  targetsLoaded?: boolean;
}

function RuleTargets({ eventBusName, ruleName, initialTargets, targetsLoaded }: RuleTargetsProps) {
  const {
    targets: fetchedTargets,
    loading,
    error,
  } = useRuleTargets(eventBusName, ruleName, !targetsLoaded);
  const targets = targetsLoaded ? (initialTargets ?? []) : fetchedTargets;

  if (!targetsLoaded && loading) {
    return <Skeleton className="h-4 w-48" />;
  }

  if (error && !targetsLoaded) {
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
  actionsDisabled?: boolean;
  rules: EventBridgeRule[];
  loading: boolean;
  error?: unknown;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onCreateRule?: () => void;
  onEditRule?: (rule: EventBridgeRule) => void;
  onDeleteRule?: (rule: EventBridgeRule) => void;
  onSetRuleState?: (rule: EventBridgeRule, state: 'ENABLED' | 'DISABLED') => void;
  pendingRuleName?: string | null;
}

export function RuleList({
  eventBusName,
  actionsDisabled = false,
  rules,
  loading,
  error,
  hasNextPage,
  onLoadMore,
  onRetry,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  onSetRuleState,
  pendingRuleName,
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
      <Card className="space-y-3 bg-slate-900/50 p-8 text-center">
        <p className="text-slate-300">No rules on this event bus</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a rule to start routing matching events.
        </p>
        {onCreateRule ? (
          <Button disabled={actionsDisabled} onClick={onCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            Create rule
          </Button>
        ) : null}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {onCreateRule ? (
        <div className="flex justify-end">
          <Button disabled={actionsDisabled} onClick={onCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            Create rule
          </Button>
        </div>
      ) : null}
      {rules.map((rule) => (
        <Card key={rule.arn || rule.name} className="space-y-4 bg-slate-900/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="break-all font-mono text-white">{rule.name}</h4>
              <Badge variant={rule.state === 'ENABLED' ? 'success' : 'secondary'}>
                {rule.state}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {onSetRuleState ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionsDisabled || pendingRuleName === rule.name}
                  onClick={() =>
                    onSetRuleState(rule, rule.state === 'ENABLED' ? 'DISABLED' : 'ENABLED')
                  }
                  aria-label={`${rule.state === 'ENABLED' ? 'Disable' : 'Enable'} rule ${rule.name}`}
                >
                  {rule.state === 'ENABLED' ? 'Disable' : 'Enable'}
                </Button>
              ) : null}
              {onEditRule ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit rule ${rule.name}`}
                  title="Edit rule"
                  disabled={actionsDisabled}
                  onClick={() => onEditRule(rule)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
              {onDeleteRule ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete rule ${rule.name}`}
                  title="Delete rule"
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  disabled={actionsDisabled}
                  onClick={() => onDeleteRule(rule)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          {rule.description ? <p className="text-sm text-slate-400">{rule.description}</p> : null}

          {rule.eventPattern ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Event pattern
              </p>
              <CodeBlock value={rule.eventPattern} />
            </div>
          ) : (
            <p className="text-xs text-slate-500">Matches all events (no event pattern).</p>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Targets</p>
            <RuleTargets
              eventBusName={eventBusName}
              ruleName={rule.name}
              initialTargets={rule.targets}
              targetsLoaded={rule.targetsLoaded}
            />
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

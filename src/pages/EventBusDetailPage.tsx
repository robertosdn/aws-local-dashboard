import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DeleteRuleDialog,
  EventBusDetails,
  RuleFormDialog,
  RuleList,
  useDeleteRule,
  useEventBusDetails,
  useEventBusRules,
  useSaveRule,
  useSetRuleState,
} from '@/features/eventbridge';
import type { EventBridgeRule, RuleFormValues } from '@/features/eventbridge/types/eventbridge';

export default function EventBusDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [ruleTokens, setRuleTokens] = useState<Array<string | undefined>>([undefined]);
  const [rulePageIndex, setRulePageIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EventBridgeRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<EventBridgeRule | null>(null);
  const [pendingRuleName, setPendingRuleName] = useState<string | null>(null);
  const { toast } = useToast();

  const details = useEventBusDetails(name ?? null);
  const ruleCursor = ruleTokens[rulePageIndex];
  const rules = useEventBusRules(name ?? null, ruleCursor);
  const saveMutation = useSaveRule(name ?? '');
  const deleteMutation = useDeleteRule(name ?? '');
  const stateMutation = useSetRuleState(name ?? '');

  const goBack = () => navigate('/eventbridge/eventbuses');

  const loadMoreRules = () => {
    if (!rules.nextToken) return;
    setRuleTokens((tokens) => [...tokens.slice(0, rulePageIndex + 1), rules.nextToken]);
    setRulePageIndex((index) => index + 1);
  };

  const saveRule = async (values: RuleFormValues, originalTargetIds: string[]) => {
    try {
      await saveMutation.saveRule({
        eventBusName: name ?? '',
        originalName: editingRule?.name,
        originalTargetIds,
        values,
      });
      setFormOpen(false);
      setEditingRule(null);
      toast({ title: editingRule ? 'Rule updated' : 'Rule created', description: values.name });
    } catch (error) {
      toast({
        title: 'Could not save rule',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const deleteSelectedRule = async () => {
    if (!deletingRule || !name) return;
    try {
      await deleteMutation.deleteRule({ eventBusName: name, ruleName: deletingRule.name });
      toast({ title: 'Rule deleted', description: deletingRule.name });
      setDeletingRule(null);
    } catch (error) {
      toast({
        title: 'Could not delete rule',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const setSelectedRuleState = async (rule: EventBridgeRule, state: 'ENABLED' | 'DISABLED') => {
    if (!name) return;
    setPendingRuleName(rule.name);
    try {
      await stateMutation.setRuleState({ eventBusName: name, ruleName: rule.name, state });
      toast({
        title: `Rule ${state === 'ENABLED' ? 'enabled' : 'disabled'}`,
        description: rule.name,
      });
    } catch (error) {
      toast({
        title: 'Could not update rule state',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setPendingRuleName(null);
    }
  };

  if (details.error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6" role="alert">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">EventBridge</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Event bus not found</h2>
          <p className="mt-4 break-all text-sm text-slate-300">
            {details.error instanceof Error
              ? details.error.message
              : 'Unable to load this event bus.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void details.refetch()}>
              Retry
            </Button>
            <Button variant="ghost" onClick={goBack}>
              Back to event buses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <EventBusDetails
        eventBusDetails={details.eventBusDetails}
        loading={details.loading}
        onBack={goBack}
      />

      {details.eventBusDetails ? (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Rules</h3>
          <RuleList
            eventBusName={details.eventBusDetails.name}
            actionsDisabled={Boolean(rules.fetching)}
            rules={rules.rules}
            loading={rules.loading}
            error={rules.error}
            hasNextPage={Boolean(rules.nextToken)}
            onLoadMore={loadMoreRules}
            onRetry={() => void rules.refetch()}
            onCreateRule={() => {
              setEditingRule(null);
              setFormOpen(true);
            }}
            onEditRule={(rule) => {
              setEditingRule(rule);
              setFormOpen(true);
            }}
            onDeleteRule={setDeletingRule}
            onSetRuleState={(rule, state) => void setSelectedRuleState(rule, state)}
            pendingRuleName={pendingRuleName}
          />
          <RuleFormDialog
            open={formOpen}
            eventBusName={details.eventBusDetails.name}
            rule={editingRule}
            pending={saveMutation.pending}
            error={saveMutation.error}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) setEditingRule(null);
            }}
            onSave={(values, originalTargetIds) => void saveRule(values, originalTargetIds)}
          />
          <DeleteRuleDialog
            ruleName={deletingRule?.name ?? null}
            pending={deleteMutation.pending}
            error={deleteMutation.error}
            onOpenChange={(open) => {
              if (!open) setDeletingRule(null);
            }}
            onConfirm={() => void deleteSelectedRule()}
          />
        </section>
      ) : null}
    </div>
  );
}

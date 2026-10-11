import { useEffect, useMemo, useState } from 'react';
import { useRuleTargets } from '../hooks/useRuleTargets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import {
  Dialog,
  DialogAction,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventPatternField } from './EventPatternField';
import { RuleTargetsEditor } from './RuleTargetsEditor';
import { validateEventPattern } from '../lib/eventPattern';
import type { EventBridgeRule, RuleFormValues, RuleTargetInput } from '../types/eventbridge';

interface RuleFormDialogProps {
  open: boolean;
  eventBusName: string;
  rule?: EventBridgeRule | null;
  pending: boolean;
  error?: unknown;
  onOpenChange: (open: boolean) => void;
  onSave: (values: RuleFormValues, originalTargetIds: string[]) => void;
}

const emptyValues = (): RuleFormValues => ({
  name: '',
  description: '',
  eventPattern: '',
  state: 'ENABLED',
  targets: [{ id: '', arn: '' }],
});

export function RuleFormDialog({
  open,
  eventBusName,
  rule,
  pending,
  error,
  onOpenChange,
  onSave,
}: RuleFormDialogProps) {
  const [values, setValues] = useState<RuleFormValues>(emptyValues);
  const [touched, setTouched] = useState(false);
  const fetchedTargets = useRuleTargets(
    open && rule ? eventBusName : null,
    open && rule ? rule.name : null,
    Boolean(open && rule && !rule.targetsLoaded),
  );
  useEffect(() => {
    if (!open) return;
    setValues(
      rule
        ? {
            name: rule.name,
            description: rule.description ?? '',
            eventPattern: rule.eventPattern ?? '',
            state: rule.state,
            targets: rule.targets.map(({ id, arn, roleArn, input, inputPath }) => ({
              id,
              arn,
              roleArn,
              input,
              inputPath,
            })),
          }
        : emptyValues(),
    );
    setTouched(false);
  }, [open, rule]);
  useEffect(() => {
    if (!rule || !open || fetchedTargets.loading || fetchedTargets.error) return;
    setValues((current) => ({
      ...current,
      targets: fetchedTargets.targets.map(({ id, arn, roleArn, input, inputPath }) => ({
        id,
        arn,
        roleArn,
        input,
        inputPath,
      })),
    }));
  }, [fetchedTargets.error, fetchedTargets.loading, fetchedTargets.targets, open, rule]);

  const pattern = useMemo(() => validateEventPattern(values.eventPattern), [values.eventPattern]);
  const nameValid =
    values.name.length > 0 && values.name.length <= 64 && /^[.\-_A-Za-z0-9]+$/.test(values.name);
  const targetsValid =
    !fetchedTargets.loading &&
    !fetchedTargets.error &&
    values.targets.length > 0 &&
    values.targets.every(
      (target, index) =>
        target.id.trim() &&
        target.arn.trim() &&
        /^arn:[^:]+:[^:]+:[^:]*:[^:]*:.+$/.test(target.arn.trim()) &&
        values.targets.findIndex((candidate) => candidate.id.trim() === target.id.trim()) === index,
    );
  const valid =
    nameValid &&
    (values.description?.length ?? 0) <= 512 &&
    pattern.valid &&
    targetsValid &&
    !fetchedTargets.error;

  const update = (
    field: keyof RuleFormValues,
    value: string | RuleTargetInput[] | 'ENABLED' | 'DISABLED',
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
        onInteractOutside={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit rule' : 'Create rule'}</DialogTitle>
          <DialogDescription>
            Configure a rule for event bus <code>{eventBusName}</code>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule name</Label>
            <Input
              id="rule-name"
              value={values.name}
              disabled={Boolean(rule)}
              onChange={(event) => update('name', event.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && !nameValid}
            />
            {rule ? (
              <p className="text-xs text-slate-500">Rule names cannot be changed after creation.</p>
            ) : null}
            {touched && !nameValid ? (
              <p className="text-sm text-red-300">
                Enter a name of up to 64 letters, numbers, periods, hyphens, or underscores.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-description">Description (optional)</Label>
            <Textarea
              id="rule-description"
              value={values.description ?? ''}
              maxLength={512}
              onChange={(event) => update('description', event.target.value)}
            />
          </div>
          <EventPatternField
            value={values.eventPattern}
            onChange={(value) => update('eventPattern', value)}
          />
          <div className="flex items-center gap-3">
            <Label htmlFor="rule-state">Rule enabled</Label>
            <Toggle
              id="rule-state"
              pressed={values.state === 'ENABLED'}
              onPressedChange={(enabled) => update('state', enabled ? 'ENABLED' : 'DISABLED')}
            >
              {' '}
              {values.state === 'ENABLED' ? 'Enabled' : 'Disabled'}{' '}
            </Toggle>
          </div>
          {(values.description?.length ?? 0) > 512 ? (
            <p role="alert" className="text-sm text-red-300">
              Description must be 512 characters or fewer.
            </p>
          ) : null}
          {rule && fetchedTargets.error ? (
            <p role="alert" className="text-sm text-red-300">
              Could not load targets:{' '}
              {fetchedTargets.error instanceof Error
                ? fetchedTargets.error.message
                : 'Unknown error'}
            </p>
          ) : null}
          {rule && fetchedTargets.loading ? (
            <p className="text-sm text-slate-400">Loading existing targets...</p>
          ) : (
            <RuleTargetsEditor
              targets={values.targets}
              onChange={(targets) => update('targets', targets)}
            />
          )}
          {error ? (
            <p
              role="alert"
              className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200"
            >
              {error instanceof Error ? error.message : 'Unable to save rule.'}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <DialogAction disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </DialogAction>
          <Button
            disabled={!valid || pending}
            onClick={() => {
              setTouched(true);
              if (valid)
                onSave(values, rule ? fetchedTargets.targets.map((target) => target.id) : []);
            }}
          >
            {pending ? 'Saving...' : 'Save rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

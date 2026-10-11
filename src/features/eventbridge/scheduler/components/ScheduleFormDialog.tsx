import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogAction,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { validateScheduleExpression, validateScheduleTimezone } from '../lib/scheduleExpression';
import { useScheduleDetails } from '../hooks/useScheduleDetails';
import { ScheduleExpressionField } from './ScheduleExpressionField';
import { ScheduleTargetEditor } from './ScheduleTargetEditor';
import { validateScheduleTarget } from '../lib/scheduleTarget';
import type {
  ScheduleDetails,
  ScheduleFormValues,
  ScheduleValidationIssue,
} from '../types/scheduler';

interface ScheduleFormDialogProps {
  open: boolean;
  groupName: string;
  /** Present when editing; the schedule name is immutable. */
  scheduleName?: string | null;
  pending: boolean;
  error?: unknown;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ScheduleFormValues) => void;
}

const emptyValues = (): ScheduleFormValues => ({
  name: '',
  description: '',
  scheduleExpression: '',
  scheduleExpressionTimezone: 'UTC',
  state: 'ENABLED',
  actionAfterCompletion: 'NONE',
  startDate: '',
  endDate: '',
  flexibleTimeWindow: { mode: 'OFF' },
  target: { arn: '' },
});

function toDateInput(value?: Date): string {
  return value ? new Date(value).toISOString().slice(0, 19) : '';
}

function fromScheduleDetails(details: ScheduleDetails): ScheduleFormValues {
  const target = details.target;
  return {
    name: details.name,
    description: details.description ?? '',
    scheduleExpression: details.scheduleExpression ?? '',
    scheduleExpressionTimezone: details.scheduleExpressionTimezone ?? 'UTC',
    state: details.state,
    actionAfterCompletion: details.actionAfterCompletion ?? 'NONE',
    startDate: toDateInput(details.startDate),
    endDate: toDateInput(details.endDate),
    flexibleTimeWindow: details.flexibleTimeWindow ?? { mode: 'OFF' },
    target: {
      arn: target?.arn ?? '',
      roleArn: target?.roleArn,
      input: target?.input,
      retryPolicy: target?.retryPolicy,
      deadLetterConfig: target?.deadLetterConfig,
      sqsParameters: target?.sqsParameters,
      eventBridgeParameters: target?.eventBridgeParameters,
      kinesisParameters: target?.kinesisParameters,
    },
  };
}

function validateName(name: string): ScheduleValidationIssue[] {
  if (!name.trim())
    return [{ path: 'name', message: 'Schedule name is required', severity: 'error' }];
  if (name.length > 64)
    return [
      { path: 'name', message: 'Schedule name must be 64 characters or fewer', severity: 'error' },
    ];
  if (!/^[0-9A-Za-z\-_.]+$/.test(name))
    return [
      {
        path: 'name',
        message:
          'Schedule name may only contain letters, numbers, hyphens, underscores, and periods',
        severity: 'error',
      },
    ];
  return [];
}

function validateDates(values: ScheduleFormValues): ScheduleValidationIssue[] {
  const issues: ScheduleValidationIssue[] = [];
  const start = values.startDate?.trim() ? new Date(values.startDate) : undefined;
  const end = values.endDate?.trim() ? new Date(values.endDate) : undefined;

  if (values.startDate?.trim() && (!start || Number.isNaN(start.getTime()))) {
    issues.push({
      path: 'startDate',
      message: 'Start date must be a valid timestamp',
      severity: 'error',
    });
  }
  if (values.endDate?.trim() && (!end || Number.isNaN(end.getTime()))) {
    issues.push({
      path: 'endDate',
      message: 'End date must be a valid timestamp',
      severity: 'error',
    });
  }
  if (
    start &&
    end &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    end <= start
  ) {
    issues.push({
      path: 'endDate',
      message: 'End date must be after the start date',
      severity: 'error',
    });
  }
  return issues;
}

function validateFlexibleWindow(values: ScheduleFormValues): ScheduleValidationIssue[] {
  if (values.flexibleTimeWindow.mode !== 'FLEXIBLE') return [];
  const minutes = values.flexibleTimeWindow.maximumWindowInMinutes;
  if (minutes === undefined || minutes < 1 || minutes > 1440) {
    return [
      {
        path: 'flexibleTimeWindow',
        message: 'A flexible window must be between 1 and 1440 minutes',
        severity: 'error',
      },
    ];
  }
  return [];
}

export function ScheduleFormDialog({
  open,
  groupName,
  scheduleName,
  pending,
  error,
  onOpenChange,
  onSave,
}: ScheduleFormDialogProps) {
  const [values, setValues] = useState<ScheduleFormValues>(emptyValues);
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);

  const details = useScheduleDetails(groupName, open && scheduleName ? scheduleName : null);
  const isEditing = Boolean(scheduleName);

  useEffect(() => {
    if (!open) return;
    setValues(isEditing && scheduleName ? { ...emptyValues(), name: scheduleName } : emptyValues());
    setTouched(false);
    setDirty(false);
  }, [open, isEditing, scheduleName]);

  useEffect(() => {
    if (!open || !isEditing || dirty || !details.scheduleDetails) return;
    setValues(fromScheduleDetails(details.scheduleDetails));
  }, [details.scheduleDetails, dirty, isEditing, open]);

  const update = (next: ScheduleFormValues) => {
    setDirty(true);
    setValues(next);
  };

  const nameIssues = validateName(values.name);
  const expressionIssues = validateScheduleExpression(values.scheduleExpression).issues;
  const timezoneIssues = validateScheduleTimezone(values.scheduleExpressionTimezone);
  const targetIssues = validateScheduleTarget(values.target);
  const dateIssues = validateDates(values);
  const windowIssues = validateFlexibleWindow(values);

  const allIssues = [
    ...nameIssues,
    ...expressionIssues,
    ...timezoneIssues,
    ...targetIssues,
    ...dateIssues,
    ...windowIssues,
  ];
  const errors = allIssues.filter((entry) => entry.severity === 'error');
  const prefillPending = isEditing && !dirty && (details.loading || !details.scheduleDetails);
  const valid = errors.length === 0;

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
          <DialogTitle>{isEditing ? 'Edit schedule' : 'Create schedule'}</DialogTitle>
          <DialogDescription>
            Configure a schedule in group <code>{groupName}</code>.
          </DialogDescription>
        </DialogHeader>

        {prefillPending ? (
          <p className="text-sm text-slate-400">Loading the current schedule configuration...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Schedule name</Label>
                <Input
                  id="schedule-name"
                  value={values.name}
                  disabled={isEditing}
                  onChange={(event) => update({ ...values, name: event.target.value })}
                  onBlur={() => setTouched(true)}
                  aria-invalid={touched && nameIssues.length > 0}
                />
                {isEditing ? (
                  <p className="text-xs text-slate-500">
                    Schedule names cannot be changed after creation.
                  </p>
                ) : null}
                {touched && nameIssues.length > 0 ? (
                  <p className="text-sm text-red-300">{nameIssues[0].message}</p>
                ) : null}
              </div>
              <div className="flex items-end gap-3">
                <Label htmlFor="schedule-state">Schedule enabled</Label>
                <Toggle
                  id="schedule-state"
                  pressed={values.state === 'ENABLED'}
                  onPressedChange={(enabled) =>
                    update({ ...values, state: enabled ? 'ENABLED' : 'DISABLED' })
                  }
                >
                  {values.state === 'ENABLED' ? 'Enabled' : 'Disabled'}
                </Toggle>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-description">Description (optional)</Label>
              <Textarea
                id="schedule-description"
                value={values.description ?? ''}
                maxLength={512}
                onChange={(event) => update({ ...values, description: event.target.value })}
              />
            </div>

            <ScheduleExpressionField
              expression={values.scheduleExpression}
              timezone={values.scheduleExpressionTimezone}
              onExpressionChange={(value) => update({ ...values, scheduleExpression: value })}
              onTimezoneChange={(value) => update({ ...values, scheduleExpressionTimezone: value })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule-start">Start date (optional, UTC)</Label>
                <Input
                  id="schedule-start"
                  value={values.startDate ?? ''}
                  onChange={(event) => update({ ...values, startDate: event.target.value })}
                  placeholder="2025-01-01T12:00:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-end">End date (optional, UTC)</Label>
                <Input
                  id="schedule-end"
                  value={values.endDate ?? ''}
                  onChange={(event) => update({ ...values, endDate: event.target.value })}
                  placeholder="2025-12-31T12:00:00"
                  aria-invalid={dateIssues.some((entry) => entry.path === 'endDate')}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule-flexible-window">Flexible time window</Label>
                <Select
                  value={values.flexibleTimeWindow.mode}
                  onValueChange={(mode) =>
                    update({
                      ...values,
                      flexibleTimeWindow: {
                        mode: mode === 'FLEXIBLE' ? 'FLEXIBLE' : 'OFF',
                        maximumWindowInMinutes:
                          mode === 'FLEXIBLE'
                            ? values.flexibleTimeWindow.maximumWindowInMinutes
                            : undefined,
                      },
                    })
                  }
                >
                  <SelectTrigger id="schedule-flexible-window">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFF">Off</SelectItem>
                    <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                {values.flexibleTimeWindow.mode === 'FLEXIBLE' ? (
                  <Input
                    type="number"
                    aria-label="Maximum window in minutes"
                    value={values.flexibleTimeWindow.maximumWindowInMinutes ?? ''}
                    onChange={(event) =>
                      update({
                        ...values,
                        flexibleTimeWindow: {
                          mode: 'FLEXIBLE',
                          maximumWindowInMinutes:
                            event.target.value === '' ? undefined : Number(event.target.value),
                        },
                      })
                    }
                  />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-action-after-completion">Action after completion</Label>
                <Select
                  value={values.actionAfterCompletion}
                  onValueChange={(value) =>
                    update({
                      ...values,
                      actionAfterCompletion: value === 'DELETE' ? 'DELETE' : 'NONE',
                    })
                  }
                >
                  <SelectTrigger id="schedule-action-after-completion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScheduleTargetEditor
              target={values.target}
              onChange={(target) => update({ ...values, target })}
            />

            {dateIssues
              .concat(windowIssues)
              .filter((entry) => entry.severity === 'error')
              .map((entry) => (
                <p
                  key={`${entry.path}-${entry.message}`}
                  role="alert"
                  className="text-sm text-red-300"
                >
                  {entry.message}
                </p>
              ))}

            {error ? (
              <p
                role="alert"
                className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {error instanceof Error ? error.message : 'Unable to save schedule.'}
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <DialogAction disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </DialogAction>
          <Button
            disabled={!valid || pending || prefillPending}
            onClick={() => {
              setTouched(true);
              if (valid) onSave(values);
            }}
          >
            {pending ? 'Saving...' : 'Save schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

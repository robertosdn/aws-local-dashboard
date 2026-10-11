import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { targetService, validateScheduleTarget } from '../lib/scheduleTarget';
import type { ScheduleTargetInput } from '../types/scheduler';

interface ScheduleTargetEditorProps {
  target: ScheduleTargetInput;
  onChange: (target: ScheduleTargetInput) => void;
}

export function ScheduleTargetEditor({ target, onChange }: ScheduleTargetEditorProps) {
  const issues = validateScheduleTarget(target);
  const service = targetService(target);

  const update = (patch: Partial<ScheduleTargetInput>) => onChange({ ...target, ...patch });

  const updateNumber = (
    key: 'maximumEventAgeInSeconds' | 'maximumRetryAttempts',
    value: string,
  ) => {
    const trimmed = value.trim();
    update({
      retryPolicy: {
        ...target.retryPolicy,
        [key]: trimmed === '' ? undefined : Number(trimmed),
      },
    });
  };

  return (
    <section className="space-y-4" aria-label="Schedule target">
      <h3 className="font-medium text-white">Target</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="target-arn">Target ARN</Label>
          <Input
            id="target-arn"
            value={target.arn}
            onChange={(event) => update({ arn: event.target.value })}
            aria-invalid={issues.some((entry) => entry.path === 'target.arn')}
            placeholder="arn:aws:sqs:us-east-1:000000000000:my-queue"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-role-arn">Role ARN</Label>
          <Input
            id="target-role-arn"
            value={target.roleArn ?? ''}
            onChange={(event) => update({ roleArn: event.target.value })}
            aria-invalid={issues.some((entry) => entry.path === 'target.roleArn')}
            placeholder="arn:aws:iam::000000000000:role/scheduler-role"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-input">Input payload (optional, JSON)</Label>
        <Input
          id="target-input"
          value={target.input ?? ''}
          onChange={(event) => update({ input: event.target.value })}
          aria-invalid={issues.some((entry) => entry.path === 'target.input')}
          className="font-mono"
          placeholder='{"key":"value"}'
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="target-max-age">Max event age (seconds)</Label>
          <Input
            id="target-max-age"
            type="number"
            value={target.retryPolicy?.maximumEventAgeInSeconds ?? ''}
            onChange={(event) => updateNumber('maximumEventAgeInSeconds', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-max-attempts">Max retry attempts</Label>
          <Input
            id="target-max-attempts"
            type="number"
            value={target.retryPolicy?.maximumRetryAttempts ?? ''}
            onChange={(event) => updateNumber('maximumRetryAttempts', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-dlq">Dead-letter queue ARN (optional)</Label>
          <Input
            id="target-dlq"
            value={target.deadLetterConfig?.arn ?? ''}
            onChange={(event) => update({ deadLetterConfig: { arn: event.target.value } })}
          />
        </div>
      </div>

      {service === 'sqs' ? (
        <div className="space-y-2">
          <Label htmlFor="target-sqs-group">SQS message group ID (optional)</Label>
          <Input
            id="target-sqs-group"
            value={target.sqsParameters?.messageGroupId ?? ''}
            onChange={(event) => update({ sqsParameters: { messageGroupId: event.target.value } })}
          />
        </div>
      ) : null}

      {service === 'events' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="target-detail-type">EventBridge detail type</Label>
            <Input
              id="target-detail-type"
              value={target.eventBridgeParameters?.detailType ?? ''}
              onChange={(event) =>
                update({
                  eventBridgeParameters: {
                    ...target.eventBridgeParameters,
                    detailType: event.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-source">EventBridge source</Label>
            <Input
              id="target-source"
              value={target.eventBridgeParameters?.source ?? ''}
              onChange={(event) =>
                update({
                  eventBridgeParameters: {
                    ...target.eventBridgeParameters,
                    source: event.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      ) : null}

      {service === 'kinesis' ? (
        <div className="space-y-2">
          <Label htmlFor="target-partition-key">Kinesis partition key</Label>
          <Input
            id="target-partition-key"
            value={target.kinesisParameters?.partitionKey ?? ''}
            onChange={(event) =>
              update({ kinesisParameters: { partitionKey: event.target.value } })
            }
          />
        </div>
      ) : null}

      {issues.map((entry) => (
        <p key={`${entry.path}-${entry.message}`} role="alert" className="text-sm text-red-300">
          {entry.message}
        </p>
      ))}
    </section>
  );
}

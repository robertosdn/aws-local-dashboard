import { type ReactNode } from 'react';
import { CodeBlock } from '@/components/ui/code-block';
import { Separator } from '@/components/ui/separator';
import type { ScheduleTarget } from '../types/scheduler';

interface ScheduleTargetDisplayProps {
  target?: ScheduleTarget;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-300">{children}</div>
    </div>
  );
}

export function ScheduleTargetDisplay({ target }: ScheduleTargetDisplayProps) {
  if (!target) {
    return (
      <p className="text-sm text-slate-500">
        This schedule does not declare a target in its current configuration.
      </p>
    );
  }

  const { retryPolicy, deadLetterConfig } = target;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Target ARN">
          <p className="break-all font-mono text-xs">{target.arn}</p>
        </Field>
        {target.roleArn ? (
          <Field label="Role ARN">
            <p className="break-all font-mono text-xs">{target.roleArn}</p>
          </Field>
        ) : null}
      </div>

      {retryPolicy ? (
        <Field label="Retry policy">
          <p>
            Maximum event age: {retryPolicy.maximumEventAgeInSeconds ?? 'Not set'} seconds · Maximum
            retry attempts: {retryPolicy.maximumRetryAttempts ?? 'Not set'}
          </p>
        </Field>
      ) : null}

      {deadLetterConfig?.arn ? (
        <Field label="Dead-letter queue">
          <p className="break-all font-mono text-xs">{deadLetterConfig.arn}</p>
        </Field>
      ) : null}

      {target.sqsParameters ? (
        <Field label="SQS parameters">
          <p>Message group ID: {target.sqsParameters.messageGroupId ?? 'Not set'}</p>
        </Field>
      ) : null}

      {target.eventBridgeParameters ? (
        <Field label="EventBridge parameters">
          <p>Detail type: {target.eventBridgeParameters.detailType ?? 'Not set'}</p>
          <p>Source: {target.eventBridgeParameters.source ?? 'Not set'}</p>
        </Field>
      ) : null}

      {target.kinesisParameters ? (
        <Field label="Kinesis parameters">
          <p>Partition key: {target.kinesisParameters.partitionKey ?? 'Not set'}</p>
        </Field>
      ) : null}

      {target.ecsParameters ? (
        <>
          <Separator />
          <Field label="ECS parameters">
            <CodeBlock value={target.ecsParameters} />
          </Field>
        </>
      ) : null}

      {target.sageMakerPipelineParameters ? (
        <>
          <Separator />
          <Field label="SageMaker pipeline parameters">
            <CodeBlock value={target.sageMakerPipelineParameters} />
          </Field>
        </>
      ) : null}

      {target.input ? (
        <>
          <Separator />
          <Field label="Input">
            <CodeBlock value={target.input} />
          </Field>
        </>
      ) : null}
    </div>
  );
}

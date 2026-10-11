import type { ScheduleTargetInput, ScheduleValidationIssue } from '../types/scheduler';

const ARN_PATTERN = /^arn:[^:]+:[^:]+:[^:]*:[^:]*:.+$/;

function errorIssue(path: string, message: string): ScheduleValidationIssue {
  return { path, message, severity: 'error' };
}

/** Extracts the service segment (for example `sqs`) from a target ARN. */
export function targetService(target: ScheduleTargetInput): string | undefined {
  const [, , service] = target.arn.split(':');
  return service?.trim() ? service.trim() : undefined;
}

/**
 * Validates the editable target configuration. Destination existence is not
 * checked; only the shape and the documented service bounds are.
 */
export function validateScheduleTarget(target: ScheduleTargetInput): ScheduleValidationIssue[] {
  const issues: ScheduleValidationIssue[] = [];

  if (!target.arn.trim()) {
    issues.push(errorIssue('target.arn', 'Target ARN is required'));
  } else if (!ARN_PATTERN.test(target.arn.trim())) {
    issues.push(errorIssue('target.arn', 'Target ARN format is invalid'));
  }

  if (!target.roleArn?.trim()) {
    issues.push(errorIssue('target.roleArn', 'Target role ARN is required'));
  } else if (!ARN_PATTERN.test(target.roleArn.trim())) {
    issues.push(errorIssue('target.roleArn', 'Target role ARN format is invalid'));
  }

  if (target.input?.trim()) {
    try {
      JSON.parse(target.input);
    } catch {
      issues.push(errorIssue('target.input', 'Input payload must be valid JSON'));
    }
  }

  if (
    target.deadLetterConfig?.arn?.trim() &&
    !ARN_PATTERN.test(target.deadLetterConfig.arn.trim())
  ) {
    issues.push(
      errorIssue('target.deadLetterConfig.arn', 'Dead-letter queue ARN format is invalid'),
    );
  }

  const maxAge = target.retryPolicy?.maximumEventAgeInSeconds;
  if (maxAge !== undefined && (maxAge < 60 || maxAge > 86400)) {
    issues.push(
      errorIssue(
        'target.retryPolicy.maximumEventAgeInSeconds',
        'Maximum event age must be between 60 and 86400 seconds',
      ),
    );
  }

  const maxAttempts = target.retryPolicy?.maximumRetryAttempts;
  if (maxAttempts !== undefined && (maxAttempts < 0 || maxAttempts > 185)) {
    issues.push(
      errorIssue(
        'target.retryPolicy.maximumRetryAttempts',
        'Maximum retry attempts must be between 0 and 185',
      ),
    );
  }

  const detailType = target.eventBridgeParameters?.detailType?.trim();
  const source = target.eventBridgeParameters?.source?.trim();
  if (Boolean(detailType) !== Boolean(source)) {
    issues.push(
      errorIssue(
        'target.eventBridgeParameters',
        'EventBridge targets require both a detail type and a source',
      ),
    );
  }

  if (targetService(target) === 'kinesis' && !target.kinesisParameters?.partitionKey?.trim()) {
    issues.push(
      errorIssue(
        'target.kinesisParameters.partitionKey',
        'Kinesis targets require a partition key',
      ),
    );
  }

  return issues;
}

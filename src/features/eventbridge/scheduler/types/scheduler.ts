export const DEFAULT_SCHEDULE_GROUP_NAME = 'default';

export type ScheduleState = 'ENABLED' | 'DISABLED';

export interface ScheduleGroupSummary {
  name: string;
  arn: string;
  createdAt?: Date;
  lastModifiedAt?: Date;
}

/**
 * `GetScheduleGroup` returns the same fields as the list summary.
 */
export type ScheduleGroupDetail = ScheduleGroupSummary;

export interface ScheduleGroupPage {
  scheduleGroups: ScheduleGroupSummary[];
  nextToken?: string;
}

export interface ScheduleSummary {
  name: string;
  arn: string;
  groupName: string;
  state: ScheduleState;
  createdAt?: Date;
  lastModifiedAt?: Date;
  targetArn?: string;
}

export interface SchedulePage {
  schedules: ScheduleSummary[];
  nextToken?: string;
}

export interface ScheduleRetryPolicy {
  maximumEventAgeInSeconds?: number;
  maximumRetryAttempts?: number;
}

export interface ScheduleDeadLetterConfig {
  arn?: string;
}

export interface ScheduleTarget {
  arn: string;
  roleArn?: string;
  input?: string;
  retryPolicy?: ScheduleRetryPolicy;
  deadLetterConfig?: ScheduleDeadLetterConfig;
  sqsParameters?: { messageGroupId?: string };
  eventBridgeParameters?: { detailType?: string; source?: string };
  kinesisParameters?: { partitionKey?: string };
  ecsParameters?: Record<string, unknown>;
  sageMakerPipelineParameters?: Record<string, unknown>;
}

export interface FlexibleTimeWindow {
  mode: 'OFF' | 'FLEXIBLE';
  maximumWindowInMinutes?: number;
}

export interface ScheduleDetails extends ScheduleSummary {
  description?: string;
  scheduleExpression?: string;
  scheduleExpressionTimezone?: string;
  startDate?: Date;
  endDate?: Date;
  actionAfterCompletion?: 'NONE' | 'DELETE';
  kmsKeyArn?: string;
  flexibleTimeWindow?: FlexibleTimeWindow;
  target?: ScheduleTarget;
}

export type ActionAfterCompletion = 'NONE' | 'DELETE';

/** Editable target shape, aligned with the read-only ScheduleTarget type. */
export interface ScheduleTargetInput {
  arn: string;
  roleArn?: string;
  input?: string;
  retryPolicy?: ScheduleRetryPolicy;
  deadLetterConfig?: ScheduleDeadLetterConfig;
  sqsParameters?: { messageGroupId?: string };
  eventBridgeParameters?: { detailType?: string; source?: string };
  kinesisParameters?: { partitionKey?: string };
}

export interface ScheduleFormValues {
  name: string;
  description?: string;
  scheduleExpression: string;
  scheduleExpressionTimezone: string;
  state: ScheduleState;
  actionAfterCompletion: ActionAfterCompletion;
  startDate?: string;
  endDate?: string;
  flexibleTimeWindow: FlexibleTimeWindow;
  target: ScheduleTargetInput;
}

export interface SaveScheduleInput {
  groupName: string;
  /** Present when editing an existing schedule; the name is immutable. */
  originalName?: string;
  values: ScheduleFormValues;
}

export interface DeleteScheduleInput {
  groupName: string;
  scheduleName: string;
}

export interface SetScheduleStateInput {
  groupName: string;
  scheduleName: string;
  state: ScheduleState;
}

export interface SavedSchedule {
  name: string;
  arn?: string;
}

export type ScheduleValidationSeverity = 'error' | 'warning';

export interface ScheduleValidationIssue {
  path: string;
  message: string;
  severity: ScheduleValidationSeverity;
}

export type ScheduleExpressionKind = 'at' | 'rate' | 'cron';

export interface ScheduleExpressionValidationResult {
  valid: boolean;
  kind?: ScheduleExpressionKind;
  description?: string;
  issues: ScheduleValidationIssue[];
}

export const SCHEDULE_EXPRESSION_MAX_LENGTH = 256;

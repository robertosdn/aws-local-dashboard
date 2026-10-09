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

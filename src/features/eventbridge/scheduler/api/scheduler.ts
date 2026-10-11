import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  GetScheduleCommand,
  GetScheduleGroupCommand,
  ListScheduleGroupsCommand,
  ListSchedulesCommand,
  UpdateScheduleCommand,
} from '@aws-sdk/client-scheduler';
import type { GetScheduleCommandOutput } from '@aws-sdk/client-scheduler';
import { createSchedulerClient, type AwsClientConfig } from '@/services/aws';
import {
  DEFAULT_SCHEDULE_GROUP_NAME,
  type DeleteScheduleInput,
  type SaveScheduleInput,
  type SavedSchedule,
  type ScheduleDetails,
  type ScheduleFormValues,
  type ScheduleGroupDetail,
  type ScheduleGroupPage,
  type ScheduleGroupSummary,
  type SchedulePage,
  type ScheduleState,
  type ScheduleSummary,
  type ScheduleTarget,
  type ScheduleTargetInput,
  type SetScheduleStateInput,
} from '../types/scheduler';

const PAGE_SIZE = 100;

function mapState(state?: string): ScheduleState {
  return state === 'ENABLED' ? 'ENABLED' : 'DISABLED';
}

function mapScheduleGroup(group: {
  Arn?: string;
  Name?: string;
  CreationDate?: Date;
  LastModificationDate?: Date;
}): ScheduleGroupSummary | null {
  if (!group.Name || !group.Arn) return null;

  return {
    name: group.Name,
    arn: group.Arn,
    createdAt: group.CreationDate,
    lastModifiedAt: group.LastModificationDate,
  };
}

function mapScheduleSummary(schedule: {
  Arn?: string;
  Name?: string;
  GroupName?: string;
  State?: string;
  CreationDate?: Date;
  LastModificationDate?: Date;
  Target?: { Arn?: string };
}): ScheduleSummary | null {
  if (!schedule.Name || !schedule.Arn) return null;

  return {
    name: schedule.Name,
    arn: schedule.Arn,
    groupName: schedule.GroupName ?? DEFAULT_SCHEDULE_GROUP_NAME,
    state: mapState(schedule.State),
    createdAt: schedule.CreationDate,
    lastModifiedAt: schedule.LastModificationDate,
    targetArn: schedule.Target?.Arn,
  };
}

function mapTarget(target: GetScheduleCommandOutput['Target']): ScheduleTarget | undefined {
  if (!target?.Arn) return undefined;

  return {
    arn: target.Arn,
    roleArn: target.RoleArn,
    input: target.Input,
    retryPolicy: target.RetryPolicy
      ? {
          maximumEventAgeInSeconds: target.RetryPolicy.MaximumEventAgeInSeconds,
          maximumRetryAttempts: target.RetryPolicy.MaximumRetryAttempts,
        }
      : undefined,
    deadLetterConfig: target.DeadLetterConfig ? { arn: target.DeadLetterConfig.Arn } : undefined,
    sqsParameters: target.SqsParameters
      ? { messageGroupId: target.SqsParameters.MessageGroupId }
      : undefined,
    eventBridgeParameters: target.EventBridgeParameters
      ? {
          detailType: target.EventBridgeParameters.DetailType,
          source: target.EventBridgeParameters.Source,
        }
      : undefined,
    kinesisParameters: target.KinesisParameters
      ? { partitionKey: target.KinesisParameters.PartitionKey }
      : undefined,
    ecsParameters: target.EcsParameters as unknown as Record<string, unknown> | undefined,
    sageMakerPipelineParameters: target.SageMakerPipelineParameters as unknown as
      Record<string, unknown> | undefined,
  };
}

export async function listScheduleGroups(
  nextToken?: string,
  config?: AwsClientConfig,
): Promise<ScheduleGroupPage> {
  const client = createSchedulerClient(config);

  try {
    const response = await client.send(
      new ListScheduleGroupsCommand({
        NextToken: nextToken,
        MaxResults: PAGE_SIZE,
      }),
    );

    const scheduleGroups = (response.ScheduleGroups ?? []).flatMap((group) => {
      const mapped = mapScheduleGroup(group);
      return mapped ? [mapped] : [];
    });

    return { scheduleGroups, nextToken: response.NextToken };
  } finally {
    client.destroy();
  }
}

export async function getScheduleGroupDetails(
  name: string,
  config?: AwsClientConfig,
): Promise<ScheduleGroupDetail> {
  const client = createSchedulerClient(config);

  try {
    const response = await client.send(new GetScheduleGroupCommand({ Name: name }));

    return {
      name: response.Name ?? name,
      arn: response.Arn ?? '',
      createdAt: response.CreationDate,
      lastModifiedAt: response.LastModificationDate,
    };
  } finally {
    client.destroy();
  }
}

export async function listSchedules(
  groupName: string,
  state?: ScheduleState,
  nextToken?: string,
  config?: AwsClientConfig,
): Promise<SchedulePage> {
  const client = createSchedulerClient(config);

  try {
    const response = await client.send(
      new ListSchedulesCommand({
        GroupName: groupName,
        State: state,
        NextToken: nextToken,
        MaxResults: PAGE_SIZE,
      }),
    );

    const schedules = (response.Schedules ?? []).flatMap((schedule) => {
      const mapped = mapScheduleSummary(schedule);
      return mapped ? [mapped] : [];
    });

    return { schedules, nextToken: response.NextToken };
  } finally {
    client.destroy();
  }
}

export async function getScheduleDetails(
  groupName: string,
  scheduleName: string,
  config?: AwsClientConfig,
): Promise<ScheduleDetails> {
  const client = createSchedulerClient(config);

  try {
    const response = await client.send(
      new GetScheduleCommand({ Name: scheduleName, GroupName: groupName }),
    );

    return {
      name: response.Name ?? scheduleName,
      arn: response.Arn ?? '',
      groupName: response.GroupName ?? groupName,
      state: mapState(response.State),
      createdAt: response.CreationDate,
      lastModifiedAt: response.LastModificationDate,
      description: response.Description,
      scheduleExpression: response.ScheduleExpression,
      scheduleExpressionTimezone: response.ScheduleExpressionTimezone,
      startDate: response.StartDate,
      endDate: response.EndDate,
      actionAfterCompletion: response.ActionAfterCompletion,
      kmsKeyArn: response.KmsKeyArn,
      flexibleTimeWindow: response.FlexibleTimeWindow
        ? {
            mode: response.FlexibleTimeWindow.Mode === 'FLEXIBLE' ? 'FLEXIBLE' : 'OFF',
            maximumWindowInMinutes: response.FlexibleTimeWindow.MaximumWindowInMinutes,
          }
        : undefined,
      target: mapTarget(response.Target),
    };
  } finally {
    client.destroy();
  }
}

function toSdkTarget(target: ScheduleTargetInput) {
  const retryPolicy =
    target.retryPolicy &&
    (target.retryPolicy.maximumEventAgeInSeconds !== undefined ||
      target.retryPolicy.maximumRetryAttempts !== undefined)
      ? {
          MaximumEventAgeInSeconds: target.retryPolicy.maximumEventAgeInSeconds,
          MaximumRetryAttempts: target.retryPolicy.maximumRetryAttempts,
        }
      : undefined;

  const eventBridgeParameters =
    target.eventBridgeParameters?.detailType?.trim() && target.eventBridgeParameters.source?.trim()
      ? {
          DetailType: target.eventBridgeParameters.detailType,
          Source: target.eventBridgeParameters.source,
        }
      : undefined;

  return {
    Arn: target.arn,
    RoleArn: target.roleArn?.trim() ? target.roleArn : undefined,
    Input: target.input?.trim() ? target.input : undefined,
    RetryPolicy: retryPolicy,
    DeadLetterConfig: target.deadLetterConfig?.arn?.trim()
      ? { Arn: target.deadLetterConfig.arn }
      : undefined,
    SqsParameters: target.sqsParameters?.messageGroupId?.trim()
      ? { MessageGroupId: target.sqsParameters.messageGroupId }
      : undefined,
    EventBridgeParameters: eventBridgeParameters,
    KinesisParameters: target.kinesisParameters?.partitionKey?.trim()
      ? { PartitionKey: target.kinesisParameters.partitionKey }
      : undefined,
  };
}

function parseOptionalDate(value?: string): Date | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  // Scheduler dates are UTC; treat a value without a designator as UTC rather
  // than the browser's local zone.
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(trimmed) ? trimmed : `${trimmed}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toSdkScheduleInput(groupName: string, values: ScheduleFormValues) {
  return {
    Name: values.name,
    GroupName: groupName,
    Description: values.description?.trim() ? values.description : undefined,
    ScheduleExpression: values.scheduleExpression,
    ScheduleExpressionTimezone: values.scheduleExpressionTimezone,
    State: values.state,
    ActionAfterCompletion: values.actionAfterCompletion,
    StartDate: parseOptionalDate(values.startDate),
    EndDate: parseOptionalDate(values.endDate),
    FlexibleTimeWindow:
      values.flexibleTimeWindow.mode === 'FLEXIBLE'
        ? {
            Mode: 'FLEXIBLE' as const,
            MaximumWindowInMinutes: values.flexibleTimeWindow.maximumWindowInMinutes,
          }
        : { Mode: 'OFF' as const },
    Target: toSdkTarget(values.target),
  };
}

export async function createSchedule(
  groupName: string,
  values: ScheduleFormValues,
  config?: AwsClientConfig,
): Promise<SavedSchedule> {
  const client = createSchedulerClient(config);
  try {
    const response = await client.send(
      new CreateScheduleCommand(toSdkScheduleInput(groupName, values)),
    );
    return { name: values.name, arn: response.ScheduleArn };
  } finally {
    client.destroy();
  }
}

export async function updateSchedule(
  groupName: string,
  values: ScheduleFormValues,
  config?: AwsClientConfig,
): Promise<SavedSchedule> {
  const client = createSchedulerClient(config);
  try {
    const response = await client.send(
      new UpdateScheduleCommand(toSdkScheduleInput(groupName, values)),
    );
    return { name: values.name, arn: response.ScheduleArn };
  } finally {
    client.destroy();
  }
}

export async function saveSchedule(
  input: SaveScheduleInput,
  config?: AwsClientConfig,
): Promise<SavedSchedule> {
  return input.originalName
    ? updateSchedule(input.groupName, input.values, config)
    : createSchedule(input.groupName, input.values, config);
}

export async function deleteSchedule(
  input: DeleteScheduleInput,
  config?: AwsClientConfig,
): Promise<void> {
  const client = createSchedulerClient(config);
  try {
    await client.send(
      new DeleteScheduleCommand({ Name: input.scheduleName, GroupName: input.groupName }),
    );
  } finally {
    client.destroy();
  }
}

/**
 * `UpdateSchedule` replaces the whole schedule, so the current configuration is
 * read first and written back with only `State` changed.
 */
export async function setScheduleState(
  input: SetScheduleStateInput,
  config?: AwsClientConfig,
): Promise<void> {
  const client = createSchedulerClient(config);
  try {
    const current = await client.send(
      new GetScheduleCommand({ Name: input.scheduleName, GroupName: input.groupName }),
    );

    await client.send(
      new UpdateScheduleCommand({
        Name: input.scheduleName,
        GroupName: input.groupName,
        Description: current.Description,
        ScheduleExpression: current.ScheduleExpression,
        ScheduleExpressionTimezone: current.ScheduleExpressionTimezone,
        State: input.state,
        ActionAfterCompletion: current.ActionAfterCompletion,
        StartDate: current.StartDate,
        EndDate: current.EndDate,
        FlexibleTimeWindow: current.FlexibleTimeWindow,
        Target: current.Target,
      }),
    );
  } finally {
    client.destroy();
  }
}

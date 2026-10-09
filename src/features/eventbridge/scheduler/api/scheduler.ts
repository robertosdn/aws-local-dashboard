import {
  GetScheduleCommand,
  GetScheduleGroupCommand,
  ListScheduleGroupsCommand,
  ListSchedulesCommand,
} from '@aws-sdk/client-scheduler';
import type { GetScheduleCommandOutput } from '@aws-sdk/client-scheduler';
import { createSchedulerClient, type AwsClientConfig } from '@/services/aws';
import {
  DEFAULT_SCHEDULE_GROUP_NAME,
  type ScheduleDetails,
  type ScheduleGroupDetail,
  type ScheduleGroupPage,
  type ScheduleGroupSummary,
  type SchedulePage,
  type ScheduleState,
  type ScheduleSummary,
  type ScheduleTarget,
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
    deadLetterConfig: target.DeadLetterConfig
      ? { arn: target.DeadLetterConfig.Arn }
      : undefined,
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
      | Record<string, unknown>
      | undefined,
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

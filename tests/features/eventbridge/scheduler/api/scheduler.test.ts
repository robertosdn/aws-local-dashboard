import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  GetScheduleCommand,
  GetScheduleGroupCommand,
  ListScheduleGroupsCommand,
  ListSchedulesCommand,
  UpdateScheduleCommand,
} from '@aws-sdk/client-scheduler';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('@/services/aws', () => ({
  createSchedulerClient: vi.fn(() => ({ send: mocks.send, destroy: mocks.destroy })),
}));

import {
  createSchedule,
  deleteSchedule,
  getScheduleDetails,
  getScheduleGroupDetails,
  listScheduleGroups,
  listSchedules,
  saveSchedule,
  setScheduleState,
  updateSchedule,
} from '@/features/eventbridge/scheduler/api/scheduler';
import type { ScheduleFormValues } from '@/features/eventbridge/scheduler/types/scheduler';

const config = { endpoint: 'http://localhost:4566', region: 'us-east-1' };

const formValues: ScheduleFormValues = {
  name: 'hourly',
  description: 'Runs hourly',
  scheduleExpression: 'rate(1 hour)',
  scheduleExpressionTimezone: 'UTC',
  state: 'ENABLED',
  actionAfterCompletion: 'NONE',
  flexibleTimeWindow: { mode: 'OFF' },
  target: {
    arn: 'arn:aws:sqs:us-east-1:000000000000:orders',
    roleArn: 'arn:aws:iam::000000000000:role/scheduler-role',
    input: '{"key":"value"}',
    retryPolicy: { maximumEventAgeInSeconds: 60, maximumRetryAttempts: 3 },
    deadLetterConfig: { arn: 'arn:aws:sqs:us-east-1:000000000000:dlq' },
    sqsParameters: { messageGroupId: 'group-1' },
  },
};

describe('Scheduler API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists schedule groups with a bounded page size and maps summaries', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof ListScheduleGroupsCommand) {
        expect(command.input).toMatchObject({ MaxResults: 100 });
        return {
          ScheduleGroups: [
            {
              Name: 'default',
              Arn: 'arn:default',
              CreationDate: new Date('2024-01-01T00:00:00Z'),
            },
            { Arn: 'arn:missing-name' },
          ],
          NextToken: 'page-2',
        };
      }
      throw new Error('Unexpected command');
    });

    const page = await listScheduleGroups(undefined, config);

    expect(page.nextToken).toBe('page-2');
    expect(page.scheduleGroups).toEqual([
      {
        name: 'default',
        arn: 'arn:default',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        lastModifiedAt: undefined,
      },
    ]);
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('forwards the continuation token when listing schedule groups', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof ListScheduleGroupsCommand) {
        expect(command.input.NextToken).toBe('page-2');
        return { ScheduleGroups: [] };
      }
      throw new Error('Unexpected command');
    });

    await listScheduleGroups('page-2', config);

    expect(mocks.send).toHaveBeenCalledOnce();
  });

  it('loads schedule group details', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof GetScheduleGroupCommand) {
        expect(command.input).toEqual({ Name: 'orders' });
        return {
          Name: 'orders',
          Arn: 'arn:orders',
          CreationDate: new Date('2024-02-01T00:00:00Z'),
          LastModificationDate: new Date('2024-02-02T00:00:00Z'),
        };
      }
      throw new Error('Unexpected command');
    });

    const details = await getScheduleGroupDetails('orders', config);

    expect(details).toEqual({
      name: 'orders',
      arn: 'arn:orders',
      createdAt: new Date('2024-02-01T00:00:00Z'),
      lastModifiedAt: new Date('2024-02-02T00:00:00Z'),
    });
  });

  it('lists schedules filtered by group and state', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof ListSchedulesCommand) {
        expect(command.input).toMatchObject({
          GroupName: 'orders',
          State: 'ENABLED',
          MaxResults: 100,
        });
        return {
          Schedules: [
            {
              Name: 'hourly',
              Arn: 'arn:hourly',
              GroupName: 'orders',
              State: 'ENABLED',
              Target: { Arn: 'arn:target' },
            },
          ],
        };
      }
      throw new Error('Unexpected command');
    });

    const page = await listSchedules('orders', 'ENABLED', undefined, config);

    expect(page.schedules).toEqual([
      {
        name: 'hourly',
        arn: 'arn:hourly',
        groupName: 'orders',
        state: 'ENABLED',
        createdAt: undefined,
        lastModifiedAt: undefined,
        targetArn: 'arn:target',
      },
    ]);
  });

  it('omits the state filter when none is provided', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof ListSchedulesCommand) {
        expect(command.input.State).toBeUndefined();
        return { Schedules: [] };
      }
      throw new Error('Unexpected command');
    });

    await listSchedules('orders', undefined, undefined, config);

    expect(mocks.send).toHaveBeenCalledOnce();
  });

  it('loads schedule details including the target configuration', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof GetScheduleCommand) {
        expect(command.input).toEqual({ Name: 'hourly', GroupName: 'orders' });
        return {
          Name: 'hourly',
          Arn: 'arn:hourly',
          GroupName: 'orders',
          State: 'DISABLED',
          Description: 'Runs hourly',
          ScheduleExpression: 'rate(1 hour)',
          ScheduleExpressionTimezone: 'UTC',
          ActionAfterCompletion: 'NONE',
          FlexibleTimeWindow: { Mode: 'OFF' },
          Target: {
            Arn: 'arn:target',
            RoleArn: 'arn:role',
            Input: '{"key":"value"}',
            RetryPolicy: { MaximumEventAgeInSeconds: 60, MaximumRetryAttempts: 3 },
            DeadLetterConfig: { Arn: 'arn:dlq' },
            SqsParameters: { MessageGroupId: 'group-1' },
          },
        };
      }
      throw new Error('Unexpected command');
    });

    const details = await getScheduleDetails('orders', 'hourly', config);

    expect(details).toMatchObject({
      name: 'hourly',
      arn: 'arn:hourly',
      groupName: 'orders',
      state: 'DISABLED',
      description: 'Runs hourly',
      scheduleExpression: 'rate(1 hour)',
      scheduleExpressionTimezone: 'UTC',
      actionAfterCompletion: 'NONE',
      flexibleTimeWindow: { mode: 'OFF' },
      target: {
        arn: 'arn:target',
        roleArn: 'arn:role',
        input: '{"key":"value"}',
        retryPolicy: { maximumEventAgeInSeconds: 60, maximumRetryAttempts: 3 },
        deadLetterConfig: { arn: 'arn:dlq' },
        sqsParameters: { messageGroupId: 'group-1' },
      },
    });
  });

  it('surfaces service errors instead of returning empty results', async () => {
    mocks.send.mockRejectedValue(new Error('ResourceNotFoundException'));

    await expect(getScheduleDetails('orders', 'missing', config)).rejects.toThrow(
      'ResourceNotFoundException',
    );
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('creates a schedule with the full configuration mapped to the SDK shape', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof CreateScheduleCommand) {
        return { ScheduleArn: 'arn:hourly' };
      }
      throw new Error('Unexpected command');
    });

    const saved = await createSchedule('orders', formValues, config);

    const command = mocks.send.mock.calls[0][0] as CreateScheduleCommand;
    expect(command).toBeInstanceOf(CreateScheduleCommand);
    expect(command.input).toMatchObject({
      Name: 'hourly',
      GroupName: 'orders',
      Description: 'Runs hourly',
      ScheduleExpression: 'rate(1 hour)',
      ScheduleExpressionTimezone: 'UTC',
      State: 'ENABLED',
      FlexibleTimeWindow: { Mode: 'OFF' },
      Target: {
        Arn: 'arn:aws:sqs:us-east-1:000000000000:orders',
        RoleArn: 'arn:aws:iam::000000000000:role/scheduler-role',
        Input: '{"key":"value"}',
        RetryPolicy: { MaximumEventAgeInSeconds: 60, MaximumRetryAttempts: 3 },
        DeadLetterConfig: { Arn: 'arn:aws:sqs:us-east-1:000000000000:dlq' },
        SqsParameters: { MessageGroupId: 'group-1' },
      },
    });
    expect(saved).toEqual({ name: 'hourly', arn: 'arn:hourly' });
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('omits blank optional fields and parses UTC dates', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof CreateScheduleCommand) return {};
      throw new Error('Unexpected command');
    });

    await createSchedule(
      'orders',
      {
        ...formValues,
        description: '   ',
        startDate: '2025-01-01T12:00:00',
        endDate: '2025-12-31T12:00:00',
        target: { arn: 'arn:aws:sqs:us-east-1:000000000000:orders' },
      },
      config,
    );

    const input = (mocks.send.mock.calls[0][0] as CreateScheduleCommand).input;
    expect(input.Description).toBeUndefined();
    expect(input.StartDate).toEqual(new Date('2025-01-01T12:00:00Z'));
    expect(input.EndDate).toEqual(new Date('2025-12-31T12:00:00Z'));
    expect(input.Target).toMatchObject({
      Arn: 'arn:aws:sqs:us-east-1:000000000000:orders',
      RetryPolicy: undefined,
      SqsParameters: undefined,
    });
  });

  it('sent a flexible window when requested', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof CreateScheduleCommand) return {};
      throw new Error('Unexpected command');
    });

    await createSchedule(
      'orders',
      { ...formValues, flexibleTimeWindow: { mode: 'FLEXIBLE', maximumWindowInMinutes: 15 } },
      config,
    );

    expect((mocks.send.mock.calls[0][0] as CreateScheduleCommand).input.FlexibleTimeWindow).toEqual(
      {
        Mode: 'FLEXIBLE',
        MaximumWindowInMinutes: 15,
      },
    );
  });

  it('updates an existing schedule with UpdateSchedule', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof UpdateScheduleCommand) {
        return { ScheduleArn: 'arn:hourly' };
      }
      throw new Error('Unexpected command');
    });

    await updateSchedule('orders', formValues, config);

    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(UpdateScheduleCommand);
    expect((mocks.send.mock.calls[0][0] as UpdateScheduleCommand).input.Name).toBe('hourly');
  });

  it('chooses create or update in saveSchedule', async () => {
    mocks.send.mockImplementation(async () => ({}));

    await saveSchedule({ groupName: 'orders', values: formValues }, config);
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(CreateScheduleCommand);

    mocks.send.mockClear();
    await saveSchedule({ groupName: 'orders', originalName: 'hourly', values: formValues }, config);
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(UpdateScheduleCommand);
  });

  it('deletes a schedule', async () => {
    mocks.send.mockImplementation(async () => ({}));

    await deleteSchedule({ groupName: 'orders', scheduleName: 'hourly' }, config);

    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(DeleteScheduleCommand);
    expect((mocks.send.mock.calls[0][0] as DeleteScheduleCommand).input).toEqual({
      Name: 'hourly',
      GroupName: 'orders',
    });
  });

  it('preserves the schedule configuration when changing state', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof GetScheduleCommand) {
        return {
          Name: 'hourly',
          GroupName: 'orders',
          Description: 'Runs hourly',
          ScheduleExpression: 'rate(1 hour)',
          ScheduleExpressionTimezone: 'UTC',
          State: 'ENABLED',
          ActionAfterCompletion: 'NONE',
          FlexibleTimeWindow: { Mode: 'OFF' },
          Target: { Arn: 'arn:aws:sqs:us-east-1:000000000000:orders' },
        };
      }
      if (command instanceof UpdateScheduleCommand) return {};
      throw new Error('Unexpected command');
    });

    await setScheduleState(
      { groupName: 'orders', scheduleName: 'hourly', state: 'DISABLED' },
      config,
    );

    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(GetScheduleCommand);
    const update = mocks.send.mock.calls[1][0] as UpdateScheduleCommand;
    expect(update).toBeInstanceOf(UpdateScheduleCommand);
    expect(update.input).toMatchObject({
      Name: 'hourly',
      GroupName: 'orders',
      State: 'DISABLED',
      ScheduleExpression: 'rate(1 hour)',
      ScheduleExpressionTimezone: 'UTC',
      Description: 'Runs hourly',
      FlexibleTimeWindow: { Mode: 'OFF' },
      Target: { Arn: 'arn:aws:sqs:us-east-1:000000000000:orders' },
    });
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
});

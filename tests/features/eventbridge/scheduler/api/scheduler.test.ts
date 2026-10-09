import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GetScheduleCommand,
  GetScheduleGroupCommand,
  ListScheduleGroupsCommand,
  ListSchedulesCommand,
} from '@aws-sdk/client-scheduler';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('@/services/aws', () => ({
  createSchedulerClient: vi.fn(() => ({ send: mocks.send, destroy: mocks.destroy })),
}));

import {
  getScheduleDetails,
  getScheduleGroupDetails,
  listScheduleGroups,
  listSchedules,
} from '@/features/eventbridge/scheduler/api/scheduler';

const config = { endpoint: 'http://localhost:4566', region: 'us-east-1' };

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
});

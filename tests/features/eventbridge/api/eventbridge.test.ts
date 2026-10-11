import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DeleteEventBusCommand,
  DeleteRuleCommand,
  DescribeEventBusCommand,
  DisableRuleCommand,
  EnableRuleCommand,
  ListEventBusesCommand,
  ListRulesCommand,
  ListTargetsByRuleCommand,
  PutRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
} from '@aws-sdk/client-eventbridge';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('@/services/aws', () => ({
  createEventBridgeClient: vi.fn(() => ({ send: mocks.send, destroy: mocks.destroy })),
}));

import {
  deleteEventBus,
  getEventBusDetails,
  listEventBuses,
  listRules,
  listTargetsByRule,
  saveRule,
  deleteRule as deleteEventBridgeRule,
  setRuleState,
} from '@/features/eventbridge/api/eventbridge';

describe('EventBridge API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof ListEventBusesCommand) {
        return {
          EventBuses: [
            {
              Name: 'default',
              Arn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
              CreationTime: new Date('2024-01-01T00:00:00Z'),
            },
            {
              Name: 'orders',
              Arn: 'arn:aws:events:us-east-1:000000000000:event-bus/orders',
              Description: 'Orders bus',
              Policy: '{"Version":"2012-10-17"}',
              CreationTime: new Date('2024-02-01T00:00:00Z'),
            },
            {},
          ],
          NextToken: 'next-page',
        };
      }
      if (command instanceof DescribeEventBusCommand) {
        return {
          Name: 'orders',
          Arn: 'arn:aws:events:us-east-1:000000000000:event-bus/orders',
          Policy: '{"Version":"2012-10-17"}',
        };
      }
      if (command instanceof ListRulesCommand) {
        return {
          Rules: [
            {
              Name: 'orders-rule',
              Arn: 'arn:aws:events:us-east-1:000000000000:rule/orders/orders-rule',
              EventBusName: 'orders',
              State: 'ENABLED',
              EventPattern: '{"source":["app.orders"]}',
            },
            {
              Name: 'customers-rule',
              Arn: 'arn:aws:events:us-east-1:000000000000:rule/orders/customers-rule',
              EventBusName: 'orders',
              State: 'DISABLED',
              EventPattern: '{"source":["app.customers"]}',
            },
            {},
          ],
          NextToken: 'rules-next',
        };
      }
      if (command instanceof ListTargetsByRuleCommand) {
        return {
          Targets: [
            {
              Id:
                (command as ListTargetsByRuleCommand).input.Rule === 'orders-rule'
                  ? 'target-1'
                  : `target-${(command as ListTargetsByRuleCommand).input.Rule}`,
              Arn: 'arn:aws:sqs:us-east-1:000000000000:orders-queue',
              RoleArn: 'arn:aws:iam::000000000000:role/orders-role',
            },
            { Id: 'missing-arn' },
          ],
        };
      }
      return {};
    });
  });

  it('lists one bounded page of event buses and always destroys the client', async () => {
    const result = await listEventBuses(undefined, {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });

    const command = mocks.send.mock.calls[0][0] as ListEventBusesCommand;
    expect(command).toBeInstanceOf(ListEventBusesCommand);
    expect(command.input).toMatchObject({ Limit: 100 });
    expect(result).toEqual({
      eventBuses: [
        {
          name: 'default',
          arn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
          description: undefined,
          policy: undefined,
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
        {
          name: 'orders',
          arn: 'arn:aws:events:us-east-1:000000000000:event-bus/orders',
          description: 'Orders bus',
          policy: '{"Version":"2012-10-17"}',
          createdAt: new Date('2024-02-01T00:00:00Z'),
        },
      ],
      nextToken: 'next-page',
    });
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('forwards the pagination cursor to ListEventBuses', async () => {
    await listEventBuses('page-2');

    const command = mocks.send.mock.calls[0][0] as ListEventBusesCommand;
    expect(command.input).toMatchObject({ NextToken: 'page-2', Limit: 100 });
  });

  it('merges describe output with list metadata for the event bus detail', async () => {
    const result = await getEventBusDetails('orders');

    expect(result).toEqual({
      name: 'orders',
      arn: 'arn:aws:events:us-east-1:000000000000:event-bus/orders',
      policy: '{"Version":"2012-10-17"}',
      description: 'Orders bus',
      createdAt: new Date('2024-02-01T00:00:00Z'),
      rules: [],
    });
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(DescribeEventBusCommand);
    expect(mocks.send.mock.calls[1][0]).toBeInstanceOf(ListEventBusesCommand);
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('returns describe details when list enrichment fails', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof DescribeEventBusCommand) {
        return { Name: 'orders', Arn: 'arn:orders', Policy: undefined };
      }
      throw new Error('ListEventBuses unavailable');
    });

    await expect(getEventBusDetails('orders')).resolves.toEqual({
      name: 'orders',
      arn: 'arn:orders',
      policy: undefined,
      description: undefined,
      createdAt: undefined,
      rules: [],
    });
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('maps rule state and event details while paginating rules', async () => {
    const result = await listRules('orders', 'previous-token');

    const command = mocks.send.mock.calls[0][0] as ListRulesCommand;
    expect(command).toBeInstanceOf(ListRulesCommand);
    expect(command.input).toMatchObject({
      EventBusName: 'orders',
      NextToken: 'previous-token',
      Limit: 100,
    });
    expect(result).toEqual({
      rules: [
        {
          name: 'orders-rule',
          arn: 'arn:aws:events:us-east-1:000000000000:rule/orders/orders-rule',
          eventBusName: 'orders',
          state: 'ENABLED',
          description: undefined,
          eventPattern: '{"source":["app.orders"]}',
          roleArn: undefined,
          managedBy: undefined,
          targets: [
            {
              id: 'target-1',
              arn: 'arn:aws:sqs:us-east-1:000000000000:orders-queue',
              roleArn: 'arn:aws:iam::000000000000:role/orders-role',
              input: undefined,
              inputPath: undefined,
            },
          ],
          targetsLoaded: true,
        },
        {
          name: 'customers-rule',
          arn: 'arn:aws:events:us-east-1:000000000000:rule/orders/customers-rule',
          eventBusName: 'orders',
          state: 'DISABLED',
          description: undefined,
          eventPattern: '{"source":["app.customers"]}',
          roleArn: undefined,
          managedBy: undefined,
          targets: [
            {
              id: 'target-customers-rule',
              arn: 'arn:aws:sqs:us-east-1:000000000000:orders-queue',
              roleArn: 'arn:aws:iam::000000000000:role/orders-role',
              input: undefined,
              inputPath: undefined,
            },
          ],
          targetsLoaded: true,
        },
      ],
      nextToken: 'rules-next',
    });
    expect(mocks.destroy).toHaveBeenCalledTimes(2);
  });

  it('maps enabled-with-all-cloudtrail-events state to ENABLED', async () => {
    mocks.send.mockImplementation(async () => ({
      Rules: [
        {
          Name: 'trail-rule',
          Arn: 'arn:trail-rule',
          State: 'ENABLED_WITH_ALL_CLOUDTRAIL_MANAGEMENT_EVENTS',
        },
      ],
    }));

    const result = await listRules('default');
    expect(result.rules[0].state).toBe('ENABLED');
    expect(mocks.destroy).toHaveBeenCalledTimes(2);
  });

  it('lists targets for a rule and drops targets without an id or arn', async () => {
    const result = await listTargetsByRule('orders-rule', 'orders');

    const command = mocks.send.mock.calls[0][0] as ListTargetsByRuleCommand;
    expect(command).toBeInstanceOf(ListTargetsByRuleCommand);
    expect(command.input).toMatchObject({
      Rule: 'orders-rule',
      EventBusName: 'orders',
      Limit: 100,
    });
    expect(result).toEqual([
      {
        id: 'target-1',
        arn: 'arn:aws:sqs:us-east-1:000000000000:orders-queue',
        roleArn: 'arn:aws:iam::000000000000:role/orders-role',
        input: undefined,
        inputPath: undefined,
      },
    ]);
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('rejects deleting the default event bus without sending a request', async () => {
    await expect(deleteEventBus('default')).rejects.toThrow(
      'The default event bus cannot be deleted.',
    );
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.destroy).not.toHaveBeenCalled();
  });

  it('deletes a custom event bus and destroys the client', async () => {
    await deleteEventBus('orders');

    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(DeleteEventBusCommand);
    expect((mocks.send.mock.calls[0][0] as DeleteEventBusCommand).input).toEqual({
      Name: 'orders',
    });
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('saves a rule and reconciles removed and existing targets', async () => {
    await saveRule({
      eventBusName: 'orders',
      originalTargetIds: ['keep', 'remove'],
      values: {
        name: 'orders-rule',
        eventPattern: '{"source":["app.orders"]}',
        state: 'ENABLED',
        targets: [{ id: 'keep', arn: 'arn:aws:sqs:us-east-1:000000000000:orders' }],
      },
    });
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(PutRuleCommand);
    expect((mocks.send.mock.calls[0][0] as PutRuleCommand).input).toMatchObject({
      Name: 'orders-rule',
      EventBusName: 'orders',
      State: 'ENABLED',
    });
    expect(mocks.send.mock.calls[1][0]).toBeInstanceOf(PutTargetsCommand);
    expect(mocks.send.mock.calls[2][0]).toBeInstanceOf(RemoveTargetsCommand);
    expect((mocks.send.mock.calls[2][0] as RemoveTargetsCommand).input.Ids).toEqual(['remove']);
    expect(mocks.destroy).toHaveBeenCalledTimes(3);
  });

  it('removes targets before deleting a rule', async () => {
    await deleteEventBridgeRule({ eventBusName: 'orders', ruleName: 'orders-rule' });
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(ListTargetsByRuleCommand);
    expect(mocks.send.mock.calls[1][0]).toBeInstanceOf(RemoveTargetsCommand);
    expect(mocks.send.mock.calls[2][0]).toBeInstanceOf(DeleteRuleCommand);
  });

  it('uses explicit enable and disable commands', async () => {
    await setRuleState({ eventBusName: 'orders', ruleName: 'orders-rule', state: 'ENABLED' });
    await setRuleState({ eventBusName: 'orders', ruleName: 'orders-rule', state: 'DISABLED' });
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(EnableRuleCommand);
    expect(mocks.send.mock.calls[1][0]).toBeInstanceOf(DisableRuleCommand);
  });

  it('surfaces request failures and destroys the client', async () => {
    mocks.send.mockRejectedValueOnce(new Error('EventBridge unavailable'));

    await expect(listEventBuses()).rejects.toThrow('EventBridge unavailable');
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
});

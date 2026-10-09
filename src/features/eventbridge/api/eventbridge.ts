import {
  DeleteEventBusCommand,
  DescribeEventBusCommand,
  ListEventBusesCommand,
  ListRulesCommand,
  ListTargetsByRuleCommand,
} from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient, type AwsClientConfig } from '@/services/aws';
import type {
  EventBridgeRule,
  EventBusDetail,
  EventBusPage,
  EventBusSummary,
  RulePage,
  RuleTarget,
} from '../types/eventbridge';
import { DEFAULT_EVENT_BUS_NAME } from '../types/eventbridge';

function mapRuleState(state?: string): 'ENABLED' | 'DISABLED' {
  return state?.startsWith('ENABLED') ? 'ENABLED' : 'DISABLED';
}

function mapTarget(target: {
  Id?: string;
  Arn?: string;
  RoleArn?: string;
  Input?: string;
  InputPath?: string;
}): RuleTarget | null {
  if (!target.Id || !target.Arn) return null;

  return {
    id: target.Id,
    arn: target.Arn,
    roleArn: target.RoleArn,
    input: target.Input,
    inputPath: target.InputPath,
  };
}

function mapRule(rule: {
  Name?: string;
  Arn?: string;
  EventBusName?: string;
  State?: string;
  Description?: string;
  EventPattern?: string;
  RoleArn?: string;
  ManagedBy?: string;
}): EventBridgeRule | null {
  if (!rule.Name || !rule.Arn) return null;

  return {
    name: rule.Name,
    arn: rule.Arn,
    eventBusName: rule.EventBusName ?? DEFAULT_EVENT_BUS_NAME,
    state: mapRuleState(rule.State),
    description: rule.Description,
    eventPattern: rule.EventPattern,
    roleArn: rule.RoleArn,
    managedBy: rule.ManagedBy,
    targets: [],
  };
}

export async function listEventBuses(
  nextToken?: string,
  config?: AwsClientConfig,
): Promise<EventBusPage> {
  const client = createEventBridgeClient(config);

  try {
    const response = await client.send(
      new ListEventBusesCommand({
        NextToken: nextToken,
        Limit: 100,
      }),
    );

    const eventBuses: EventBusSummary[] = (response.EventBuses ?? []).flatMap((eventBus) =>
      eventBus.Name && eventBus.Arn
        ? [
            {
              name: eventBus.Name,
              arn: eventBus.Arn,
              description: eventBus.Description,
              policy: eventBus.Policy,
              createdAt: eventBus.CreationTime,
            },
          ]
        : [],
    );

    return { eventBuses, nextToken: response.NextToken };
  } finally {
    client.destroy();
  }
}

export async function getEventBusDetails(
  name: string,
  config?: AwsClientConfig,
): Promise<EventBusDetail> {
  const client = createEventBridgeClient(config);

  try {
    const response = await client.send(new DescribeEventBusCommand({ Name: name }));
    const resolvedName = response.Name ?? name;
    const arn = response.Arn ?? '';

    let description: string | undefined;
    let createdAt: Date | undefined;

    try {
      const listResponse = await client.send(
        new ListEventBusesCommand({ NamePrefix: resolvedName, Limit: 100 }),
      );
      const match = (listResponse.EventBuses ?? []).find((bus) => bus.Name === resolvedName);
      description = match?.Description;
      createdAt = match?.CreationTime;
    } catch {
      // Enrichment metadata is optional; describe already returned the core details.
    }

    return {
      name: resolvedName,
      arn,
      policy: response.Policy,
      description,
      createdAt,
      rules: [],
    };
  } finally {
    client.destroy();
  }
}

export async function listRules(
  eventBusName: string,
  nextToken?: string,
  config?: AwsClientConfig,
): Promise<RulePage> {
  const client = createEventBridgeClient(config);

  try {
    const response = await client.send(
      new ListRulesCommand({
        EventBusName: eventBusName,
        NextToken: nextToken,
        Limit: 100,
      }),
    );

    const rules = (response.Rules ?? []).flatMap((rule) => {
      const mapped = mapRule(rule);
      return mapped ? [mapped] : [];
    });

    return { rules, nextToken: response.NextToken };
  } finally {
    client.destroy();
  }
}

export async function listTargetsByRule(
  ruleName: string,
  eventBusName: string,
  config?: AwsClientConfig,
): Promise<RuleTarget[]> {
  const client = createEventBridgeClient(config);

  try {
    const response = await client.send(
      new ListTargetsByRuleCommand({
        Rule: ruleName,
        EventBusName: eventBusName,
        Limit: 100,
      }),
    );

    return (response.Targets ?? []).flatMap((target) => {
      const mapped = mapTarget(target);
      return mapped ? [mapped] : [];
    });
  } finally {
    client.destroy();
  }
}

export async function deleteEventBus(name: string, config?: AwsClientConfig): Promise<void> {
  if (name === DEFAULT_EVENT_BUS_NAME) {
    throw new Error('The default event bus cannot be deleted.');
  }

  const client = createEventBridgeClient(config);

  try {
    await client.send(new DeleteEventBusCommand({ Name: name }));
  } finally {
    client.destroy();
  }
}

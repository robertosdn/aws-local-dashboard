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
import { createEventBridgeClient, type AwsClientConfig } from '@/services/aws';
import type {
  EventBridgeRule,
  EventBusDetail,
  EventBusPage,
  EventBusSummary,
  RulePage,
  RuleTarget,
  RuleTargetInput,
  SaveRuleInput,
  SavedRule,
  SetRuleStateInput,
  DeleteRuleInput,
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
    targetsLoaded: false,
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
    const busTargetsClient = createEventBridgeClient(config);
    try {
      const rules = await Promise.all(
        (response.Rules ?? []).map(async (rule) => {
          const mapped = mapRule(rule);
          if (!mapped) return null;
          let targetToken: string | undefined;
          do {
            const targets = await busTargetsClient.send(
              new ListTargetsByRuleCommand({
                EventBusName: eventBusName,
                Rule: mapped.name,
                Limit: 100,
                NextToken: targetToken,
              }),
            );
            mapped.targets.push(
              ...(targets.Targets ?? []).flatMap((target) => {
                const mappedTarget = mapTarget(target);
                return mappedTarget ? [mappedTarget] : [];
              }),
            );
            targetToken = targets.NextToken;
          } while (targetToken);
          mapped.targetsLoaded = true;
          return mapped;
        }),
      );
      return {
        rules: rules.filter((rule): rule is EventBridgeRule => rule !== null),
        nextToken: response.NextToken,
      };
    } finally {
      busTargetsClient.destroy();
    }
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
    let nextToken: string | undefined;
    const targets: RuleTarget[] = [];
    do {
      const response = await client.send(
        new ListTargetsByRuleCommand({
          Rule: ruleName,
          EventBusName: eventBusName,
          Limit: 100,
          NextToken: nextToken,
        }),
      );
      targets.push(
        ...(response.Targets ?? []).flatMap((target) => {
          const mapped = mapTarget(target);
          return mapped ? [mapped] : [];
        }),
      );
      nextToken = response.NextToken;
    } while (nextToken);
    return targets;
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

function toSdkTarget(target: RuleTargetInput) {
  return {
    Id: target.id,
    Arn: target.arn,
    RoleArn: target.roleArn,
    Input: target.input,
    InputPath: target.inputPath,
  };
}

export async function putRule(
  eventBusName: string,
  values: SaveRuleInput['values'],
  config?: AwsClientConfig,
): Promise<SavedRule> {
  const client = createEventBridgeClient(config);
  try {
    const response = await client.send(
      new PutRuleCommand({
        EventBusName: eventBusName,
        Name: values.name,
        Description: values.description,
        EventPattern: values.eventPattern.trim() ? values.eventPattern : undefined,
        State: values.state,
      }),
    );
    return { name: values.name, arn: response.RuleArn };
  } finally {
    client.destroy();
  }
}

export async function putTargets(
  eventBusName: string,
  ruleName: string,
  targets: RuleTargetInput[],
  config?: AwsClientConfig,
): Promise<void> {
  if (targets.length === 0) return;
  const client = createEventBridgeClient(config);
  try {
    for (let offset = 0; offset < targets.length; offset += 10) {
      const response = await client.send(
        new PutTargetsCommand({
          EventBusName: eventBusName,
          Rule: ruleName,
          Targets: targets.slice(offset, offset + 10).map(toSdkTarget),
        }),
      );
      if ((response.FailedEntryCount ?? 0) > 0) {
        const failures = (response.FailedEntries ?? []).map(
          (entry) => entry.ErrorMessage ?? entry.ErrorCode ?? 'Unknown target error',
        );
        throw new Error(`Failed to save target(s): ${failures.join('; ')}`);
      }
    }
  } finally {
    client.destroy();
  }
}

export async function removeTargets(
  eventBusName: string,
  ruleName: string,
  targetIds: string[],
  config?: AwsClientConfig,
): Promise<void> {
  if (targetIds.length === 0) return;
  const client = createEventBridgeClient(config);
  try {
    for (let offset = 0; offset < targetIds.length; offset += 10) {
      const response = await client.send(
        new RemoveTargetsCommand({
          EventBusName: eventBusName,
          Rule: ruleName,
          Ids: targetIds.slice(offset, offset + 10),
        }),
      );
      if ((response.FailedEntryCount ?? 0) > 0) {
        const failures = (response.FailedEntries ?? []).map(
          (entry) => entry.ErrorMessage ?? entry.ErrorCode ?? 'Unknown target error',
        );
        throw new Error(`Failed to remove target(s): ${failures.join('; ')}`);
      }
    }
  } finally {
    client.destroy();
  }
}

export async function saveRule(input: SaveRuleInput, config?: AwsClientConfig): Promise<SavedRule> {
  const saved = await putRule(input.eventBusName, input.values, config);
  await putTargets(input.eventBusName, input.values.name, input.values.targets, config);

  const currentIds = new Set(input.values.targets.map((target) => target.id));
  const removedIds = (input.originalTargetIds ?? []).filter((id) => !currentIds.has(id));
  await removeTargets(input.eventBusName, input.values.name, removedIds, config);
  return saved;
}

export async function deleteRule(input: DeleteRuleInput, config?: AwsClientConfig): Promise<void> {
  const client = createEventBridgeClient(config);
  try {
    let nextToken: string | undefined;
    const targetIds: string[] = [];
    do {
      const targets = await client.send(
        new ListTargetsByRuleCommand({
          EventBusName: input.eventBusName,
          Rule: input.ruleName,
          Limit: 100,
          NextToken: nextToken,
        }),
      );
      targetIds.push(
        ...(targets.Targets ?? []).flatMap((target) => (target.Id ? [target.Id] : [])),
      );
      nextToken = targets.NextToken;
    } while (nextToken);
    for (let offset = 0; offset < targetIds.length; offset += 10) {
      const removal = await client.send(
        new RemoveTargetsCommand({
          EventBusName: input.eventBusName,
          Rule: input.ruleName,
          Ids: targetIds.slice(offset, offset + 10),
        }),
      );
      if ((removal.FailedEntryCount ?? 0) > 0) {
        const failures = (removal.FailedEntries ?? []).map(
          (entry) => entry.ErrorMessage ?? entry.ErrorCode ?? 'Unknown target error',
        );
        throw new Error(`Failed to remove target(s): ${failures.join('; ')}`);
      }
    }
    await client.send(
      new DeleteRuleCommand({ EventBusName: input.eventBusName, Name: input.ruleName }),
    );
  } finally {
    client.destroy();
  }
}

export async function setRuleState(
  input: SetRuleStateInput,
  config?: AwsClientConfig,
): Promise<void> {
  const client = createEventBridgeClient(config);
  try {
    const command =
      input.state === 'ENABLED'
        ? new EnableRuleCommand({ EventBusName: input.eventBusName, Name: input.ruleName })
        : new DisableRuleCommand({ EventBusName: input.eventBusName, Name: input.ruleName });
    await client.send(command);
  } finally {
    client.destroy();
  }
}

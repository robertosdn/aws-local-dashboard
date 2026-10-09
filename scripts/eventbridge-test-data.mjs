import { EventBridgeClient, PutRuleCommand, PutTargetsCommand } from '@aws-sdk/client-eventbridge';

const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const eventBusName = process.env.EVENT_BUS_NAME ?? 'dashboard-eventbridge-samples';
const targetArn =
  process.env.TARGET_ARN ?? `arn:aws:sqs:${region}:000000000000:dashboard-lambda-events`;
const targetRoleArn =
  process.env.TARGET_ROLE_ARN ?? 'arn:aws:iam::000000000000:role/eventbridge-role';

const client = new EventBridgeClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

// Schedule-based rules are intentionally excluded: scheduled triggers belong to
// EventBridge Scheduler (feature 010), not EventBridge EventBus rules.
const sampleRules = [
  {
    Name: 'dashboard-sample-enabled',
    Description: 'Sample enabled rule that matches order events',
    EventPattern: JSON.stringify({ source: ['app.orders'] }),
    State: 'ENABLED',
    targetId: 'dashboard-sample-target',
  },
  {
    Name: 'dashboard-sample-disabled',
    Description: 'Sample disabled rule that matches customer events',
    EventPattern: JSON.stringify({ source: ['app.customers'] }),
    State: 'DISABLED',
    targetId: 'dashboard-sample-target',
  },
];

async function upsertRule(rule) {
  await client.send(
    new PutRuleCommand({
      Name: rule.Name,
      EventBusName: eventBusName,
      Description: rule.Description,
      EventPattern: rule.EventPattern,
      State: rule.State,
      RoleArn: targetRoleArn,
    }),
  );
}

async function upsertTarget(rule) {
  await client.send(
    new PutTargetsCommand({
      Rule: rule.Name,
      EventBusName: eventBusName,
      Targets: [
        {
          Id: rule.targetId,
          Arn: targetArn,
          RoleArn: targetRoleArn,
        },
      ],
    }),
  );
}

async function main() {
  for (const rule of sampleRules) {
    await upsertRule(rule);
    await upsertTarget(rule);
    console.log(`EventBridge rule upserted: ${rule.Name} (${rule.State})`);
  }

  console.log(
    `EventBridge sample data ready on "${eventBusName}" (target ${targetArn}).`,
  );
}

main()
  .catch((error) => {
    console.error(`Could not add EventBridge sample rules to "${eventBusName}".`);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

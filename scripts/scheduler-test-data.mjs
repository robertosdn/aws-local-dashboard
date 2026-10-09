import {
  CreateScheduleCommand,
  GetScheduleCommand,
  SchedulerClient,
  UpdateScheduleCommand,
} from '@aws-sdk/client-scheduler';

const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const scheduleGroupName = process.env.SCHEDULE_GROUP_NAME ?? 'dashboard-scheduler-samples';
const targetArn =
  process.env.TARGET_ARN ?? `arn:aws:sqs:${region}:000000000000:dashboard-lambda-events`;
const targetRoleArn =
  process.env.TARGET_ROLE_ARN ?? 'arn:aws:iam::000000000000:role/scheduler-role';

const client = new SchedulerClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

// Deterministic samples: at least one enabled and one disabled schedule.
// Run create-scheduler-schedule-group.mjs first so the group exists.
const sampleSchedules = [
  {
    Name: 'dashboard-sample-rate',
    Description: 'Sample enabled schedule that runs every 5 minutes',
    ScheduleExpression: 'rate(5 minutes)',
    State: 'ENABLED',
  },
  {
    Name: 'dashboard-sample-cron',
    Description: 'Sample disabled schedule that would run daily at 12:00 UTC',
    ScheduleExpression: 'cron(0 12 * * ? *)',
    State: 'DISABLED',
  },
];

function scheduleInput(sample) {
  return {
    Name: sample.Name,
    GroupName: scheduleGroupName,
    Description: sample.Description,
    ScheduleExpression: sample.ScheduleExpression,
    ScheduleExpressionTimezone: 'UTC',
    State: sample.State,
    FlexibleTimeWindow: { Mode: 'OFF' },
    Target: {
      Arn: targetArn,
      RoleArn: targetRoleArn,
    },
  };
}

async function scheduleExists(name) {
  try {
    await client.send(new GetScheduleCommand({ Name: name, GroupName: scheduleGroupName }));
    return true;
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (
      statusCode === 404 ||
      ['ResourceNotFoundException', 'ResourceNotFound'].includes(error?.name)
    ) {
      return false;
    }
    throw error;
  }
}

async function upsertSchedule(sample) {
  const input = scheduleInput(sample);

  if (await scheduleExists(sample.Name)) {
    await client.send(new UpdateScheduleCommand(input));
    console.log(`EventBridge Scheduler schedule updated: ${sample.Name} (${sample.State})`);
    return;
  }

  await client.send(new CreateScheduleCommand(input));
  console.log(`EventBridge Scheduler schedule created: ${sample.Name} (${sample.State})`);
}

async function main() {
  for (const sample of sampleSchedules) {
    await upsertSchedule(sample);
  }

  console.log(
    `EventBridge Scheduler sample data ready on "${scheduleGroupName}" (target ${targetArn}).`,
  );
}

main()
  .catch((error) => {
    console.error(
      `Could not add EventBridge Scheduler sample schedules to "${scheduleGroupName}".`,
    );
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

import {
  CreateScheduleGroupCommand,
  GetScheduleGroupCommand,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';

const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const scheduleGroupName = process.env.SCHEDULE_GROUP_NAME ?? 'dashboard-scheduler-samples';

const client = new SchedulerClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

async function scheduleGroupExists() {
  try {
    await client.send(new GetScheduleGroupCommand({ Name: scheduleGroupName }));
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

async function main() {
  if (await scheduleGroupExists()) {
    console.log(`EventBridge Scheduler schedule group already exists: ${scheduleGroupName}`);
    return;
  }

  try {
    await client.send(new CreateScheduleGroupCommand({ Name: scheduleGroupName }));
    console.log(`EventBridge Scheduler schedule group created: ${scheduleGroupName}`);
  } catch (error) {
    if (['ConflictException', 'ResourceAlreadyExistsException'].includes(error?.name)) {
      console.log(`EventBridge Scheduler schedule group was created concurrently: ${scheduleGroupName}`);
      return;
    }
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(
      `Could not create or verify EventBridge Scheduler schedule group "${scheduleGroupName}".`,
    );
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

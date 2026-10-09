import {
  CreateEventBusCommand,
  DescribeEventBusCommand,
  EventBridgeClient,
} from '@aws-sdk/client-eventbridge';

const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const eventBusName = process.env.EVENT_BUS_NAME ?? 'dashboard-eventbridge-samples';

const client = new EventBridgeClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

async function eventBusExists() {
  try {
    await client.send(new DescribeEventBusCommand({ Name: eventBusName }));
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
  if (await eventBusExists()) {
    console.log(`EventBridge event bus already exists: ${eventBusName}`);
    return;
  }

  try {
    await client.send(new CreateEventBusCommand({ Name: eventBusName }));
    console.log(`EventBridge event bus created: ${eventBusName}`);
  } catch (error) {
    if (error?.name === 'ResourceAlreadyExistsException') {
      console.log(`EventBridge event bus was created concurrently: ${eventBusName}`);
      return;
    }
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(`Could not create or verify EventBridge event bus "${eventBusName}".`);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

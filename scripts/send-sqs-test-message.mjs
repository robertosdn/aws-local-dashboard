import { spawnSync } from 'node:child_process';

const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const queueName = process.env.QUEUE_NAME ?? 'dashboard-lambda-events';
const messageBody =
  process.argv[2] ??
  process.env.MESSAGE_BODY ??
  JSON.stringify({
    message: 'Test message from the AWS Local Dashboard helper.',
  });

function aws(...args) {
  const result = spawnSync('aws', [...args, '--no-cli-pager'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      AWS_ACCESS_KEY_ID: 'test',
      AWS_SECRET_ACCESS_KEY: 'test',
      AWS_DEFAULT_REGION: region,
      AWS_PAGER: '',
    },
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`AWS CLI command failed (exit code ${result.status}): ${result.stderr.trim()}`);
  }

  return result.stdout.trim();
}

function awsValue(...args) {
  const value = aws(...args);
  if (!value || value === 'None') {
    throw new Error(`AWS CLI did not return the expected value for: aws ${args.join(' ')}`);
  }
  return value;
}

try {
  const queueUrl = awsValue(
    'sqs',
    'get-queue-url',
    '--queue-name',
    queueName,
    '--endpoint-url',
    endpoint,
    '--query',
    'QueueUrl',
    '--output',
    'text',
  );
  const messageId = awsValue(
    'sqs',
    'send-message',
    '--queue-url',
    queueUrl,
    '--message-body',
    messageBody,
    '--endpoint-url',
    endpoint,
    '--query',
    'MessageId',
    '--output',
    'text',
  );

  console.log(`Message sent to ${queueName} (${queueUrl}). Message ID: ${messageId}`);
} catch (error) {
  console.error(`Could not send a test message to SQS queue "${queueName}".`);
  console.error(error);
  process.exitCode = 1;
}

import { ZipArchive } from 'archiver';
import { spawnSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const queueName = process.env.QUEUE_NAME ?? 'dashboard-lambda-events';
const functionName = process.env.FUNCTION_NAME ?? 'dashboard-sqs-consumer';
const roleArn =
  process.env.LAMBDA_ROLE_ARN ?? 'arn:aws:iam::000000000000:role/lambda-role';
const handlerPath = join(scriptDirectory, 'lambda-test.mjs');

async function createZip(sourcePath, outputPath) {
  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.file(sourcePath, { name: 'lambda-test.mjs' });

  await Promise.all([
    pipeline(archive, createWriteStream(outputPath)),
    archive.finalize(),
  ]);
}

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
    throw new Error(
      `AWS CLI command failed (exit code ${result.status}): ${result.stderr.trim()}`,
    );
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

async function main() {
  const queueUrl = awsValue(
    'sqs',
    'create-queue',
    '--queue-name',
    queueName,
    '--endpoint-url',
    endpoint,
    '--query',
    'QueueUrl',
    '--output',
    'text',
  );
  console.log(`SQS queue created: ${queueUrl}`);

  const queueArn = awsValue(
    'sqs',
    'get-queue-attributes',
    '--queue-url',
    queueUrl,
    '--attribute-names',
    'QueueArn',
    '--endpoint-url',
    endpoint,
    '--query',
    'Attributes.QueueArn',
    '--output',
    'text',
  );

  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'sqs-lambda-'));
  const zipPath = join(temporaryDirectory, 'function.zip');

  try {
    await createZip(handlerPath, zipPath);
    const functionArn = awsValue(
      'lambda',
      'create-function',
      '--function-name',
      functionName,
      '--runtime',
      'nodejs20.x',
      '--role',
      roleArn,
      '--handler',
      'lambda-test.handler',
      '--zip-file',
      `fileb://${zipPath}`,
      '--description',
      'Consumes messages from the local dashboard SQS queue.',
      '--timeout',
      '10',
      '--endpoint-url',
      endpoint,
      '--query',
      'FunctionArn',
      '--output',
      'text',
    );
    console.log(`Lambda function created: ${functionArn}`);

    const mappingUuid = awsValue(
      'lambda',
      'create-event-source-mapping',
      '--event-source-arn',
      queueArn,
      '--function-name',
      functionArn,
      '--batch-size',
      '10',
      '--enabled',
      '--endpoint-url',
      endpoint,
      '--query',
      'UUID',
      '--output',
      'text',
    );
    console.log(`SQS event source mapping created: ${mappingUuid}`);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('Could not create the SQS queue, Lambda, and event source mapping.');
  console.error(error);
  process.exitCode = 1;
});

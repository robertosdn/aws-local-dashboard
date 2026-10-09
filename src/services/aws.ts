import { SQSClient } from '@aws-sdk/client-sqs';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { SchedulerClient } from '@aws-sdk/client-scheduler';

export type AwsClientConfig = {
  endpoint?: string;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
};

function isLocalAwsEndpoint(endpoint: string): boolean {
  const hostname = new URL(endpoint).hostname.toLowerCase();
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === 'localstack' ||
    hostname === 'ministack'
  );
}

export function createSqsClient(config: AwsClientConfig = {}) {
  const {
    endpoint = 'http://localhost:4566',
    region = 'us-east-1',
    credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  } = config;

  const client = new SQSClient({
    region,
    endpoint,
    credentials,
  });

  if (isLocalAwsEndpoint(endpoint)) {
    client.middlewareStack.add(
      (next) => async (args) => {
        if (
          typeof args.request === 'object' &&
          args.request !== null &&
          'headers' in args.request &&
          typeof args.request.headers === 'object' &&
          args.request.headers !== null
        ) {
          Reflect.deleteProperty(args.request.headers, 'x-amzn-query-mode');
        }
        return next(args);
      },
      {
        name: 'removeSqsQueryModeHeader',
        step: 'build',
      },
    );
  }

  return client;
}

export function createLambdaClient(config: AwsClientConfig = {}) {
  const {
    endpoint = 'http://localhost:4566',
    region = 'us-east-1',
    credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  } = config;

  return new LambdaClient({
    region,
    endpoint,
    credentials,
  });
}

export function createDynamoDbClient(config: AwsClientConfig = {}) {
  const {
    endpoint = 'http://localhost:4566',
    region = 'us-east-1',
    credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  } = config;

  return new DynamoDBClient({
    region,
    endpoint,
    credentials,
  });
}

export function createS3Client(config: AwsClientConfig = {}) {
  const {
    endpoint = 'http://localhost:4566',
    region = 'us-east-1',
    credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  } = config;

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials,
  });
}

export function createEventBridgeClient(config: AwsClientConfig = {}) {
  const {
    endpoint = 'http://localhost:4566',
    region = 'us-east-1',
    credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  } = config;

  return new EventBridgeClient({
    region,
    endpoint,
    credentials,
  });
}

export function createSchedulerClient(config: AwsClientConfig = {}) {
  const {
    endpoint = 'http://localhost:4566',
    region = 'us-east-1',
    credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  } = config;

  return new SchedulerClient({
    region,
    endpoint,
    credentials,
  });
}

export function createDynamoDbDocumentClient(config: AwsClientConfig = {}) {
  const client = createDynamoDbClient(config);
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: true,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  });
}

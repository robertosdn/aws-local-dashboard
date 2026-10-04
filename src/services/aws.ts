import { SQSClient } from '@aws-sdk/client-sqs';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

export type AwsClientConfig = {
  endpoint?: string;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
};

export function createSqsClient(config: AwsClientConfig = {}) {
  const {
    endpoint = 'http://localhost:4566',
    region = 'us-east-1',
    credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  } = config;

  return new SQSClient({
    region,
    endpoint,
    credentials,
  });
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

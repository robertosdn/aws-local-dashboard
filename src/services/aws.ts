import { SQSClient } from '@aws-sdk/client-sqs';
import { LambdaClient } from '@aws-sdk/client-lambda';

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

import {
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  type QueueAttributeName,
} from '@aws-sdk/client-sqs';

import { createSqsClient, type AwsClientConfig } from '@/services/aws';
import type { SQSQueueInfo } from '../types';

const QUEUE_ATTRIBUTES: QueueAttributeName[] = ['All'];

function extractQueueNameFromArn(arn: string): string {
  const parts = arn.split(':');
  return parts[parts.length - 1] || arn;
}

function extractQueueNameFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1] || url;
}

export async function getQueueAttributes(
  queueUrl: string,
  config?: AwsClientConfig,
): Promise<SQSQueueInfo['attributes']> {
  const client = createSqsClient(config);

  try {
    const command = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: QUEUE_ATTRIBUTES,
    });

    const response = await client.send(command);
    const attrs = response.Attributes || {};

    return {
      ApproximateNumberOfMessages: attrs.ApproximateNumberOfMessages || '0',
      ApproximateNumberOfMessagesNotVisible: attrs.ApproximateNumberOfMessagesNotVisible || '0',
      ApproximateNumberOfMessagesDelayed: attrs.ApproximateNumberOfMessagesDelayed || '0',
      CreatedTimestamp: attrs.CreatedTimestamp || '',
      LastModifiedTimestamp: attrs.LastModifiedTimestamp || '',
      VisibilityTimeout: attrs.VisibilityTimeout || '',
      MaximumMessageSize: attrs.MaximumMessageSize || '',
      MessageRetentionPeriod: attrs.MessageRetentionPeriod || '',
      DelaySeconds: attrs.DelaySeconds || '',
      ReceiveMessageWaitTimeSeconds: attrs.ReceiveMessageWaitTimeSeconds || '',
      RedrivePolicy: attrs.RedrivePolicy,
    };
  } finally {
    client.destroy();
  }
}

export async function getQueueUrl(
  queueName: string,
  config?: AwsClientConfig,
): Promise<string> {
  const client = createSqsClient(config);

  try {
    const command = new GetQueueUrlCommand({ QueueName: queueName });
    const response = await client.send(command);
    return response.QueueUrl || '';
  } finally {
    client.destroy();
  }
}

export async function getQueueInfoFromArn(
  queueArn: string,
  config?: AwsClientConfig,
): Promise<SQSQueueInfo | null> {
  const queueName = extractQueueNameFromArn(queueArn);
  const queueUrl = await getQueueUrl(queueName, config);

  if (!queueUrl) return null;

  const attributes = await getQueueAttributes(queueUrl, config);

  return {
    queueUrl,
    queueName,
    queueArn,
    attributes,
  };
}

export async function getQueueInfoFromUrl(
  queueUrl: string,
  config?: AwsClientConfig,
): Promise<SQSQueueInfo | null> {
  const queueName = extractQueueNameFromUrl(queueUrl);
  const attributes = await getQueueAttributes(queueUrl, config);

  return {
    queueUrl,
    queueName,
    queueArn: '', // We don't have ARN from URL alone
    attributes,
  };
}
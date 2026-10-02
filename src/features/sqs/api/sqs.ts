import {
  SQSClient,
  ListQueuesCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  PurgeQueueCommand,
  type QueueAttributeName,
} from '@aws-sdk/client-sqs';

import { createSqsClient } from '@/services/aws';
import type { SQSQueue, SQSMessage, PurgeQueueResult } from '../types/sqs';

const QUEUE_ATTRIBUTES: QueueAttributeName[] = [
  'All',
];

const MESSAGE_ATTRIBUTES = ['All'];

function extractQueueName(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1] || url;
}

async function getQueueAttributes(client: SQSClient, queueUrl: string): Promise<SQSQueue['attributes']> {
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
    CreatedTimestamp: attrs.CreatedTimestamp,
    LastModifiedTimestamp: attrs.LastModifiedTimestamp,
    VisibilityTimeout: attrs.VisibilityTimeout,
    MaximumMessageSize: attrs.MaximumMessageSize,
    MessageRetentionPeriod: attrs.MessageRetentionPeriod,
  };
}

export async function listQueues(): Promise<SQSQueue[]> {
  const client = createSqsClient();

  const listCommand = new ListQueuesCommand({});
  const listResponse = await client.send(listCommand);

  const queueUrls = listResponse.QueueUrls || [];

  const queues: SQSQueue[] = await Promise.all(
    queueUrls.map(async (queueUrl) => {
      const attributes = await getQueueAttributes(client, queueUrl);
      return {
        url: queueUrl,
        name: extractQueueName(queueUrl),
        attributes,
      };
    })
  );

  return queues;
}

export async function receiveMessages(
  queueUrl: string,
  maxMessages = 10
): Promise<SQSMessage[]> {
  const client = createSqsClient();

  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: maxMessages,
    WaitTimeSeconds: 0,
    AttributeNames: ['All'] as QueueAttributeName[],
    MessageAttributeNames: MESSAGE_ATTRIBUTES,
    VisibilityTimeout: 0,
  });

  const response = await client.send(command);
  const messages = response.Messages || [];

  return messages.map((msg): SQSMessage => ({
    messageId: msg.MessageId || '',
    receiptHandle: msg.ReceiptHandle || '',
    body: msg.Body || '',
    attributes: msg.Attributes || {},
    messageAttributes: msg.MessageAttributes as SQSMessage['messageAttributes'],
  }));
}

export async function purgeQueue(queueUrl: string): Promise<PurgeQueueResult> {
  const client = createSqsClient();

  const command = new PurgeQueueCommand({
    QueueUrl: queueUrl,
  });

  await client.send(command);
  return { success: true };
}
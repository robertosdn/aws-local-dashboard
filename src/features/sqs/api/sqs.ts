import {
  SQSClient,
  ListQueuesCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  PurgeQueueCommand,
  type QueueAttributeName,
} from '@aws-sdk/client-sqs';

import { createSqsClient, type AwsClientConfig } from '@/services/aws';
import type {
  SQSQueue,
  SQSMessage,
  PurgeQueueResult,
  SendMessageOptions,
  SendMessageResult,
  SQSQueueDetails,
} from '../types/sqs';

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

export async function listQueues(config?: AwsClientConfig): Promise<SQSQueue[]> {
  const client = createSqsClient(config);

  try {
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
  } finally {
    client.destroy();
  }
}

export async function receiveMessages(
  queueUrl: string,
  maxMessages = 10,
  config?: AwsClientConfig,
): Promise<SQSMessage[]> {
  const client = createSqsClient(config);

  try {
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
  } finally {
    client.destroy();
  }
}

export async function getQueueDetails(
  queueUrl: string,
  config?: AwsClientConfig,
): Promise<SQSQueueDetails> {
  const client = createSqsClient(config);

  try {
    const command = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: QUEUE_ATTRIBUTES,
    });

    const response = await client.send(command);

    return {
      url: queueUrl,
      name: extractQueueName(queueUrl),
      attributes: response.Attributes || {},
    };
  } finally {
    client.destroy();
  }
}

export async function sendMessage(
  queueUrl: string,
  body: string,
  config?: AwsClientConfig,
  options: SendMessageOptions = {},
): Promise<SendMessageResult> {
  const client = createSqsClient(config);

  try {
    const messageAttributes = options.messageAttributes
      ? Object.fromEntries(
          Object.entries(options.messageAttributes).map(([name, value]) => [
            name,
            { DataType: value.dataType, StringValue: value.stringValue },
          ]),
        )
      : undefined;

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: body,
      MessageAttributes: messageAttributes,
      DelaySeconds: options.delaySeconds,
    });

    const response = await client.send(command);

    return {
      messageId: response.MessageId || '',
      md5OfMessageBody: response.MD5OfMessageBody,
      md5OfMessageAttributes: response.MD5OfMessageAttributes,
    };
  } finally {
    client.destroy();
  }
}

export async function purgeQueue(queueUrl: string, config?: AwsClientConfig): Promise<PurgeQueueResult> {
  const client = createSqsClient(config);

  try {
    const command = new PurgeQueueCommand({
      QueueUrl: queueUrl,
    });

    await client.send(command);
    return { success: true };
  } finally {
    client.destroy();
  }
}
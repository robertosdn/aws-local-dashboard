export interface SQSQueue {
  url: string;
  name: string;
  attributes: {
    ApproximateNumberOfMessages: string;
    ApproximateNumberOfMessagesNotVisible: string;
    ApproximateNumberOfMessagesDelayed: string;
    CreatedTimestamp?: string;
    LastModifiedTimestamp?: string;
    VisibilityTimeout?: string;
    MaximumMessageSize?: string;
    MessageRetentionPeriod?: string;
  };
}

export interface SQSMessage {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: {
    ApproximateReceiveCount?: string;
    SentTimestamp?: string;
    SenderId?: string;
    ApproximateFirstReceiveTimestamp?: string;
  };
  messageAttributes?: Record<string, SQSMessageAttributeValue>;
}

export interface QueueListResult {
  queues: SQSQueue[];
  nextToken?: string;
}

export interface MessageListResult {
  messages: SQSMessage[];
  nextToken?: string;
}

export interface PurgeQueueResult {
  success: boolean;
}

export interface SQSQueueDetails {
  url: string;
  name: string;
  attributes: Record<string, string>;
}

export type SQSMessageAttributeValue = {
  dataType: string;
  stringValue?: string;
  binaryValue?: Uint8Array;
};

export interface SendMessageAttributeValue {
  dataType: 'String';
  stringValue: string;
}

export interface SendMessageOptions {
  messageAttributes?: Record<string, SendMessageAttributeValue>;
  delaySeconds?: number;
}

export interface SendMessageResult {
  messageId: string;
  md5OfMessageBody?: string;
  md5OfMessageAttributes?: string;
}

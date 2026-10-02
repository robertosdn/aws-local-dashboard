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
  messageAttributes?: Record<string, {
    dataType: string;
    stringValue?: string;
    binaryValue?: Uint8Array;
  }>;
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
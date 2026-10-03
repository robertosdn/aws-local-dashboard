export interface EventSourceMapping {
  uuid: string;
  eventSourceArn: string;
  functionArn: string;
  state: 'Creating' | 'Enabling' | 'Enabled' | 'Disabling' | 'Disabled' | 'Updating' | 'Deleting' | 'Deleted';
  stateTransitionReason?: string;
  batchSize: number;
  maximumBatchingWindowInSeconds: number;
  parallelizationFactor?: number;
  eventSourceMappingArn: string;
  filterCriteria?: {
    filters: Array<{
      pattern: string;
    }>;
  };
  sourceAccessConfigurations?: Array<{
    type: 'BASIC_AUTH' | 'VPC_SUBNET' | 'VPC_SECURITY_GROUP' | 'SASL_SCRAM' | 'CLIENT_CERTIFICATE_TLS_AUTH';
    uri: string;
  }>;
  selfManagedEventSource?: {
    endpoints: Record<string, string[]>;
  };
  maximumRecordAgeInSeconds?: number;
  bisectBatchOnFunctionError?: boolean;
  maximumRetryAttempts?: number;
  tumblingWindowInSeconds?: number;
  functionResponseTypes?: string[];
  scalingConfig?: {
    maximumConcurrency: number;
  };
  documentDbEventSourceConfig?: {
    databaseName: string;
    collectionName: string;
    fullDocument: string;
  };
}

export interface SQSQueueInfo {
  queueUrl: string;
  queueName: string;
  queueArn: string;
  attributes: {
    ApproximateNumberOfMessages: string;
    ApproximateNumberOfMessagesNotVisible: string;
    ApproximateNumberOfMessagesDelayed: string;
    CreatedTimestamp: string;
    LastModifiedTimestamp: string;
    VisibilityTimeout: string;
    MaximumMessageSize: string;
    MessageRetentionPeriod: string;
    DelaySeconds: string;
    ReceiveMessageWaitTimeSeconds: string;
    RedrivePolicy?: string;
  };
}

export interface LambdaFunctionDetail {
  functionName: string;
  functionArn: string;
  runtime: string;
  handler: string;
  memorySize: number;
  timeout: number;
  lastModified: string;
  version: string;
  codeSize: number;
  description?: string;
  code: {
    repositoryType: string;
    location?: string;
    imageUri?: string;
    resolvedImageUri?: string;
  };
  environment?: {
    variables: Record<string, string>;
  };
  layers?: Array<{ arn: string; codeSize: number }>;
  state: 'Active' | 'Inactive' | 'Failed';
  stateReason?: string;
  stateReasonCode?: string;
  vpcConfig?: {
    vpcId: string;
    subnetIds: string[];
    securityGroupIds: string[];
  };
  tracingConfig?: { mode: 'Active' | 'PassThrough' };
  revisionId?: string;
}

export interface ListEventSourceMappingsParams {
  functionName?: string;
  eventSourceArn?: string;
  maxItems?: number;
  marker?: string;
}

export interface UpdateEventSourceMappingRequest {
  enabled?: boolean;
  batchSize?: number;
  maximumBatchingWindowInSeconds?: number;
  functionResponseTypes?: string[];
}

export interface CreateEventSourceMappingRequest {
  eventSourceArn: string;
  functionName: string;
  enabled?: boolean;
  batchSize?: number;
  maximumBatchingWindowInSeconds?: number;
  parallelizationFactor?: number;
  filterCriteria?: {
    filters: Array<{ pattern: string }>;
  };
}
import {
  ListFunctionsCommand,
  GetFunctionCommand,
  GetFunctionConfigurationCommand,
  ListEventSourceMappingsCommand,
  GetEventSourceMappingCommand,
  UpdateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  CreateEventSourceMappingCommand,
  InvokeCommand,
  type FunctionConfiguration,
  type EventSourceMappingConfiguration,
} from '@aws-sdk/client-lambda';

import { createLambdaClient, type AwsClientConfig } from '@/services/aws';
import type {
  LambdaFunction,
  InvocationRequest,
  InvocationResponse,
  EventSourceMapping,
  ListEventSourceMappingsParams,
  UpdateEventSourceMappingRequest,
  CreateEventSourceMappingRequest,
  LambdaFunctionDetail,
} from '../types';

function mapFunction(config: FunctionConfiguration): LambdaFunction {
  return {
    functionName: config.FunctionName || '',
    functionArn: config.FunctionArn || '',
    runtime: config.Runtime || '',
    handler: config.Handler || '',
    codeSize: config.CodeSize || 0,
    description: config.Description || '',
    timeout: config.Timeout || 3,
    memorySize: config.MemorySize || 128,
    lastModified: config.LastModified || '',
    codeSha256: config.CodeSha256 || '',
    version: config.Version || '$LATEST',
    vpcConfig: config.VpcConfig
      ? {
          vpcId: config.VpcConfig.VpcId || '',
          subnetIds: config.VpcConfig.SubnetIds || [],
          securityGroupIds: config.VpcConfig.SecurityGroupIds || [],
        }
      : undefined,
    environment: config.Environment
      ? { variables: config.Environment.Variables || {} }
      : undefined,
    layers: config.Layers?.map((l) => ({ arn: l.Arn || '', codeSize: l.CodeSize || 0 })),
  };
}

function mapFunctionDetail(config: FunctionConfiguration): LambdaFunctionDetail {
  return {
    functionName: config.FunctionName || '',
    functionArn: config.FunctionArn || '',
    runtime: config.Runtime || '',
    handler: config.Handler || '',
    memorySize: config.MemorySize || 128,
    timeout: config.Timeout || 3,
    lastModified: config.LastModified || '',
    version: config.Version || '$LATEST',
    codeSize: config.CodeSize || 0,
    description: config.Description,
    code: {
      repositoryType: 'S3',
      location: undefined,
      imageUri: undefined,
      resolvedImageUri: undefined,
    },
    environment: config.Environment
      ? { variables: config.Environment.Variables || {} }
      : undefined,
    layers: config.Layers?.map((l) => ({ arn: l.Arn || '', codeSize: l.CodeSize || 0 })),
    state: (config.State || 'Active') as LambdaFunctionDetail['state'],
    stateReason: config.StateReason,
    stateReasonCode: config.StateReasonCode,
    vpcConfig: config.VpcConfig
      ? {
          vpcId: config.VpcConfig.VpcId || '',
          subnetIds: config.VpcConfig.SubnetIds || [],
          securityGroupIds: config.VpcConfig.SecurityGroupIds || [],
        }
      : undefined,
    tracingConfig: config.TracingConfig
      ? { mode: config.TracingConfig.Mode as 'Active' | 'PassThrough' }
      : undefined,
    revisionId: config.RevisionId,
  };
}

function mapEventSourceMapping(config: EventSourceMappingConfiguration): EventSourceMapping {
  return {
    uuid: config.UUID || '',
    eventSourceArn: config.EventSourceArn || '',
    functionArn: config.FunctionArn || '',
    state: (config.State || 'Creating') as EventSourceMapping['state'],
    stateTransitionReason: config.StateTransitionReason,
    batchSize: config.BatchSize || 0,
    maximumBatchingWindowInSeconds: config.MaximumBatchingWindowInSeconds || 0,
    parallelizationFactor: config.ParallelizationFactor,
    eventSourceMappingArn: config.EventSourceMappingArn || '',
    filterCriteria: config.FilterCriteria
      ? { filters: config.FilterCriteria.Filters?.map((f) => ({ pattern: f.Pattern || '' })) || [] }
      : undefined,
    sourceAccessConfigurations: config.SourceAccessConfigurations?.map((s) => ({
      type: s.Type as 'BASIC_AUTH' | 'VPC_SUBNET' | 'VPC_SECURITY_GROUP' | 'SASL_SCRAM' | 'CLIENT_CERTIFICATE_TLS_AUTH',
      uri: s.URI || '',
    })),
    selfManagedEventSource: config.SelfManagedEventSource
      ? { endpoints: config.SelfManagedEventSource.Endpoints || {} }
      : undefined,
    maximumRecordAgeInSeconds: config.MaximumRecordAgeInSeconds,
    bisectBatchOnFunctionError: config.BisectBatchOnFunctionError,
    maximumRetryAttempts: config.MaximumRetryAttempts,
    tumblingWindowInSeconds: config.TumblingWindowInSeconds,
    functionResponseTypes: config.FunctionResponseTypes as EventSourceMapping['functionResponseTypes'],
    scalingConfig: config.ScalingConfig
      ? { maximumConcurrency: config.ScalingConfig.MaximumConcurrency || 0 }
      : undefined,
    documentDbEventSourceConfig: config.DocumentDBEventSourceConfig
      ? {
          databaseName: config.DocumentDBEventSourceConfig.DatabaseName || '',
          collectionName: config.DocumentDBEventSourceConfig.CollectionName || '',
          fullDocument: config.DocumentDBEventSourceConfig.FullDocument || '',
        }
      : undefined,
  };
}

export async function listFunctions(config?: AwsClientConfig): Promise<LambdaFunction[]> {
  const client = createLambdaClient(config);

  try {
    const command = new ListFunctionsCommand({});
    const response = await client.send(command);

    const functions = response.Functions || [];
    return functions.map(mapFunction);
  } finally {
    client.destroy();
  }
}

export async function getFunction(functionName: string, config?: AwsClientConfig): Promise<LambdaFunction | null> {
  const client = createLambdaClient(config);

  try {
    const command = new GetFunctionCommand({ FunctionName: functionName });
    const response = await client.send(command);

    if (!response.Configuration) return null;
    return mapFunction(response.Configuration);
  } finally {
    client.destroy();
  }
}

export async function getFunctionConfiguration(
  functionName: string,
  config?: AwsClientConfig,
): Promise<FunctionConfiguration | null> {
  const client = createLambdaClient(config);

  try {
    const command = new GetFunctionConfigurationCommand({ FunctionName: functionName });
    const response = await client.send(command);
    return response;
  } finally {
    client.destroy();
  }
}

export async function getFunctionDetail(
  functionName: string,
  config?: AwsClientConfig,
): Promise<LambdaFunctionDetail | null> {
  const client = createLambdaClient(config);

  try {
    const command = new GetFunctionConfigurationCommand({ FunctionName: functionName });
    const response = await client.send(command);
    if (!response) return null;
    return mapFunctionDetail(response);
  } finally {
    client.destroy();
  }
}

export async function invokeFunction(
  request: InvocationRequest,
  config?: AwsClientConfig,
): Promise<InvocationResponse> {
  const client = createLambdaClient(config);

  try {
    const command = new InvokeCommand({
      FunctionName: request.functionName,
      Payload: new TextEncoder().encode(request.payload),
      InvocationType: request.invocationType || 'RequestResponse',
      LogType: request.logType || 'Tail',
    });

    const response = await client.send(command);

    const payload = response.Payload ? new TextDecoder().decode(response.Payload) : '{}';
    const logResult = response.LogResult ? atob(response.LogResult) : undefined;

    return {
      statusCode: response.StatusCode || 200,
      payload,
      logResult,
      executedVersion: response.ExecutedVersion,
      functionError: response.FunctionError,
    };
  } finally {
    client.destroy();
  }
}

export async function listEventSourceMappings(
  params: ListEventSourceMappingsParams = {},
  config?: AwsClientConfig,
): Promise<EventSourceMapping[]> {
  const client = createLambdaClient(config);

  try {
    const command = new ListEventSourceMappingsCommand({
      FunctionName: params.functionName,
      EventSourceArn: params.eventSourceArn,
      MaxItems: params.maxItems,
      Marker: params.marker,
    });
    const response = await client.send(command);

    const mappings = response.EventSourceMappings || [];
    return mappings.map(mapEventSourceMapping);
  } finally {
    client.destroy();
  }
}

export async function getEventSourceMapping(
  uuid: string,
  config?: AwsClientConfig,
): Promise<EventSourceMapping | null> {
  const client = createLambdaClient(config);

  try {
    const command = new GetEventSourceMappingCommand({ UUID: uuid });
    const response = await client.send(command);
    return mapEventSourceMapping(response);
  } finally {
    client.destroy();
  }
}

export async function updateEventSourceMapping(
  uuid: string,
  updates: UpdateEventSourceMappingRequest,
  config?: AwsClientConfig,
): Promise<EventSourceMapping> {
  const client = createLambdaClient(config);

  try {
    const command = new UpdateEventSourceMappingCommand({
      UUID: uuid,
      Enabled: updates.enabled,
      BatchSize: updates.batchSize,
      MaximumBatchingWindowInSeconds: updates.maximumBatchingWindowInSeconds,
      FunctionResponseTypes: updates.functionResponseTypes as 'ReportBatchItemFailures'[] | undefined,
    });
    const response = await client.send(command);
    return mapEventSourceMapping(response);
  } finally {
    client.destroy();
  }
}

export async function deleteEventSourceMapping(uuid: string, config?: AwsClientConfig): Promise<void> {
  const client = createLambdaClient(config);

  try {
    const command = new DeleteEventSourceMappingCommand({ UUID: uuid });
    await client.send(command);
  } finally {
    client.destroy();
  }
}

export async function createEventSourceMapping(
  request: CreateEventSourceMappingRequest,
  config?: AwsClientConfig,
): Promise<EventSourceMapping> {
  const client = createLambdaClient(config);

  try {
    const command = new CreateEventSourceMappingCommand({
      EventSourceArn: request.eventSourceArn,
      FunctionName: request.functionName,
      Enabled: request.enabled ?? true,
      BatchSize: request.batchSize,
      MaximumBatchingWindowInSeconds: request.maximumBatchingWindowInSeconds,
      ParallelizationFactor: request.parallelizationFactor,
      FilterCriteria: request.filterCriteria
        ? { Filters: request.filterCriteria.filters.map((f) => ({ Pattern: f.pattern })) }
        : undefined,
    });
    const response = await client.send(command);
    return mapEventSourceMapping(response);
  } finally {
    client.destroy();
  }
}
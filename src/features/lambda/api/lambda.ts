import {
  ListFunctionsCommand,
  GetFunctionCommand,
  InvokeCommand,
  type FunctionConfiguration,
} from '@aws-sdk/client-lambda';

import { createLambdaClient, type AwsClientConfig } from '@/services/aws';
import type {
  LambdaFunction,
  InvocationRequest,
  InvocationResponse,
} from '../types/lambda';

export type { InvocationRequest };

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
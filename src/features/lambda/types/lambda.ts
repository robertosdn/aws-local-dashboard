export interface LambdaFunction {
  functionName: string;
  functionArn: string;
  runtime: string;
  handler: string;
  codeSize: number;
  description: string;
  timeout: number;
  memorySize: number;
  lastModified: string;
  codeSha256: string;
  version: string;
  vpcConfig?: VpcConfig;
  environment?: EnvironmentConfig;
  layers?: Layer[];
}

export interface VpcConfig {
  vpcId: string;
  subnetIds: string[];
  securityGroupIds: string[];
}

export interface EnvironmentConfig {
  variables: Record<string, string>;
}

export interface Layer {
  arn: string;
  codeSize: number;
}

export interface InvocationRequest {
  functionName: string;
  payload: string;
  invocationType?: 'RequestResponse' | 'Event' | 'DryRun';
  logType?: 'None' | 'Tail';
}

export interface InvocationResponse {
  statusCode: number;
  payload: string;
  logResult?: string;
  executedVersion?: string;
  functionError?: string;
}

export interface CreateFunctionRequest {
  functionName: string;
  runtime: string;
  handler: string;
  code: {
    zipFile?: Uint8Array;
    s3Bucket?: string;
    s3Key?: string;
    s3ObjectVersion?: string;
  };
  role: string;
  description?: string;
  timeout?: number;
  memorySize?: number;
  environment?: EnvironmentConfig;
  vpcConfig?: VpcConfig;
  layers?: string[];
}
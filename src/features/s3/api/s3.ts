import {
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetBucketEncryptionCommand,
  GetBucketLocationCommand,
  GetBucketVersioningCommand,
  GetPublicAccessBlockCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { createS3Client, type AwsClientConfig } from '@/services/aws';
import type { S3Bucket, S3BucketDetails, S3Object, S3ObjectPage } from '../types/s3';

function isMissingConfiguration(error: unknown, errorName: string): boolean {
  return error instanceof Error && error.name === errorName;
}

export async function getBucketDetails(
  bucket: S3Bucket,
  config?: AwsClientConfig,
): Promise<S3BucketDetails> {
  const client = createS3Client(config);

  try {
    const [location, versioning, encryption, publicAccess] = await Promise.all([
      client.send(new GetBucketLocationCommand({ Bucket: bucket.name })),
      client.send(new GetBucketVersioningCommand({ Bucket: bucket.name })),
      client
        .send(new GetBucketEncryptionCommand({ Bucket: bucket.name }))
        .catch((error: unknown) => {
          if (isMissingConfiguration(error, 'ServerSideEncryptionConfigurationNotFoundError')) {
            return undefined;
          }
          throw error;
        }),
      client
        .send(new GetPublicAccessBlockCommand({ Bucket: bucket.name }))
        .catch((error: unknown) => {
          if (isMissingConfiguration(error, 'NoSuchPublicAccessBlockConfiguration')) {
            return undefined;
          }
          throw error;
        }),
    ]);
    const locationConstraint = location.LocationConstraint;
    const encryptionAlgorithms =
      encryption?.ServerSideEncryptionConfiguration?.Rules?.flatMap((rule) => {
        const algorithm = rule.ApplyServerSideEncryptionByDefault?.SSEAlgorithm;
        return algorithm ? [algorithm] : [];
      }) ?? [];
    const access = publicAccess?.PublicAccessBlockConfiguration;

    return {
      ...bucket,
      region: locationConstraint === 'EU' ? 'eu-west-1' : locationConstraint || 'us-east-1',
      versioningStatus:
        versioning.Status === 'Enabled'
          ? 'Enabled'
          : versioning.Status === 'Suspended'
            ? 'Suspended'
            : 'Not enabled',
      encryptionAlgorithms,
      publicAccessBlock: access
        ? {
            blockPublicAcls: access.BlockPublicAcls ?? false,
            ignorePublicAcls: access.IgnorePublicAcls ?? false,
            blockPublicPolicy: access.BlockPublicPolicy ?? false,
            restrictPublicBuckets: access.RestrictPublicBuckets ?? false,
          }
        : null,
    };
  } finally {
    client.destroy();
  }
}

export async function listBuckets(config?: AwsClientConfig): Promise<S3Bucket[]> {
  const client = createS3Client(config);

  try {
    const response = await client.send(new ListBucketsCommand({}));
    return (response.Buckets ?? []).flatMap((bucket) =>
      bucket.Name ? [{ name: bucket.Name, creationDate: bucket.CreationDate }] : [],
    );
  } finally {
    client.destroy();
  }
}

export async function listBucketObjects(
  bucketName: string,
  continuationToken?: string,
  config?: AwsClientConfig,
): Promise<S3ObjectPage> {
  const client = createS3Client(config);

  try {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        MaxKeys: 100,
      }),
    );

    const objects: S3Object[] = (response.Contents ?? []).flatMap((object) =>
      object.Key
        ? [
            {
              key: object.Key,
              size: object.Size,
              lastModified: object.LastModified,
              etag: object.ETag,
              storageClass: object.StorageClass,
            },
          ]
        : [],
    );

    return {
      objects,
      nextContinuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated ?? false,
    };
  } finally {
    client.destroy();
  }
}

export async function deleteBucket(bucketName: string, config?: AwsClientConfig): Promise<void> {
  const client = createS3Client(config);

  try {
    await client.send(new DeleteBucketCommand({ Bucket: bucketName }));
  } finally {
    client.destroy();
  }
}

export async function deleteObject(
  bucketName: string,
  key: string,
  config?: AwsClientConfig,
): Promise<void> {
  const client = createS3Client(config);

  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
  } finally {
    client.destroy();
  }
}

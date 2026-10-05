import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('@/services/aws', () => ({
  createS3Client: vi.fn(() => ({ send: mocks.send, destroy: mocks.destroy })),
}));

import {
  deleteBucket,
  deleteObject,
  getBucketDetails,
  listBucketObjects,
  listBuckets,
} from '@/features/s3/api/s3';

describe('S3 API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof ListBucketsCommand) {
        return {
          Buckets: [{ Name: 'samples', CreationDate: new Date('2024-01-01T00:00:00Z') }, {}],
        };
      }
      if (command instanceof ListObjectsV2Command) {
        return {
          Contents: [
            {
              Key: 'nested/sample.json',
              Size: 42,
              LastModified: new Date('2024-02-01T00:00:00Z'),
              ETag: '"etag"',
              StorageClass: 'STANDARD',
            },
            { Size: 2 },
          ],
          NextContinuationToken: 'next-page',
          IsTruncated: true,
        };
      }
      if (command instanceof GetBucketLocationCommand) {
        return { LocationConstraint: 'eu-west-1' };
      }
      if (command instanceof GetBucketVersioningCommand) {
        return { Status: 'Enabled' };
      }
      if (command instanceof GetBucketEncryptionCommand) {
        return {
          ServerSideEncryptionConfiguration: {
            Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }],
          },
        };
      }
      if (command instanceof GetPublicAccessBlockCommand) {
        return {
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            IgnorePublicAcls: true,
            BlockPublicPolicy: false,
            RestrictPublicBuckets: false,
          },
        };
      }
      return {};
    });
  });

  it('maps bucket names and creation dates and always destroys the client', async () => {
    await expect(
      listBuckets({ endpoint: 'http://localhost:4566', region: 'us-east-1' }),
    ).resolves.toEqual([{ name: 'samples', creationDate: new Date('2024-01-01T00:00:00Z') }]);
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(ListBucketsCommand);
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('lists one bounded page of metadata while preserving exact object keys', async () => {
    const result = await listBucketObjects('samples', 'previous-token');

    const command = mocks.send.mock.calls[0][0] as ListObjectsV2Command;
    expect(command).toBeInstanceOf(ListObjectsV2Command);
    expect(command.input).toMatchObject({
      Bucket: 'samples',
      ContinuationToken: 'previous-token',
      MaxKeys: 100,
    });
    expect(result).toEqual({
      objects: [
        {
          key: 'nested/sample.json',
          size: 42,
          lastModified: new Date('2024-02-01T00:00:00Z'),
          etag: '"etag"',
          storageClass: 'STANDARD',
        },
      ],
      nextContinuationToken: 'next-page',
      isTruncated: true,
    });
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('loads bucket location, versioning, encryption, and public access settings', async () => {
    const result = await getBucketDetails(
      { name: 'samples', creationDate: new Date('2024-01-01T00:00:00Z') },
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
    );

    expect(result).toEqual({
      name: 'samples',
      creationDate: new Date('2024-01-01T00:00:00Z'),
      region: 'eu-west-1',
      versioningStatus: 'Enabled',
      encryptionAlgorithms: ['AES256'],
      publicAccessBlock: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      },
    });
    expect(mocks.send.mock.calls.map(([command]) => command)).toEqual(
      expect.arrayContaining([
        expect.any(GetBucketLocationCommand),
        expect.any(GetBucketVersioningCommand),
        expect.any(GetBucketEncryptionCommand),
        expect.any(GetPublicAccessBlockCommand),
      ]),
    );
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });

  it('reports absent optional bucket configurations and surfaces other request failures', async () => {
    mocks.send.mockImplementation(async (command: unknown) => {
      if (command instanceof GetBucketEncryptionCommand) {
        throw Object.assign(new Error('No encryption configuration'), {
          name: 'ServerSideEncryptionConfigurationNotFoundError',
        });
      }
      if (command instanceof GetPublicAccessBlockCommand) {
        throw Object.assign(new Error('No public access block'), {
          name: 'NoSuchPublicAccessBlockConfiguration',
        });
      }
      if (command instanceof GetBucketLocationCommand) return {};
      if (command instanceof GetBucketVersioningCommand) return {};
      return {};
    });

    await expect(getBucketDetails({ name: 'samples' })).resolves.toMatchObject({
      region: 'us-east-1',
      versioningStatus: 'Not enabled',
      encryptionAlgorithms: [],
      publicAccessBlock: null,
    });

    mocks.send.mockRejectedValueOnce(new Error('S3 endpoint does not support configuration'));
    await expect(getBucketDetails({ name: 'samples' })).rejects.toThrow(
      'S3 endpoint does not support configuration',
    );
    expect(mocks.destroy).toHaveBeenCalledTimes(2);
  });

  it('deletes only the specified bucket or exact object key', async () => {
    await deleteBucket('empty-samples');
    await deleteObject('samples', 'nested/sample.json');

    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(DeleteBucketCommand);
    expect((mocks.send.mock.calls[0][0] as DeleteBucketCommand).input.Bucket).toBe('empty-samples');
    expect(mocks.send.mock.calls[1][0]).toBeInstanceOf(DeleteObjectCommand);
    expect((mocks.send.mock.calls[1][0] as DeleteObjectCommand).input).toEqual({
      Bucket: 'samples',
      Key: 'nested/sample.json',
    });
    expect(mocks.destroy).toHaveBeenCalledTimes(2);
  });

  it('surfaces request failures and destroys the client', async () => {
    mocks.send.mockRejectedValueOnce(new Error('S3 unavailable'));

    await expect(listBuckets()).rejects.toThrow('S3 unavailable');
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
});

// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteBucket,
  deleteObject,
  getBucketDetails,
  listBucketObjects,
  listBuckets,
} from '@/features/s3/api/s3';
import { useBucketDetails } from '@/features/s3/hooks/useBuckets';
import { useBucketObjects } from '@/features/s3/hooks/useBucketObjects';
import { useBuckets } from '@/features/s3/hooks/useBuckets';
import { useDeleteBucket } from '@/features/s3/hooks/useDeleteBucket';
import { useDeleteObject } from '@/features/s3/hooks/useDeleteObject';

const settingsMock = vi.hoisted(() => ({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
}));

vi.mock('@/features/settings/hooks/useSettings', () => ({
  useSettings: () => ({
    endpoint: settingsMock.endpoint,
    settings: {
      host: 'localhost',
      port: 4566,
      region: settingsMock.region,
      useHttps: false,
    },
  }),
}));

vi.mock('@/features/s3/api/s3', () => ({
  deleteBucket: vi.fn(),
  deleteObject: vi.fn(),
  getBucketDetails: vi.fn(),
  listBucketObjects: vi.fn(),
  listBuckets: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe('S3 hooks', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    settingsMock.endpoint = 'http://localhost:4566';
    settingsMock.region = 'us-east-1';
    vi.mocked(listBuckets).mockResolvedValue([]);
    vi.mocked(getBucketDetails).mockResolvedValue({
      name: 'samples',
      region: 'us-east-1',
      versioningStatus: 'Not enabled',
      encryptionAlgorithms: [],
      publicAccessBlock: null,
    });
    vi.mocked(listBucketObjects).mockResolvedValue({ objects: [], isTruncated: false });
    vi.mocked(deleteBucket).mockResolvedValue();
    vi.mocked(deleteObject).mockResolvedValue();
  });

  it('loads bucket objects only after a bucket is selected and keys by pagination token', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useBucketObjects(null), { wrapper });
    expect(listBucketObjects).not.toHaveBeenCalled();

    const { result } = renderHook(() => useBucketObjects('samples', 'continuation-token'), {
      wrapper,
    });
    await waitFor(() => expect(listBucketObjects).toHaveBeenCalledOnce());
    expect(listBucketObjects).toHaveBeenCalledWith('samples', 'continuation-token', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
    expect(result.current.error).toBeNull();
  });

  it('includes endpoint and region in bucket query calls and exposes request errors', async () => {
    vi.mocked(listBuckets).mockRejectedValueOnce(new Error('List failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBuckets(), { wrapper });

    await waitFor(() => expect(result.current.error).toMatchObject({ message: 'List failed' }));
    expect(listBuckets).toHaveBeenCalledWith({
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
  });

  it('loads bucket configuration only after View is selected and exposes failures', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useBucketDetails(null), { wrapper });
    expect(getBucketDetails).not.toHaveBeenCalled();

    const { result } = renderHook(
      () => useBucketDetails({ name: 'samples', creationDate: new Date('2024-01-01') }),
      { wrapper },
    );
    await waitFor(() => expect(getBucketDetails).toHaveBeenCalledOnce());
    expect(getBucketDetails).toHaveBeenCalledWith(
      { name: 'samples', creationDate: new Date('2024-01-01') },
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
    );
    expect(result.current.error).toBeNull();

    vi.mocked(getBucketDetails).mockRejectedValueOnce(
      new Error('Bucket configuration unavailable'),
    );
    const failedDetails = renderHook(
      () => useBucketDetails({ name: 'failed-samples' }),
      { wrapper },
    );
    await waitFor(() =>
      expect(failedDetails.result.current.error).toMatchObject({
        message: 'Bucket configuration unavailable',
      }),
    );
  });

  it('refetches bucket data when the active endpoint or region changes', async () => {
    const { wrapper } = createWrapper();
    const { rerender } = renderHook(() => useBuckets(), { wrapper });
    await waitFor(() => expect(listBuckets).toHaveBeenCalledOnce());

    settingsMock.endpoint = 'http://localhost:4572';
    settingsMock.region = 'eu-west-1';
    rerender();

    await waitFor(() => expect(listBuckets).toHaveBeenCalledTimes(2));
    expect(listBuckets).toHaveBeenLastCalledWith({
      endpoint: 'http://localhost:4572',
      region: 'eu-west-1',
    });
  });

  it('exposes object-list errors and allows retry through the query result', async () => {
    vi.mocked(listBucketObjects)
      .mockRejectedValueOnce(new Error('Object listing failed'))
      .mockResolvedValueOnce({ objects: [], isTruncated: false });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBucketObjects('samples'), { wrapper });

    await waitFor(() =>
      expect(result.current.error).toMatchObject({ message: 'Object listing failed' }),
    );
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(listBucketObjects).toHaveBeenCalledTimes(2);
  });

  it('invalidates bucket and object data after successful deletion', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const bucketHook = renderHook(() => useDeleteBucket(), { wrapper });
    const objectHook = renderHook(() => useDeleteObject(), { wrapper });

    await act(async () => {
      await bucketHook.result.current.deleteBucket({ bucketName: 'samples' });
      await objectHook.result.current.deleteObject({
        bucketName: 'samples',
        key: 'nested/sample.json',
      });
    });

    expect(deleteBucket).toHaveBeenCalledWith('samples', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
    expect(deleteObject).toHaveBeenCalledWith('samples', 'nested/sample.json', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['s3', 'buckets'] });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['s3', 'objects', 'http://localhost:4566', 'us-east-1', 'samples'],
    });
  });
});

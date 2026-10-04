import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getBucketDetails, listBuckets } from '../api/s3';
import type { S3Bucket } from '../types/s3';

const BUCKETS_QUERY_KEY = ['s3', 'buckets'];

export function useBuckets() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [...BUCKETS_QUERY_KEY, endpoint, settings.region];
  const query = useQuery({
    queryKey,
    queryFn: () => listBuckets({ endpoint, region: settings.region }),
    staleTime: 30_000,
  });

  return {
    buckets: query.data ?? [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey: BUCKETS_QUERY_KEY }),
  };
}

export function useBucketDetails(bucket: S3Bucket | null) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = ['s3', 'bucket-details', endpoint, settings.region, bucket?.name];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!bucket) throw new Error('No S3 bucket selected');
      return getBucketDetails(bucket, { endpoint, region: settings.region });
    },
    enabled: Boolean(bucket),
    staleTime: 30_000,
  });

  return {
    bucketDetails: query.data,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}

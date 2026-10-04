import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { listBucketObjects } from '../api/s3';

export function useBucketObjects(bucketName: string | null, continuationToken?: string) {
  const { endpoint, settings } = useSettings();
  const query = useQuery({
    queryKey: ['s3', 'objects', endpoint, settings.region, bucketName, continuationToken],
    queryFn: () =>
      listBucketObjects(bucketName!, continuationToken, {
        endpoint,
        region: settings.region,
      }),
    enabled: Boolean(bucketName),
    staleTime: 30_000,
  });

  return {
    objects: query.data?.objects ?? [],
    nextContinuationToken: query.data?.nextContinuationToken,
    isTruncated: query.data?.isTruncated ?? false,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

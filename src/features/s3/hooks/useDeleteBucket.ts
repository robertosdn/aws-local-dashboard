import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { deleteBucket } from '../api/s3';
import type { DeleteBucketInput } from '../types/s3';

export function useDeleteBucket() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: ({ bucketName }: DeleteBucketInput) =>
      deleteBucket(bucketName, { endpoint, region: settings.region }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['s3', 'buckets'] }),
  });

  return {
    deleteBucket: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}

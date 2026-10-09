import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { deleteObject } from '../api/s3';
import type { DeleteObjectInput } from '../types/s3';

export function useDeleteObject() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: ({ bucketName, key }: DeleteObjectInput) =>
      deleteObject(bucketName, key, { endpoint, region: settings.region }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ['s3', 'objects', endpoint, settings.region, variables.bucketName],
      }),
  });

  return {
    deleteObject: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}

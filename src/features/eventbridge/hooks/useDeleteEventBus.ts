import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { deleteEventBus } from '../api/eventbridge';
import type { DeleteEventBusInput } from '../types/eventbridge';

export function useDeleteEventBus() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: ({ name }: DeleteEventBusInput) =>
      deleteEventBus(name, { endpoint, region: settings.region }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventbridge', 'eventbuses'] }),
  });

  return {
    deleteEventBus: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}

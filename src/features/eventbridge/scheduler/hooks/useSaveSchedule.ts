import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { saveSchedule } from '../api/scheduler';
import type { SaveScheduleInput } from '../types/scheduler';

export function useSaveSchedule(groupName: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: (input: SaveScheduleInput) =>
      saveSchedule(input, { endpoint, region: settings.region }),
    retry: false,
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: ['scheduler', 'schedules', endpoint, settings.region, groupName],
      });
      await queryClient.invalidateQueries({
        queryKey: [
          'scheduler',
          'schedule',
          endpoint,
          settings.region,
          groupName,
          input.originalName ?? input.values.name,
        ],
      });
    },
  });

  return { saveSchedule: mutation.mutateAsync, pending: mutation.isPending, error: mutation.error };
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { deleteRule } from '../api/eventbridge';
import type { DeleteRuleInput } from '../types/eventbridge';

export function useDeleteRule(eventBusName: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: (input: DeleteRuleInput) =>
      deleteRule(input, { endpoint, region: settings.region }),
    retry: false,
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: ['eventbridge', 'eventbus', endpoint, settings.region, eventBusName, 'rules'],
      });
      await queryClient.invalidateQueries({
        queryKey: [
          'eventbridge',
          'eventbus',
          endpoint,
          settings.region,
          eventBusName,
          'targets',
          input.ruleName,
        ],
      });
    },
  });
  return { deleteRule: mutation.mutateAsync, pending: mutation.isPending, error: mutation.error };
}

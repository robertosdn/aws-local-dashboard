import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { saveRule } from '../api/eventbridge';
import type { SaveRuleInput } from '../types/eventbridge';

export function useSaveRule(eventBusName: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: (input: SaveRuleInput) => saveRule(input, { endpoint, region: settings.region }),
    retry: false,
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: ['eventbridge', 'eventbus', endpoint, settings.region, eventBusName, 'rules'],
      });
      await Promise.all(
        [...new Set([input.values.name, input.originalName].filter(Boolean)).values()].map(
          (ruleName) =>
            queryClient.invalidateQueries({
              queryKey: [
                'eventbridge',
                'eventbus',
                endpoint,
                settings.region,
                eventBusName,
                'targets',
                ruleName,
              ],
            }),
        ),
      );
    },
  });
  return { saveRule: mutation.mutateAsync, pending: mutation.isPending, error: mutation.error };
}

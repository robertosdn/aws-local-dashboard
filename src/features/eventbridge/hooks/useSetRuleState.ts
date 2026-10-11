import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { setRuleState } from '../api/eventbridge';
import type { SetRuleStateInput } from '../types/eventbridge';

export function useSetRuleState(eventBusName: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: (input: SetRuleStateInput) =>
      setRuleState(input, { endpoint, region: settings.region }),
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['eventbridge', 'eventbus', endpoint, settings.region, eventBusName, 'rules'],
      }),
  });
  return { setRuleState: mutation.mutateAsync, pending: mutation.isPending, error: mutation.error };
}

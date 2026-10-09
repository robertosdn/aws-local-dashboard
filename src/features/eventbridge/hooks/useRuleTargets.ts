import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { listTargetsByRule } from '../api/eventbridge';

export function useRuleTargets(eventBusName: string | null, ruleName: string | null) {
  const { endpoint, settings } = useSettings();
  const query = useQuery({
    queryKey: [
      'eventbridge',
      'eventbus',
      endpoint,
      settings.region,
      eventBusName,
      'targets',
      ruleName,
    ],
    queryFn: () => {
      if (!eventBusName || !ruleName) throw new Error('No rule selected');
      return listTargetsByRule(ruleName, eventBusName, { endpoint, region: settings.region });
    },
    enabled: Boolean(eventBusName && ruleName),
    staleTime: 30_000,
  });

  return {
    targets: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
  };
}

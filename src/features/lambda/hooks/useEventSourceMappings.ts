import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  listEventSourceMappings,
  updateEventSourceMapping,
  deleteEventSourceMapping,
  createEventSourceMapping,
  getQueueInfoFromArn,
} from '../api';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { ListEventSourceMappingsParams, UpdateEventSourceMappingRequest, CreateEventSourceMappingRequest } from '../types';

const EVENT_SOURCE_MAPPINGS_QUERY_KEY = ['lambda', 'event-source-mappings'];
const SQS_QUEUE_INFO_QUERY_KEY = ['sqs', 'queue-info'];

export function useEventSourceMappings(params?: ListEventSourceMappingsParams) {
  const { endpoint, settings } = useSettings();
  const queryKey = [...EVENT_SOURCE_MAPPINGS_QUERY_KEY, params?.functionName, params?.eventSourceArn, endpoint, settings.region];

  return useQuery({
    queryKey,
    queryFn: () => listEventSourceMappings(params || {}, { endpoint, region: settings.region }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSQSQueueInfo(queueArn: string | null) {
  const { endpoint, settings } = useSettings();
  const queryKey = [...SQS_QUEUE_INFO_QUERY_KEY, queueArn, endpoint, settings.region];

  return useQuery({
    queryKey,
    queryFn: () => (queueArn ? getQueueInfoFromArn(queueArn, { endpoint, region: settings.region }) : Promise.resolve(null)),
    enabled: !!queueArn,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useUpdateEventSourceMapping() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  return useMutation({
    mutationFn: ({ uuid, updates }: { uuid: string; updates: UpdateEventSourceMappingRequest }) =>
      updateEventSourceMapping(uuid, updates, { endpoint, region: settings.region }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_SOURCE_MAPPINGS_QUERY_KEY });
    },
  });
}

export function useDeleteEventSourceMapping() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  return useMutation({
    mutationFn: (uuid: string) => deleteEventSourceMapping(uuid, { endpoint, region: settings.region }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_SOURCE_MAPPINGS_QUERY_KEY });
    },
  });
}

export function useCreateEventSourceMapping() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  return useMutation({
    mutationFn: (request: CreateEventSourceMappingRequest) =>
      createEventSourceMapping(request, { endpoint, region: settings.region }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_SOURCE_MAPPINGS_QUERY_KEY });
    },
  });
}
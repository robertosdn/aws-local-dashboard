import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendMessage } from '../api/sqs';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { SendMessageOptions } from '../types/sqs';

export interface SendMessageVariables {
  queueUrl: string;
  body: string;
  options?: SendMessageOptions;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const mutation = useMutation({
    mutationFn: ({ queueUrl, body, options }: SendMessageVariables) =>
      sendMessage(queueUrl, body, { endpoint, region: settings.region }, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sqs'] });
    },
  });

  return {
    send: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}

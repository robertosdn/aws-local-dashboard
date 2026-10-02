import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

import { invokeFunction, type InvocationRequest } from '../api/lambda';
import { useSettings } from '@/features/settings/hooks/useSettings';

export function useInvokeFunction() {
  const { endpoint, settings } = useSettings();

  return useMutation({
    mutationFn: (request: InvocationRequest) =>
      invokeFunction(request, { endpoint, region: settings.region }),
    onSuccess: (data) => {
      if (data.functionError) {
        toast({
          title: 'Function error',
          description: data.functionError,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Invocation successful',
          description: `Status: ${data.statusCode}`,
          variant: 'success',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Invocation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
}
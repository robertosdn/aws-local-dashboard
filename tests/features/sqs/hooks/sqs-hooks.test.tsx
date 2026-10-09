// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getQueueDetails, sendMessage } from '@/features/sqs/api/sqs';
import { useQueueDetails } from '@/features/sqs/hooks/useQueueDetails';
import { useSendMessage } from '@/features/sqs/hooks/useSendMessage';

vi.mock('@/features/settings/hooks/useSettings', () => ({
  useSettings: () => ({
    endpoint: 'http://localhost:4566',
    settings: { host: 'localhost', port: 4566, region: 'us-east-1', useHttps: false },
  }),
}));

vi.mock('@/features/sqs/api/sqs', () => ({
  sendMessage: vi.fn(),
  getQueueDetails: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe('SQS hooks', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendMessage).mockResolvedValue({ messageId: 'msg-1' });
  });

  it('sends a message with the configured settings and invalidates SQS queries', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSendMessage(), { wrapper });

    await act(async () => {
      await result.current.send({
        queueUrl: 'http://localhost:4566/000000000000/dashboard-standalone-queue',
        body: 'hello',
        options: {
          messageAttributes: { source: { dataType: 'String', stringValue: 'dashboard' } },
        },
      });
    });

    expect(sendMessage).toHaveBeenCalledWith(
      'http://localhost:4566/000000000000/dashboard-standalone-queue',
      'hello',
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
      { messageAttributes: { source: { dataType: 'String', stringValue: 'dashboard' } } },
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['sqs'] });
  });

  it('exposes the error when sending fails', async () => {
    vi.mocked(sendMessage).mockRejectedValueOnce(new Error('boom'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSendMessage(), { wrapper });

    await act(async () => {
      await expect(
        result.current.send({ queueUrl: 'http://localhost:4566/q', body: 'x' }),
      ).rejects.toThrow('boom');
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('keeps queue details disabled until a queue URL is supplied', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useQueueDetails(null), { wrapper });

    expect(getQueueDetails).not.toHaveBeenCalled();
  });

  it('loads queue details with the configured settings', async () => {
    vi.mocked(getQueueDetails).mockResolvedValue({
      url: 'http://localhost:4566/000000000000/dashboard-standalone-queue',
      name: 'dashboard-standalone-queue',
      attributes: { QueueArn: 'arn:aws:sqs:us-east-1:000000000000:dashboard-standalone-queue' },
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useQueueDetails('http://localhost:4566/000000000000/dashboard-standalone-queue'),
      { wrapper },
    );

    await waitFor(() => expect(result.current.details).toBeDefined());

    expect(getQueueDetails).toHaveBeenCalledWith(
      'http://localhost:4566/000000000000/dashboard-standalone-queue',
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
    );
    expect(result.current.details?.attributes.QueueArn).toBe(
      'arn:aws:sqs:us-east-1:000000000000:dashboard-standalone-queue',
    );
  });

  it('surfaces an error when queue details fail to load', async () => {
    vi.mocked(getQueueDetails).mockRejectedValueOnce(new Error('denied'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useQueueDetails('http://localhost:4566/000000000000/dashboard-standalone-queue'),
      { wrapper },
    );

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  useQueues: vi.fn(),
  usePurgeQueue: vi.fn(),
  useSendMessage: vi.fn(),
  useInvalidateQueues: vi.fn(),
}));

vi.mock('@/features/sqs/hooks', () => ({
  useQueues: hooks.useQueues,
  usePurgeQueue: hooks.usePurgeQueue,
  useSendMessage: hooks.useSendMessage,
  useInvalidateQueues: hooks.useInvalidateQueues,
}));

vi.mock('@/features/sqs/components/MessageViewer', () => ({
  MessageViewer: () => null,
}));

vi.mock('@/features/sqs/components/QueueDetailsDialog', () => ({
  QueueDetailsDialog: ({ queue }: { queue: { name: string } | null }) =>
    queue ? <div>Details dialog for {queue.name}</div> : null,
}));

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/use-toast', () => ({ toast }));

import QueuesPage from '@/pages/QueuesPage';

const queue = {
  url: 'http://localhost:4566/000000000000/dashboard-standalone-queue',
  name: 'dashboard-standalone-queue',
  attributes: {
    ApproximateNumberOfMessages: '0',
    ApproximateNumberOfMessagesNotVisible: '0',
    ApproximateNumberOfMessagesDelayed: '0',
  },
};

describe('QueuesPage send message', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    hooks.useQueues.mockReturnValue({
      queues: [queue],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.usePurgeQueue.mockReturnValue({ purge: vi.fn(), pending: false });
    hooks.useInvalidateQueues.mockReturnValue(vi.fn());
  });

  it('opens the details dialog for the selected queue', () => {
    hooks.useSendMessage.mockReturnValue({ send: vi.fn(), pending: false });

    render(<QueuesPage />);

    fireEvent.click(screen.getByRole('button', { name: `View details for ${queue.name}` }));

    expect(screen.getByText(`Details dialog for ${queue.name}`)).toBeTruthy();
  });

  it('opens the dialog for the selected queue and toasts the returned message id', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'msg-1' });
    hooks.useSendMessage.mockReturnValue({ send, pending: false });

    render(<QueuesPage />);

    fireEvent.click(screen.getByRole('button', { name: `Send message to ${queue.name}` }));
    expect(screen.getByText(`Publish a message to ${queue.name}`)).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Message body'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    expect(send).toHaveBeenCalledWith({ queueUrl: queue.url, body: 'hello', options: undefined });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Message sent', variant: 'success' }),
    );
  });

  it('surfaces a destructive toast and keeps the dialog open when sending fails', async () => {
    const send = vi.fn().mockRejectedValue(new Error('Queue does not exist'));
    hooks.useSendMessage.mockReturnValue({ send, pending: false });

    render(<QueuesPage />);

    fireEvent.click(screen.getByRole('button', { name: `Send message to ${queue.name}` }));
    fireEvent.change(screen.getByLabelText('Message body'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Failed to send message', variant: 'destructive' }),
      ),
    );
    expect((screen.getByLabelText('Message body') as HTMLTextAreaElement).value).toBe('hello');
  });
});

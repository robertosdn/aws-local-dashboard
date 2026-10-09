// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QueueRow } from '@/features/sqs/components/QueueRow';
import { SendMessageDialog } from '@/features/sqs/components/SendMessageDialog';
import { QueueDetailsDialog } from '@/features/sqs/components/QueueDetailsDialog';
import type { SQSQueue } from '@/features/sqs/types/sqs';

const useQueueDetails = vi.hoisted(() => vi.fn());

vi.mock('@/features/sqs/hooks/useQueueDetails', () => ({ useQueueDetails }));

const queue: SQSQueue = {
  url: 'http://localhost:4566/000000000000/dashboard-standalone-queue',
  name: 'dashboard-standalone-queue',
  attributes: {
    ApproximateNumberOfMessages: '0',
    ApproximateNumberOfMessagesNotVisible: '0',
    ApproximateNumberOfMessagesDelayed: '0',
  },
};

describe('SQS components', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    useQueueDetails.mockReturnValue({
      details: undefined,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('exposes details and send actions on the queue row', () => {
    const onViewDetails = vi.fn();
    const onSendMessage = vi.fn();
    const onViewMessages = vi.fn();
    const onPurge = vi.fn();

    render(
      <table>
        <tbody>
          <QueueRow
            queue={queue}
            onViewDetails={onViewDetails}
            onViewMessages={onViewMessages}
            onSendMessage={onSendMessage}
            onPurge={onPurge}
          />
        </tbody>
      </table>,
    );

    fireEvent.click(screen.getByRole('button', { name: `View details for ${queue.name}` }));
    fireEvent.click(screen.getByRole('button', { name: `Send message to ${queue.name}` }));

    expect(onViewDetails).toHaveBeenCalledWith(queue);
    expect(onSendMessage).toHaveBeenCalledWith(queue);
  });

  it('renders queue details with formatted labels, timestamps, and JSON attributes', () => {
    useQueueDetails.mockReturnValue({
      details: {
        url: queue.url,
        name: queue.name,
        attributes: {
          QueueArn: 'arn:aws:sqs:us-east-1:000000000000:dashboard-standalone-queue',
          CreatedTimestamp: '1700000000',
          VisibilityTimeout: '30',
          RedrivePolicy: '{"deadLetterTargetArn":"arn:aws:sqs:dlq","maxReceiveCount":"5"}',
        },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<QueueDetailsDialog open onOpenChange={vi.fn()} queue={queue} />);

    expect(screen.getByRole('heading', { name: queue.name })).toBeTruthy();
    expect(screen.getByText(queue.url)).toBeTruthy();
    expect(screen.getByText('Queue Arn')).toBeTruthy();
    expect(
      screen.getByText('arn:aws:sqs:us-east-1:000000000000:dashboard-standalone-queue'),
    ).toBeTruthy();
    expect(screen.getByText('Created Timestamp')).toBeTruthy();
    expect(screen.getByText('Visibility Timeout')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText(/"deadLetterTargetArn"/)).toBeTruthy();
  });

  it('shows a retryable error state when queue details fail to load', () => {
    const refetch = vi.fn();
    useQueueDetails.mockReturnValue({
      details: undefined,
      loading: false,
      error: new Error('Access denied'),
      refetch,
    });

    render(<QueueDetailsDialog open onOpenChange={vi.fn()} queue={queue} />);

    expect(screen.getByText('Failed to load queue details')).toBeTruthy();
    expect(screen.getByText('Access denied')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('rejects an empty message body without sending', () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        queue={queue}
        onSend={onSend}
        pending={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('Message body is required')).toBeTruthy();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('rejects an attribute row that is missing a value', () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        queue={queue}
        onSend={onSend}
        pending={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Message body'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));
    fireEvent.change(screen.getByLabelText('Attribute key'), { target: { value: 'source' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('Each attribute needs a key and a value')).toBeTruthy();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('rejects duplicate attribute keys', () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        queue={queue}
        onSend={onSend}
        pending={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Message body'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));

    const keys = screen.getAllByLabelText('Attribute key');
    const values = screen.getAllByLabelText('Attribute value');
    fireEvent.change(keys[0], { target: { value: 'source' } });
    fireEvent.change(values[0], { target: { value: 'dashboard' } });
    fireEvent.change(keys[1], { target: { value: 'source' } });
    fireEvent.change(values[1], { target: { value: 'other' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('Attribute keys must be unique')).toBeTruthy();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('submits the body and string attributes and clears the form on success', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        queue={queue}
        onSend={onSend}
        pending={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Message body'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));
    fireEvent.change(screen.getByLabelText('Attribute key'), { target: { value: 'source' } });
    fireEvent.change(screen.getByLabelText('Attribute value'), { target: { value: 'dashboard' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));

    expect(onSend).toHaveBeenCalledWith({
      queueUrl: queue.url,
      body: 'hello',
      options: {
        messageAttributes: { source: { dataType: 'String', stringValue: 'dashboard' } },
      },
    });

    await waitFor(() =>
      expect((screen.getByLabelText('Message body') as HTMLTextAreaElement).value).toBe(''),
    );
    expect(screen.queryByLabelText('Attribute key')).toBeNull();
  });

  it('keeps the entered content when sending fails', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('boom'));

    render(
      <SendMessageDialog
        open
        onOpenChange={vi.fn()}
        queue={queue}
        onSend={onSend}
        pending={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Message body'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));
    expect((screen.getByLabelText('Message body') as HTMLTextAreaElement).value).toBe('hello');
  });
});

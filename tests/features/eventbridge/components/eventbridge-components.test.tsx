// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeBlock } from '@/components/ui/code-block';
import { DeleteEventBusDialog } from '@/features/eventbridge/components/DeleteEventBusDialog';
import { EventBusDetails } from '@/features/eventbridge/components/EventBusDetails';
import { EventBusPolicyDisplay } from '@/features/eventbridge/components/EventBusPolicyDisplay';
import { EventBusTable } from '@/features/eventbridge/components/EventBusTable';
import { RuleList } from '@/features/eventbridge/components/RuleList';

const targetMocks = vi.hoisted(() => ({
  useRuleTargets: vi.fn(),
}));

vi.mock('@/features/eventbridge/hooks/useRuleTargets', () => ({
  useRuleTargets: targetMocks.useRuleTargets,
}));

describe('EventBridge components', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders event buses and offers View/Delete only for custom buses', () => {
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(
      <EventBusTable
        eventBuses={[
          { name: 'default', arn: 'arn:default', createdAt: new Date('2024-01-01T00:00:00Z') },
          { name: 'orders', arn: 'arn:orders' },
        ]}
        loading={false}
        onViewEventBus={onView}
        onDeleteEventBus={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View details for orders' }));
    expect(onView).toHaveBeenCalledWith('orders');

    fireEvent.click(screen.getByRole('button', { name: 'Delete event bus orders' }));
    expect(onDelete).toHaveBeenCalledWith('orders');

    expect(screen.queryByRole('button', { name: 'Delete event bus default' })).toBeNull();
  });

  it('shows an empty state when no event buses exist', () => {
    render(
      <EventBusTable
        eventBuses={[]}
        loading={false}
        onViewEventBus={vi.fn()}
        onDeleteEventBus={vi.fn()}
      />,
    );

    expect(screen.getByText('No event buses found')).toBeTruthy();
  });

  it('shows event bus metadata and its policy', () => {
    render(
      <EventBusDetails
        loading={false}
        onBack={vi.fn()}
        eventBusDetails={{
          name: 'orders',
          arn: 'arn:aws:events:us-east-1:000000000000:event-bus/orders',
          description: 'Orders bus',
          policy: '{"Version":"2012-10-17"}',
          createdAt: new Date('2024-02-01T00:00:00Z'),
          rules: [],
        }}
      />,
    );

    expect(screen.getAllByText('orders').length).toBeGreaterThan(0);
    expect(screen.getByText('Orders bus')).toBeTruthy();
    expect(screen.getByText(/"Version": "2012-10-17"/)).toBeTruthy();
  });

  it('reports a missing policy instead of rendering an empty block', () => {
    render(<EventBusPolicyDisplay />);
    expect(screen.getByText('No policy is configured for this event bus.')).toBeTruthy();
  });

  it('warns when a policy is not valid JSON', () => {
    render(<EventBusPolicyDisplay policy="not-json" />);
    expect(screen.getByText('Invalid JSON — showing the raw value.')).toBeTruthy();
    expect(screen.getByText('not-json')).toBeTruthy();
  });

  it('formats JSON values and flags invalid input in the CodeBlock primitive', () => {
    render(<CodeBlock value={{ b: 1, a: 2 }} />);
    expect(screen.getByText(/"a": 2/)).toBeTruthy();
  });

  it('renders rules with state, event pattern, and targets and exposes pagination', () => {
    targetMocks.useRuleTargets.mockReturnValue({
      targets: [{ id: 'target-1', arn: 'arn:aws:sqs:us-east-1:000000000000:orders-queue' }],
      loading: false,
      error: null,
    });

    const onLoadMore = vi.fn();
    render(
      <RuleList
        eventBusName="orders"
        rules={[
          {
            name: 'orders-rule',
            arn: 'arn:rule',
            eventBusName: 'orders',
            state: 'ENABLED',
            eventPattern: '{"source":["app.orders"]}',
            targets: [],
          },
        ]}
        loading={false}
        error={null}
        hasNextPage
        onLoadMore={onLoadMore}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('orders-rule')).toBeTruthy();
    expect(screen.getByText('ENABLED')).toBeTruthy();
    expect(screen.getByText(/"source":/)).toBeTruthy();
    expect(screen.getByText('arn:aws:sqs:us-east-1:000000000000:orders-queue')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Load more rules' }));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it('shows empty and error states for rules', () => {
    targetMocks.useRuleTargets.mockReturnValue({ targets: [], loading: false, error: null });
    const onRetry = vi.fn();
    render(
      <RuleList
        eventBusName="orders"
        rules={[]}
        loading={false}
        error={null}
        hasNextPage={false}
        onLoadMore={vi.fn()}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText('No rules on this event bus')).toBeTruthy();

    cleanup();
    render(
      <RuleList
        eventBusName="orders"
        rules={[]}
        loading={false}
        error={new Error('Rules unavailable')}
        hasNextPage={false}
        onLoadMore={vi.fn()}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText('Rules unavailable')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('warns about permanence and confirms deletion', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DeleteEventBusDialog
        eventBusName="orders"
        pending={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByText(
        'This permanently deletes the event bus and all of its rules. This action cannot be undone.',
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

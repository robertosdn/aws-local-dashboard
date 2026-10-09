// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScheduleExpressionDisplay } from '@/features/eventbridge/scheduler/components/ScheduleExpressionDisplay';
import { ScheduleGroupDetails } from '@/features/eventbridge/scheduler/components/ScheduleGroupDetails';
import { ScheduleGroupTable } from '@/features/eventbridge/scheduler/components/ScheduleGroupTable';
import { ScheduleTable } from '@/features/eventbridge/scheduler/components/ScheduleTable';
import { ScheduleTargetDisplay } from '@/features/eventbridge/scheduler/components/ScheduleTargetDisplay';

describe('Scheduler components', () => {
  afterEach(cleanup);

  it('renders schedule groups with View and Schedules actions', () => {
    const onViewGroup = vi.fn();
    const onViewSchedules = vi.fn();

    render(
      <ScheduleGroupTable
        scheduleGroups={[{ name: 'orders', arn: 'arn:orders' }]}
        loading={false}
        onViewGroup={onViewGroup}
        onViewSchedules={onViewSchedules}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View details for orders' }));
    expect(onViewGroup).toHaveBeenCalledWith('orders');

    fireEvent.click(screen.getByRole('button', { name: 'View schedules in orders' }));
    expect(onViewSchedules).toHaveBeenCalledWith('orders');
  });

  it('shows an empty state when no schedule groups exist', () => {
    render(
      <ScheduleGroupTable
        scheduleGroups={[]}
        loading={false}
        onViewGroup={vi.fn()}
        onViewSchedules={vi.fn()}
      />,
    );

    expect(screen.getByText('No schedule groups found')).toBeTruthy();
  });

  it('renders schedules with state badges and opens a schedule', () => {
    const onViewSchedule = vi.fn();

    render(
      <ScheduleTable
        schedules={[
          {
            name: 'hourly',
            arn: 'arn:hourly',
            groupName: 'orders',
            state: 'ENABLED',
            targetArn: 'arn:target',
          },
          {
            name: 'nightly',
            arn: 'arn:nightly',
            groupName: 'orders',
            state: 'DISABLED',
          },
        ]}
        loading={false}
        hasNextPage={false}
        onViewSchedule={onViewSchedule}
        onLoadMore={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('ENABLED')).toBeTruthy();
    expect(screen.getByText('DISABLED')).toBeTruthy();
    expect(screen.getByText('arn:target')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'View details for hourly' }));
    expect(onViewSchedule).toHaveBeenCalledWith('hourly');
  });

  it('offers a load more action when more schedules exist', () => {
    const onLoadMore = vi.fn();

    render(
      <ScheduleTable
        schedules={[
          { name: 'hourly', arn: 'arn:hourly', groupName: 'orders', state: 'ENABLED' },
        ]}
        loading={false}
        hasNextPage
        onViewSchedule={vi.fn()}
        onLoadMore={onLoadMore}
        onRetry={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Load more schedules' }));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it('shows a retryable error state when schedules fail to load', () => {
    const onRetry = vi.fn();

    render(
      <ScheduleTable
        schedules={[]}
        loading={false}
        error={new Error('Boom')}
        hasNextPage={false}
        onViewSchedule={vi.fn()}
        onLoadMore={vi.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('Failed to load schedules')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('describes common schedule expressions while keeping the raw value', () => {
    render(<ScheduleExpressionDisplay expression="rate(5 minutes)" timezone="UTC" />);

    expect(screen.getByText('rate(5 minutes)')).toBeTruthy();
    expect(screen.getByText('Every 5 minutes')).toBeTruthy();
    expect(screen.getByText('Timezone: UTC')).toBeTruthy();
  });

  it('describes a daily cron expression', () => {
    render(<ScheduleExpressionDisplay expression="cron(0 12 * * ? *)" />);

    expect(screen.getByText('Every day at 12:00')).toBeTruthy();
  });

  it('renders a placeholder when a schedule has no target', () => {
    render(<ScheduleTargetDisplay />);

    expect(
      screen.getByText(
        'This schedule does not declare a target in its current configuration.',
      ),
    ).toBeTruthy();
  });

  it('renders the group metadata and exposes a schedules action', () => {
    const onViewSchedules = vi.fn();

    render(
      <ScheduleGroupDetails
        scheduleGroupDetails={{
          name: 'orders',
          arn: 'arn:orders',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        }}
        loading={false}
        onBack={vi.fn()}
        onViewSchedules={onViewSchedules}
      />,
    );

    expect(screen.getByRole('heading', { level: 3, name: 'orders' })).toBeTruthy();
    expect(screen.getByText('arn:orders')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'View schedules' }));
    expect(onViewSchedules).toHaveBeenCalledOnce();
  });
});

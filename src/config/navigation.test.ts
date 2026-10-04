import { describe, expect, it } from 'vitest';
import { navigation } from './navigation';

describe('planned resource navigation', () => {
  it('shows S3, DynamoDB, EventBridge EventBus, and EventBridge Scheduler as coming soon', () => {
    const comingSoonItems = navigation.filter((item) => item.comingSoon).map((item) => item.label);

    expect(comingSoonItems).toEqual([
      'S3',
      'DynamoDB',
      'EventBridge (EventBus)',
      'EventBridge (Scheduler)',
    ]);
  });

  it('disables EventBridge entries until their routes are available', () => {
    const eventBridgeItems = navigation.filter((item) => item.label.startsWith('EventBridge'));

    expect(eventBridgeItems).toHaveLength(2);
    expect(eventBridgeItems.every((item) => item.comingSoon && item.disabled)).toBe(true);
  });
});

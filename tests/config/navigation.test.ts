import { describe, expect, it } from 'vitest';
import { navigation } from '@/config/navigation';

describe('resource navigation', () => {
  it('shows only EventBridge Scheduler as coming soon', () => {
    const comingSoonItems = navigation.filter((item) => item.comingSoon).map((item) => item.label);

    expect(comingSoonItems).toEqual(['EventBridge (Scheduler)']);
  });

  it('enables implemented DynamoDB and S3 resources', () => {
    const implementedItems = navigation.filter((item) => ['DynamoDB', 'S3'].includes(item.label));

    expect(implementedItems).toHaveLength(2);
    expect(implementedItems.every((item) => !item.comingSoon && !item.disabled)).toBe(true);
  });

  it('places S3 after DynamoDB in the sidebar', () => {
    const dynamoDbIndex = navigation.findIndex((item) => item.label === 'DynamoDB');
    const s3Index = navigation.findIndex((item) => item.label === 'S3');

    expect(dynamoDbIndex).toBeGreaterThanOrEqual(0);
    expect(s3Index).toBeGreaterThan(dynamoDbIndex);
  });

  it('enables the EventBridge EventBus entry and keeps Scheduler coming soon', () => {
    const eventBusItem = navigation.find((item) => item.label === 'EventBridge (EventBus)');
    const schedulerItem = navigation.find((item) => item.label === 'EventBridge (Scheduler)');

    expect(eventBusItem?.path).toBe('/eventbridge/eventbuses');
    expect(eventBusItem?.comingSoon).toBeFalsy();
    expect(eventBusItem?.disabled).toBeFalsy();
    expect(schedulerItem).toMatchObject({ comingSoon: true, disabled: true });
  });
});

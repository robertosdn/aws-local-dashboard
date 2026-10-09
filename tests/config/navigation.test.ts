import { describe, expect, it } from 'vitest';
import { navigation } from '@/config/navigation';

describe('resource navigation', () => {
  it('shows no coming soon entries once every resource entry is implemented', () => {
    const comingSoonItems = navigation.filter((item) => item.comingSoon).map((item) => item.label);

    expect(comingSoonItems).toEqual([]);
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

  it('enables the EventBridge EventBus and Scheduler entries', () => {
    const eventBusItem = navigation.find((item) => item.label === 'EventBridge (EventBus)');
    const schedulerItem = navigation.find((item) => item.label === 'EventBridge (Scheduler)');

    expect(eventBusItem?.path).toBe('/eventbridge/eventbuses');
    expect(eventBusItem?.comingSoon).toBeFalsy();
    expect(eventBusItem?.disabled).toBeFalsy();
    expect(schedulerItem?.path).toBe('/eventbridge/scheduler/groups');
    expect(schedulerItem?.comingSoon).toBeFalsy();
    expect(schedulerItem?.disabled).toBeFalsy();
  });
});

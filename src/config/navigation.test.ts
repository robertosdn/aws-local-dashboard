import { describe, expect, it } from 'vitest';
import { navigation } from './navigation';

describe('resource navigation', () => {
  it('shows only EventBridge EventBus and Scheduler as coming soon', () => {
    const comingSoonItems = navigation.filter((item) => item.comingSoon).map((item) => item.label);

    expect(comingSoonItems).toEqual(['EventBridge (EventBus)', 'EventBridge (Scheduler)']);
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

  it('disables EventBridge entries until their routes are available', () => {
    const eventBridgeItems = navigation.filter((item) => item.label.startsWith('EventBridge'));

    expect(eventBridgeItems).toHaveLength(2);
    expect(eventBridgeItems.every((item) => item.comingSoon && item.disabled)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { dynamodbSampleItems } from './dynamodb-test-data.mjs';

describe('DynamoDB sample data', () => {
  it('has stable, unique sort keys under one partition key for Query and Scan examples', () => {
    const partitionKeys = new Set(dynamodbSampleItems.map((item) => item.pk));
    const sortKeys = dynamodbSampleItems.map((item) => item.sk);

    expect(dynamodbSampleItems).toHaveLength(3);
    expect(partitionKeys).toEqual(new Set(['customer#sample']));
    expect(new Set(sortKeys).size).toBe(sortKeys.length);
    expect(sortKeys).toEqual(['profile', 'order#2024-001', 'order#2024-002']);
  });
});

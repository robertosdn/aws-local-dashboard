import { describe, expect, it } from 'vitest';
import { s3SampleObjects } from './s3-test-data.mjs';

describe('S3 sample data', () => {
  it('defines unique deterministic objects with metadata and no destructive operations', () => {
    const keys = s3SampleObjects.map((object) => object.key);

    expect(keys).toEqual(['README.txt', 'customers/sample.json', 'reports/summary.csv']);
    expect(new Set(keys).size).toBe(keys.length);
    expect(s3SampleObjects.every((object) => object.body && object.contentType)).toBe(true);
  });
});

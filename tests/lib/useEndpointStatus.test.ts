import { describe, expect, it } from 'vitest';
import { ENDPOINT_STATUS_POLL_INTERVAL_MS } from '@/lib/useEndpointStatus';

describe('endpoint status polling', () => {
  it('checks endpoint availability every 30 seconds by default', () => {
    expect(ENDPOINT_STATUS_POLL_INTERVAL_MS).toBe(30_000);
  });
});

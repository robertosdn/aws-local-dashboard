import { createServer, type IncomingHttpHeaders } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';

import { listQueues } from '@/features/sqs/api/sqs';

describe('SQS API', () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await closeServer?.();
    closeServer = undefined;
  });

  it('lists queues without sending the x-amzn-query-mode header', async () => {
    let requestHeaders: IncomingHttpHeaders | undefined;
    const server = createServer((request, response) => {
      requestHeaders = request.headers;
      response.writeHead(200, { 'content-type': 'application/x-amz-json-1.0' });
      response.end(JSON.stringify({ QueueUrls: [] }));
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    closeServer = () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });

    const address = server.address() as AddressInfo;
    const queues = await listQueues({ endpoint: `http://127.0.0.1:${address.port}` });

    expect(queues).toEqual([]);
    expect(requestHeaders).toBeDefined();
    expect(requestHeaders).not.toHaveProperty('x-amzn-query-mode');
  });
});

import { createHash } from 'node:crypto';
import { createServer, type IncomingHttpHeaders } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';

import { listQueues, getQueueDetails, sendMessage } from '@/features/sqs/api/sqs';

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

  it('sends a message and maps the returned identifiers', async () => {
    const messageBody = 'hello world';
    const bodyChecksum = createHash('md5').update(messageBody).digest('hex');

    let requestBody = '';
    const server = createServer((request, response) => {
      request.on('data', (chunk) => {
        requestBody += chunk;
      });
      request.on('end', () => {
        response.writeHead(200, { 'content-type': 'application/x-amz-json-1.0' });
        response.end(
          JSON.stringify({
            MessageId: 'msg-123',
            MD5OfMessageBody: bodyChecksum,
          }),
        );
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    closeServer = () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });

    const address = server.address() as AddressInfo;
    const result = await sendMessage(
      'http://127.0.0.1:4566/000000000000/dashboard-standalone-queue',
      messageBody,
      { endpoint: `http://127.0.0.1:${address.port}` },
      { messageAttributes: { source: { dataType: 'String', stringValue: 'dashboard' } } },
    );

    expect(result).toEqual({
      messageId: 'msg-123',
      md5OfMessageBody: bodyChecksum,
    });

    const payload = JSON.parse(requestBody);
    expect(payload.QueueUrl).toBe('http://127.0.0.1:4566/000000000000/dashboard-standalone-queue');
    expect(payload.MessageBody).toBe(messageBody);
    expect(payload.MessageAttributes).toEqual({
      source: { DataType: 'String', StringValue: 'dashboard' },
    });
  });

  it('loads all queue attributes for a queue', async () => {
    let requestBody = '';
    const server = createServer((request, response) => {
      request.on('data', (chunk) => {
        requestBody += chunk;
      });
      request.on('end', () => {
        response.writeHead(200, { 'content-type': 'application/x-amz-json-1.0' });
        response.end(
          JSON.stringify({
            Attributes: {
              QueueArn: 'arn:aws:sqs:us-east-1:000000000000:dashboard-standalone-queue',
              VisibilityTimeout: '30',
            },
          }),
        );
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    closeServer = () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });

    const address = server.address() as AddressInfo;
    const details = await getQueueDetails(
      'http://127.0.0.1:4566/000000000000/dashboard-standalone-queue',
      { endpoint: `http://127.0.0.1:${address.port}` },
    );

    expect(details).toEqual({
      url: 'http://127.0.0.1:4566/000000000000/dashboard-standalone-queue',
      name: 'dashboard-standalone-queue',
      attributes: {
        QueueArn: 'arn:aws:sqs:us-east-1:000000000000:dashboard-standalone-queue',
        VisibilityTimeout: '30',
      },
    });

    const payload = JSON.parse(requestBody);
    expect(payload.QueueUrl).toBe(
      'http://127.0.0.1:4566/000000000000/dashboard-standalone-queue',
    );
    expect(payload.AttributeNames).toEqual(['All']);
  });
});

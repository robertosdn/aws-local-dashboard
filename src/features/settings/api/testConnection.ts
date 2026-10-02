import { ListQueuesCommand } from '@aws-sdk/client-sqs';

import { createSqsClient } from '@/services/aws';

export async function testConnection(endpoint: string, region: string): Promise<void> {
  const client = createSqsClient({ endpoint, region });

  try {
    await client.send(new ListQueuesCommand({ MaxResults: 1 }));
  } finally {
    client.destroy();
  }
}
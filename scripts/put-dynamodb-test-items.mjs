import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodbSampleItems } from './dynamodb-test-data.mjs';

const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const tableName = process.env.TABLE_NAME ?? 'dashboard-dynamodb-items';

const client = new DynamoDBClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});
const documentClient = DynamoDBDocumentClient.from(client);

async function main() {
  for (const item of dynamodbSampleItems) {
    await documentClient.send(new PutCommand({ TableName: tableName, Item: item }));
  }

  console.log(`Added ${dynamodbSampleItems.length} sample items to DynamoDB table "${tableName}".`);
}

main()
  .catch((error) => {
    console.error(`Could not add sample items to DynamoDB table "${tableName}".`);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

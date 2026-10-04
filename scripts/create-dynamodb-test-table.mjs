import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';

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

async function tableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return false;
    }
    throw error;
  }
}

async function main() {
  if (await tableExists()) {
    console.log(`DynamoDB table already exists: ${tableName}`);
  } else {
    try {
      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: 'pk', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        }),
      );
      console.log(`DynamoDB table created: ${tableName}`);
    } catch (error) {
      if (!(error instanceof ResourceInUseException)) {
        throw error;
      }
      console.log(`DynamoDB table was created concurrently: ${tableName}`);
    }
  }

  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: tableName });
  console.log(`DynamoDB table is active: ${tableName}`);
}

main()
  .catch((error) => {
    console.error(`Could not create or verify DynamoDB table "${tableName}".`);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

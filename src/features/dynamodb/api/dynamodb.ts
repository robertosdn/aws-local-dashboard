import {
  ListTablesCommand,
  DescribeTableCommand,
  DeleteTableCommand,
  type TableDescription,
} from '@aws-sdk/client-dynamodb';
import { QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import {
  createDynamoDbClient,
  createDynamoDbDocumentClient,
  type AwsClientConfig,
} from '@/services/aws';
import type {
  DynamoTableSummary,
  DynamoTableDetails,
  DynamoKeyAttribute,
  DynamoSecondaryIndex,
  ItemPage,
  ItemQuery,
  ItemScan,
  DeleteItemInput,
  DeleteTableInput,
  ListTablesOutput,
  DynamoKey,
  SortKeyCondition,
  DynamoKeyValue,
  DynamoItem,
} from '../types/dynamodb';

const PAGE_LIMIT = 100;

function mapTableSummary(table: TableDescription): DynamoTableSummary {
  return {
    tableName: table.TableName || '',
    tableStatus: table.TableStatus,
    itemCount: table.ItemCount,
    tableSizeBytes: table.TableSizeBytes,
    creationDateTime: table.CreationDateTime,
  };
}

function mapKeySchema(
  tableName: string | undefined,
  schema: NonNullable<TableDescription['KeySchema']>,
  attributeDefinitions: NonNullable<TableDescription['AttributeDefinitions']>,
): DynamoKeyAttribute[] {
  return schema.map((key) => {
    const attributeName = key.AttributeName;
    const attributeType = attributeDefinitions.find(
      (definition) => definition.AttributeName === attributeName,
    )?.AttributeType;

    if (!attributeName || !attributeType || !key.KeyType) {
      throw new Error(`Table "${tableName}" returned an incomplete key schema`);
    }

    return {
      attributeName,
      attributeType,
      keyType: key.KeyType,
    };
  });
}

function mapSecondaryIndexes(table: TableDescription): DynamoSecondaryIndex[] {
  const attributeDefinitions = table.AttributeDefinitions ?? [];
  const indexes = [
    ...(table.GlobalSecondaryIndexes ?? []).map((index) => ({
      index,
      indexType: 'GLOBAL' as const,
    })),
    ...(table.LocalSecondaryIndexes ?? []).map((index) => ({
      index,
      indexType: 'LOCAL' as const,
    })),
  ];

  return indexes.map(({ index, indexType }) => {
    if (!index.IndexName) {
      throw new Error(`Table "${table.TableName}" returned a secondary index without a name`);
    }

    return {
      indexName: index.IndexName,
      indexType,
      indexStatus: 'IndexStatus' in index ? index.IndexStatus : undefined,
      keySchema: mapKeySchema(
        table.TableName,
        index.KeySchema ?? [],
        attributeDefinitions,
      ),
    };
  });
}

function mapTableDetails(table: TableDescription): DynamoTableDetails {
  const summary = mapTableSummary(table);
  const keySchema = mapKeySchema(
    table.TableName,
    table.KeySchema ?? [],
    table.AttributeDefinitions ?? [],
  );
  return {
    ...summary,
    keySchema,
    secondaryIndexes: mapSecondaryIndexes(table),
  };
}

function formatDynamoKeyValue(
  value: DynamoKeyValue,
  type: 'S' | 'N' | 'B',
  keyName: string,
): string | number | Uint8Array {
  switch (type) {
    case 'N':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Key "${keyName}" must be a finite number`);
      }
      return value;
    case 'B':
      if (!(value instanceof Uint8Array)) {
        throw new Error(`Key "${keyName}" must be binary data`);
      }
      return value;
    default:
      if (typeof value !== 'string') {
        throw new Error(`Key "${keyName}" must be a string`);
      }
      return value;
  }
}

function buildKeyConditionExpression(
  partitionKey: DynamoKeyAttribute,
  partitionKeyValue: DynamoKeyValue,
  sortKey?: DynamoKeyAttribute,
  sortKeyCondition?: SortKeyCondition,
): {
  expression: string;
  expressionNames: Record<string, string>;
  expressionValues: Record<string, unknown>;
} {
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, unknown> = {};

  const pkName = '#pk';
  expressionNames[pkName] = partitionKey.attributeName;
  expressionValues[':pk'] = formatDynamoKeyValue(
    partitionKeyValue,
    partitionKey.attributeType,
    partitionKey.attributeName,
  );

  let expression = `${pkName} = :pk`;

  if (sortKey && sortKeyCondition) {
    const skName = '#sk';
    expressionNames[skName] = sortKey.attributeName;

    switch (sortKeyCondition.operator) {
      case 'EQ':
        expressionValues[':sk'] = formatDynamoKeyValue(
          sortKeyCondition.value,
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expression += ` AND ${skName} = :sk`;
        break;
      case 'LT':
        expressionValues[':sk'] = formatDynamoKeyValue(
          sortKeyCondition.value,
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expression += ` AND ${skName} < :sk`;
        break;
      case 'LE':
        expressionValues[':sk'] = formatDynamoKeyValue(
          sortKeyCondition.value,
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expression += ` AND ${skName} <= :sk`;
        break;
      case 'GT':
        expressionValues[':sk'] = formatDynamoKeyValue(
          sortKeyCondition.value,
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expression += ` AND ${skName} > :sk`;
        break;
      case 'GE':
        expressionValues[':sk'] = formatDynamoKeyValue(
          sortKeyCondition.value,
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expression += ` AND ${skName} >= :sk`;
        break;
      case 'BETWEEN':
        expressionValues[':sk1'] = formatDynamoKeyValue(
          sortKeyCondition.value[0],
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expressionValues[':sk2'] = formatDynamoKeyValue(
          sortKeyCondition.value[1],
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expression += ` AND ${skName} BETWEEN :sk1 AND :sk2`;
        break;
      case 'BEGINS_WITH':
        if (sortKey.attributeType === 'N') {
          throw new Error('BEGINS_WITH is only supported for string and binary sort keys');
        }
        expressionValues[':sk'] = formatDynamoKeyValue(
          sortKeyCondition.value,
          sortKey.attributeType,
          sortKey.attributeName,
        );
        expression += ` AND begins_with(${skName}, :sk)`;
        break;
    }
  }

  return { expression, expressionNames, expressionValues };
}

export async function listTables(
  config?: AwsClientConfig,
  exclusiveStartTableName?: string,
): Promise<ListTablesOutput> {
  const client = createDynamoDbClient(config);

  try {
    const command = new ListTablesCommand({
      Limit: PAGE_LIMIT,
      ExclusiveStartTableName: exclusiveStartTableName,
    });

    const response = await client.send(command);
    return {
      tableNames: response.TableNames || [],
      lastEvaluatedTableName: response.LastEvaluatedTableName,
    };
  } finally {
    client.destroy();
  }
}

export async function listTablesWithDetails(
  config?: AwsClientConfig,
  exclusiveStartTableName?: string,
): Promise<{ tables: DynamoTableSummary[]; lastEvaluatedTableName?: string }> {
  const client = createDynamoDbClient(config);

  try {
    const command = new ListTablesCommand({
      Limit: PAGE_LIMIT,
      ExclusiveStartTableName: exclusiveStartTableName,
    });

    const response = await client.send(command);
    const tableNames = response.TableNames || [];

    const tables = await Promise.all(
      tableNames.map(async (name) => {
        const descResponse = await client.send(new DescribeTableCommand({ TableName: name }));
        if (!descResponse.Table) {
          throw new Error(`Could not describe DynamoDB table "${name}"`);
        }
        return mapTableSummary(descResponse.Table);
      }),
    );

    return {
      tables,
      lastEvaluatedTableName: response.LastEvaluatedTableName,
    };
  } finally {
    client.destroy();
  }
}

export async function describeTable(
  tableName: string,
  config?: AwsClientConfig,
): Promise<DynamoTableDetails> {
  const client = createDynamoDbClient(config);

  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    if (!response.Table) {
      throw new Error(`Table ${tableName} not found`);
    }
    return mapTableDetails(response.Table);
  } finally {
    client.destroy();
  }
}

export async function queryItems(input: ItemQuery, config?: AwsClientConfig): Promise<ItemPage> {
  const tableDetails = await describeTable(input.tableName, config);
  const partitionKey = tableDetails.keySchema.find((k) => k.keyType === 'HASH');
  const sortKey = tableDetails.keySchema.find((k) => k.keyType === 'RANGE');

  if (!partitionKey) {
    throw new Error(`Table ${input.tableName} has no partition key`);
  }

  const { expression, expressionNames, expressionValues } = buildKeyConditionExpression(
    partitionKey,
    input.partitionKeyValue,
    sortKey,
    input.sortKeyCondition,
  );
  const docClient = createDynamoDbDocumentClient(config);
  try {
    const command = new QueryCommand({
      TableName: input.tableName,
      KeyConditionExpression: expression,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
      Limit: PAGE_LIMIT,
      ExclusiveStartKey: input.exclusiveStartKey,
      ReturnConsumedCapacity: 'NONE',
    });

    const response = await docClient.send(command);
    return {
      items: (response.Items || []) as DynamoItem[],
      lastEvaluatedKey: response.LastEvaluatedKey as DynamoKey | undefined,
      scannedCount: response.ScannedCount,
    };
  } finally {
    docClient.destroy();
  }
}

export async function scanItems(input: ItemScan, config?: AwsClientConfig): Promise<ItemPage> {
  const docClient = createDynamoDbDocumentClient(config);

  try {
    const command = new ScanCommand({
      TableName: input.tableName,
      Limit: PAGE_LIMIT,
      ExclusiveStartKey: input.exclusiveStartKey,
      ReturnConsumedCapacity: 'NONE',
    });

    const response = await docClient.send(command);
    return {
      items: (response.Items || []) as DynamoItem[],
      lastEvaluatedKey: response.LastEvaluatedKey as DynamoKey | undefined,
      scannedCount: response.ScannedCount,
    };
  } finally {
    docClient.destroy();
  }
}

export async function deleteItem(input: DeleteItemInput, config?: AwsClientConfig): Promise<void> {
  const tableDetails = await describeTable(input.tableName, config);
  const primaryKeys = tableDetails.keySchema;
  const suppliedKeys = Object.keys(input.key);

  if (
    primaryKeys.length === 0 ||
    primaryKeys.length !== suppliedKeys.length ||
    primaryKeys.some((key) => !Object.prototype.hasOwnProperty.call(input.key, key.attributeName))
  ) {
    throw new Error(
      `A complete primary key is required to delete an item from "${input.tableName}"`,
    );
  }

  for (const key of primaryKeys) {
    formatDynamoKeyValue(input.key[key.attributeName], key.attributeType, key.attributeName);
  }

  const docClient = createDynamoDbDocumentClient(config);

  try {
    const command = new DeleteCommand({
      TableName: input.tableName,
      Key: input.key,
      ReturnConsumedCapacity: 'NONE',
    });

    await docClient.send(command);
  } finally {
    docClient.destroy();
  }
}

export async function deleteTable(
  input: DeleteTableInput,
  config?: AwsClientConfig,
): Promise<void> {
  const client = createDynamoDbClient(config);

  try {
    const command = new DeleteTableCommand({
      TableName: input.tableName,
    });

    await client.send(command);
  } finally {
    client.destroy();
  }
}

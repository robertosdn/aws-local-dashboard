import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DeleteTableCommand,
  DescribeTableCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const mocks = vi.hoisted(() => ({
  clientSend: vi.fn(),
  clientDestroy: vi.fn(),
  documentSend: vi.fn(),
  documentDestroy: vi.fn(),
}));

vi.mock('@/services/aws', () => ({
  createDynamoDbClient: vi.fn(() => ({
    send: mocks.clientSend,
    destroy: mocks.clientDestroy,
  })),
  createDynamoDbDocumentClient: vi.fn(() => ({
    send: mocks.documentSend,
    destroy: mocks.documentDestroy,
  })),
}));

import {
  deleteItem,
  deleteTable,
  describeTable,
  listTables,
  listTablesWithDetails,
  queryItems,
  scanItems,
} from './dynamodb';

const tableDescription = {
  TableName: 'sample-table',
  TableStatus: 'ACTIVE',
  AttributeDefinitions: [
    { AttributeName: 'customerId', AttributeType: 'S' as const },
    { AttributeName: 'createdAt', AttributeType: 'N' as const },
    { AttributeName: 'email', AttributeType: 'S' as const },
    { AttributeName: 'orderId', AttributeType: 'S' as const },
  ],
  KeySchema: [
    { AttributeName: 'customerId', KeyType: 'HASH' as const },
    { AttributeName: 'createdAt', KeyType: 'RANGE' as const },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'email-index',
      IndexStatus: 'ACTIVE' as const,
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' as const },
        { AttributeName: 'createdAt', KeyType: 'RANGE' as const },
      ],
    },
  ],
  LocalSecondaryIndexes: [
    {
      IndexName: 'order-index',
      KeySchema: [
        { AttributeName: 'customerId', KeyType: 'HASH' as const },
        { AttributeName: 'orderId', KeyType: 'RANGE' as const },
      ],
    },
  ],
};

describe('DynamoDB API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clientSend.mockImplementation(async (command: unknown) => {
      if (command instanceof DescribeTableCommand) {
        return { Table: tableDescription };
      }
      if (command instanceof ListTablesCommand) {
        return { TableNames: ['sample-table'], LastEvaluatedTableName: 'sample-table' };
      }
      return {};
    });
    mocks.documentSend.mockResolvedValue({});
  });

  it('maps key schema types from table attribute definitions', async () => {
    const result = await describeTable('sample-table');

    expect(result.keySchema).toEqual([
      { attributeName: 'customerId', attributeType: 'S', keyType: 'HASH' },
      { attributeName: 'createdAt', attributeType: 'N', keyType: 'RANGE' },
    ]);
    expect(result.secondaryIndexes).toEqual([
      {
        indexName: 'email-index',
        indexType: 'GLOBAL',
        indexStatus: 'ACTIVE',
        keySchema: [
          { attributeName: 'email', attributeType: 'S', keyType: 'HASH' },
          { attributeName: 'createdAt', attributeType: 'N', keyType: 'RANGE' },
        ],
      },
      {
        indexName: 'order-index',
        indexType: 'LOCAL',
        indexStatus: undefined,
        keySchema: [
          { attributeName: 'customerId', attributeType: 'S', keyType: 'HASH' },
          { attributeName: 'orderId', attributeType: 'S', keyType: 'RANGE' },
        ],
      },
    ]);
    expect(mocks.clientDestroy).toHaveBeenCalledOnce();
  });

  it('paginates table listings and does not hide describe failures', async () => {
    const page = await listTables({ endpoint: 'http://localhost:4566' }, 'previous-table');

    expect(page).toEqual({
      tableNames: ['sample-table'],
      lastEvaluatedTableName: 'sample-table',
    });
    const listCommand = mocks.clientSend.mock.calls[0][0] as ListTablesCommand;
    expect(listCommand.input).toMatchObject({
      Limit: 100,
      ExclusiveStartTableName: 'previous-table',
    });

    mocks.clientSend.mockRejectedValueOnce(new Error('Describe failed'));
    await expect(listTablesWithDetails()).rejects.toThrow('Describe failed');
    expect(mocks.clientDestroy).toHaveBeenCalledTimes(2);
  });

  it('queries with native document values and a continuation key', async () => {
    const lastEvaluatedKey = { customerId: 'customer#1', createdAt: 10 };
    mocks.documentSend.mockResolvedValue({
      Items: [{ customerId: 'customer#1', createdAt: 10 }],
      LastEvaluatedKey: lastEvaluatedKey,
      ScannedCount: 1,
    });

    const result = await queryItems({
      tableName: 'sample-table',
      partitionKeyValue: 'customer#1',
      sortKeyCondition: { operator: 'GE', value: 10 },
      exclusiveStartKey: lastEvaluatedKey,
    });

    const command = mocks.documentSend.mock.calls[0][0] as QueryCommand;
    expect(command).toBeInstanceOf(QueryCommand);
    expect(command.input).toMatchObject({
      Limit: 100,
      ExclusiveStartKey: lastEvaluatedKey,
      ExpressionAttributeNames: { '#pk': 'customerId', '#sk': 'createdAt' },
      ExpressionAttributeValues: { ':pk': 'customer#1', ':sk': 10 },
    });
    expect(result).toEqual({
      items: [{ customerId: 'customer#1', createdAt: 10 }],
      lastEvaluatedKey,
      scannedCount: 1,
    });
    expect(mocks.documentDestroy).toHaveBeenCalledOnce();
  });

  it('rejects key values with a type that does not match the table schema', async () => {
    await expect(
      queryItems({
        tableName: 'sample-table',
        partitionKeyValue: 123,
      }),
    ).rejects.toThrow('Key "customerId" must be a string');
    expect(mocks.documentSend).not.toHaveBeenCalled();
  });

  it('rejects unsupported sort-key operator and type combinations', async () => {
    await expect(
      queryItems({
        tableName: 'sample-table',
        partitionKeyValue: 'customer#1',
        sortKeyCondition: { operator: 'BEGINS_WITH', value: '10' },
      }),
    ).rejects.toThrow('BEGINS_WITH is only supported for string and binary sort keys');
    expect(mocks.documentSend).not.toHaveBeenCalled();
  });

  it('scans one bounded page and destroys the document client', async () => {
    const lastEvaluatedKey = { customerId: 'customer#1', createdAt: 10 };
    mocks.documentSend.mockResolvedValue({
      Items: [{ customerId: 'customer#1' }],
      LastEvaluatedKey: lastEvaluatedKey,
      ScannedCount: 1,
    });

    const result = await scanItems({
      tableName: 'sample-table',
      exclusiveStartKey: lastEvaluatedKey,
    });

    const command = mocks.documentSend.mock.calls[0][0] as ScanCommand;
    expect(command).toBeInstanceOf(ScanCommand);
    expect(command.input).toMatchObject({ Limit: 100, ExclusiveStartKey: lastEvaluatedKey });
    expect(result.lastEvaluatedKey).toEqual(lastEvaluatedKey);
    expect(mocks.documentDestroy).toHaveBeenCalledOnce();
  });

  it('requires the full table primary key and destroys clients after deletion', async () => {
    await expect(
      deleteItem({ tableName: 'sample-table', key: { customerId: 'customer#1' } }),
    ).rejects.toThrow('A complete primary key is required');
    expect(mocks.documentSend).not.toHaveBeenCalled();

    await deleteItem({
      tableName: 'sample-table',
      key: { customerId: 'customer#1', createdAt: 10 },
    });
    const command = mocks.documentSend.mock.calls[0][0] as DeleteCommand;
    expect(command).toBeInstanceOf(DeleteCommand);
    expect(command.input.Key).toEqual({ customerId: 'customer#1', createdAt: 10 });
    expect(mocks.documentDestroy).toHaveBeenCalledOnce();
  });

  it('surfaces table deletion errors and always destroys its client', async () => {
    mocks.clientSend.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(deleteTable({ tableName: 'sample-table' })).rejects.toThrow('Delete failed');

    const command = mocks.clientSend.mock.calls[0][0] as DeleteTableCommand;
    expect(command).toBeInstanceOf(DeleteTableCommand);
    expect(mocks.clientDestroy).toHaveBeenCalledOnce();
  });

  it('destroys the document client when a request fails', async () => {
    mocks.documentSend.mockRejectedValueOnce(new Error('Scan failed'));

    await expect(scanItems({ tableName: 'sample-table' })).rejects.toThrow('Scan failed');
    expect(mocks.documentDestroy).toHaveBeenCalledOnce();
  });
});

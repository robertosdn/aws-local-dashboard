export interface DynamoTableSummary {
  tableName: string;
  tableStatus?: string;
  itemCount?: number;
  tableSizeBytes?: number;
  creationDateTime?: Date;
}

export type DynamoScalarType = 'S' | 'N' | 'B';
export type DynamoKeyValue = string | number | Uint8Array;

export interface DynamoKeyAttribute {
  attributeName: string;
  attributeType: DynamoScalarType;
  keyType: 'HASH' | 'RANGE';
}

export interface DynamoTableDetails extends DynamoTableSummary {
  keySchema: DynamoKeyAttribute[];
  secondaryIndexes: DynamoSecondaryIndex[];
}

export interface DynamoSecondaryIndex {
  indexName: string;
  indexType: 'GLOBAL' | 'LOCAL';
  indexStatus?: string;
  keySchema: DynamoKeyAttribute[];
}

export type DynamoItem = Record<string, unknown>;
export type DynamoKey = Record<string, string | number | Uint8Array>;

export interface ItemPage {
  items: DynamoItem[];
  lastEvaluatedKey?: DynamoKey;
  scannedCount?: number;
}

export type SortKeyCondition =
  | { operator: 'EQ' | 'LT' | 'LE' | 'GT' | 'GE' | 'BEGINS_WITH'; value: DynamoKeyValue }
  | { operator: 'BETWEEN'; value: [DynamoKeyValue, DynamoKeyValue] };

export interface ItemQuery {
  tableName: string;
  partitionKeyValue: DynamoKeyValue;
  sortKeyCondition?: SortKeyCondition;
  exclusiveStartKey?: DynamoKey;
}

export interface ItemScan {
  tableName: string;
  exclusiveStartKey?: DynamoKey;
}

export interface DeleteItemInput {
  tableName: string;
  key: DynamoKey;
}

export interface DeleteTableInput {
  tableName: string;
}

export interface ListTablesOutput {
  tableNames: string[];
  lastEvaluatedTableName?: string;
}

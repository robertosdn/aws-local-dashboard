export interface S3Bucket {
  name: string;
  creationDate?: Date;
}

export interface S3BucketDetails extends S3Bucket {
  region: string;
  versioningStatus: 'Enabled' | 'Suspended' | 'Not enabled';
  encryptionAlgorithms: string[];
  publicAccessBlock: {
    blockPublicAcls: boolean;
    ignorePublicAcls: boolean;
    blockPublicPolicy: boolean;
    restrictPublicBuckets: boolean;
  } | null;
}

export interface S3Object {
  key: string;
  size?: number;
  lastModified?: Date;
  etag?: string;
  storageClass?: string;
}

export interface S3ObjectPage {
  objects: S3Object[];
  nextContinuationToken?: string;
  isTruncated: boolean;
}

export interface ListBucketObjectsInput {
  bucketName: string;
  continuationToken?: string;
}

export interface DeleteBucketInput {
  bucketName: string;
}

export interface DeleteObjectInput {
  bucketName: string;
  key: string;
}

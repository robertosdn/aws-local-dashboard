import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';

const endpoint = process.env.AWS_ENDPOINT ?? 'http://localhost:4566';
const region = process.env.AWS_REGION ?? 'us-east-1';
const bucketName = process.env.BUCKET_NAME ?? 'dashboard-s3-samples';

const client = new S3Client({
  endpoint,
  region,
  forcePathStyle: true,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

async function bucketExists() {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (statusCode === 404 || ['NotFound', 'NoSuchBucket'].includes(error?.name)) {
      return false;
    }
    throw error;
  }
}

async function main() {
  if (await bucketExists()) {
    console.log(`S3 bucket already exists: ${bucketName}`);
    return;
  }

  try {
    await client.send(
      new CreateBucketCommand({
        Bucket: bucketName,
        ...(region !== 'us-east-1'
          ? { CreateBucketConfiguration: { LocationConstraint: region } }
          : {}),
      }),
    );
    console.log(`S3 bucket created: ${bucketName}`);
  } catch (error) {
    if (error?.name !== 'BucketAlreadyOwnedByYou') throw error;
    console.log(`S3 bucket was created concurrently: ${bucketName}`);
  }
}

main()
  .catch((error) => {
    console.error(`Could not create or verify S3 bucket "${bucketName}".`);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

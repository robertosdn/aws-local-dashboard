import { HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3SampleObjects } from './s3-test-data.mjs';

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

async function main() {
  await client.send(new HeadBucketCommand({ Bucket: bucketName }));
  for (const object of s3SampleObjects) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: object.key,
        Body: object.body,
        ContentType: object.contentType,
      }),
    );
    console.log(`Uploaded s3://${bucketName}/${object.key}`);
  }
}

main()
  .catch((error) => {
    console.error(`Could not upload sample objects to S3 bucket "${bucketName}".`);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.destroy());

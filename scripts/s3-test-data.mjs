export const s3SampleObjects = [
  {
    key: 'README.txt',
    body: 'Sample S3 objects for the AWS Local Dashboard.',
    contentType: 'text/plain',
  },
  {
    key: 'customers/sample.json',
    body: JSON.stringify(
      { id: 'customer-sample', name: 'Sample Customer', status: 'active' },
      null,
      2,
    ),
    contentType: 'application/json',
  },
  {
    key: 'reports/summary.csv',
    body: 'report,total,status\nsample,61.25,complete\n',
    contentType: 'text/csv',
  },
];

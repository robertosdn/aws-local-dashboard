export const dynamodbSampleItems = [
  {
    pk: 'customer#sample',
    sk: 'profile',
    name: 'Sample Customer',
    email: 'customer@example.test',
    status: 'active',
  },
  {
    pk: 'customer#sample',
    sk: 'order#2024-001',
    orderId: '2024-001',
    total: 42.5,
    status: 'shipped',
  },
  {
    pk: 'customer#sample',
    sk: 'order#2024-002',
    orderId: '2024-002',
    total: 18.75,
    status: 'processing',
  },
];

import { Card } from '@/components/ui/card';

export default function DynamoDbPage() {
  return (
    <Card className="rounded-2xl bg-slate-900/80 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Database</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">DynamoDB</h2>
      <p className="mt-2 text-slate-300">
        Tables and item details will be displayed here in a later feature.
      </p>
    </Card>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  EventBusDetails,
  RuleList,
  useEventBusDetails,
  useEventBusRules,
} from '@/features/eventbridge';

export default function EventBusDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [ruleTokens, setRuleTokens] = useState<Array<string | undefined>>([undefined]);
  const [rulePageIndex, setRulePageIndex] = useState(0);

  const details = useEventBusDetails(name ?? null);
  const ruleCursor = ruleTokens[rulePageIndex];
  const rules = useEventBusRules(name ?? null, ruleCursor);

  const goBack = () => navigate('/eventbridge/eventbuses');

  const loadMoreRules = () => {
    if (!rules.nextToken) return;
    setRuleTokens((tokens) => [...tokens.slice(0, rulePageIndex + 1), rules.nextToken]);
    setRulePageIndex((index) => index + 1);
  };

  if (details.error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6" role="alert">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">EventBridge</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Event bus not found</h2>
          <p className="mt-4 break-all text-sm text-slate-300">
            {details.error instanceof Error
              ? details.error.message
              : 'Unable to load this event bus.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void details.refetch()}>
              Retry
            </Button>
            <Button variant="ghost" onClick={goBack}>
              Back to event buses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <EventBusDetails
        eventBusDetails={details.eventBusDetails}
        loading={details.loading}
        onBack={goBack}
      />

      {details.eventBusDetails ? (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Rules</h3>
          <RuleList
            eventBusName={details.eventBusDetails.name}
            rules={rules.rules}
            loading={rules.loading}
            error={rules.error}
            hasNextPage={Boolean(rules.nextToken)}
            onLoadMore={loadMoreRules}
            onRetry={() => void rules.refetch()}
          />
        </section>
      ) : null}
    </div>
  );
}

import { Button } from '@/components/ui/button';

interface ItemPaginationProps {
  pageNumber: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  loading: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function ItemPagination({
  pageNumber,
  hasPreviousPage,
  hasNextPage,
  loading,
  onPreviousPage,
  onNextPage,
}: ItemPaginationProps) {
  return (
    <nav aria-label="Item pagination" className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        onClick={onPreviousPage}
        disabled={!hasPreviousPage || loading}
      >
        Previous page
      </Button>
      <span aria-live="polite" className="text-sm text-slate-400">
        Page {pageNumber}
      </span>
      <Button variant="outline" onClick={onNextPage} disabled={!hasNextPage || loading}>
        Next page
      </Button>
    </nav>
  );
}

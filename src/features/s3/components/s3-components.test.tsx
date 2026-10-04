// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BucketContents } from './BucketContents';
import { BucketDetails } from './BucketDetails';
import { BucketList } from './BucketList';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { formatSize } from './formatSize';

describe('S3 components', () => {
  afterEach(cleanup);

  it('formats object sizes for humans and rejects invalid metadata values', () => {
    expect(formatSize(0)).toBe('0 B');
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(1_572_864)).toBe('1.5 MB');
    expect(formatSize(undefined)).toBe('-');
    expect(formatSize(-1)).toBe('-');
  });

  it('opens buckets by name and gives an explicit empty state', () => {
    const onSelect = vi.fn();
    const onView = vi.fn();
    render(
      <BucketList
        buckets={[{ name: 'sample-bucket' }]}
        loading={false}
        onSelectBucket={onSelect}
        onViewBucket={onView}
        onDeleteBucket={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View bucket sample-bucket' }));
    expect(onView).toHaveBeenCalledWith('sample-bucket');
    fireEvent.click(screen.getByRole('button', { name: 'Open bucket sample-bucket' }));
    expect(onSelect).toHaveBeenCalledWith('sample-bucket');

    cleanup();
    render(
      <BucketList buckets={[]} loading={false} onSelectBucket={vi.fn()} onViewBucket={vi.fn()} onDeleteBucket={vi.fn()} />,
    );
    expect(screen.getByText('No S3 buckets found')).toBeTruthy();
  });

  it('shows bucket metadata and the selected read-only configuration groups', () => {
    render(
      <BucketDetails
        loading={false}
        onBack={vi.fn()}
        bucketDetails={{
          name: 'sample-bucket',
          creationDate: new Date('2024-01-01T00:00:00.000Z'),
          region: 'us-east-1',
          versioningStatus: 'Enabled',
          encryptionAlgorithms: ['AES256'],
          publicAccessBlock: {
            blockPublicAcls: true,
            ignorePublicAcls: true,
            blockPublicPolicy: false,
            restrictPublicBuckets: false,
          },
        }}
      />,
    );

    expect(screen.getByText('sample-bucket')).toBeTruthy();
    expect(screen.getByText('us-east-1')).toBeTruthy();
    expect(screen.getAllByText('Enabled')).toHaveLength(3);
    expect(screen.getByText('AES256')).toBeTruthy();
    expect(screen.getByText('Block public ACLs')).toBeTruthy();
    expect(screen.getAllByText('Disabled')).toHaveLength(2);
  });

  it('shows exact keys and exposes object pagination and deletion controls', () => {
    const onDelete = vi.fn();
    const onNext = vi.fn();
    render(
      <BucketContents
        bucketName="sample-bucket"
        objects={[{ key: 'nested/long sample key.json', size: 1024 }]}
        loading={false}
        hasPreviousPage={false}
        hasNextPage
        onBack={vi.fn()}
        onDeleteObject={onDelete}
        onPreviousPage={vi.fn()}
        onNextPage={onNext}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('nested/long sample key.json')).toBeTruthy();
    expect(screen.getByText('1.0 KB')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete object nested/long sample key.json' }),
    );
    expect(onNext).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith('nested/long sample key.json');
  });

  it('shows an empty-bucket state and offers a refresh action', () => {
    const onRetry = vi.fn();
    render(
      <BucketContents
        bucketName="empty-bucket"
        objects={[]}
        loading={false}
        hasPreviousPage={false}
        hasNextPage={false}
        onBack={vi.fn()}
        onDeleteObject={vi.fn()}
        onPreviousPage={vi.fn()}
        onNextPage={vi.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('This bucket is empty')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh objects' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('warns against auto-emptying buckets and identifies the exact object key', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmDialog
        target={{ kind: 'bucket', name: 'sample-bucket' }}
        pending={false}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText(/objects will not be deleted automatically/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();

    cleanup();
    render(
      <DeleteConfirmDialog
        target={{ kind: 'object', bucketName: 'sample-bucket', key: 'nested/item.json' }}
        pending={false}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText(/nested\/item\.json/)).toBeTruthy();
  });
});

# Implementation Tasks: S3 Page Naming

## Tasks

- [ ] Update `src/pages/S3Page.tsx:114`: Change header label from "Storage" to "S3"
- [ ] Update `src/pages/S3Page.tsx:115`: Change header title from "S3 Buckets" to "aws local S3"
- [ ] Update `src/features/s3/components/BucketList.tsx`: Add `onViewBucket` prop to BucketListProps interface
- [ ] Update `src/features/s3/components/BucketList.tsx`: Add "View" button before "Open" button
- [ ] Update `src/pages/S3Page.tsx`: Add `viewBucket` handler for bucket metadata view
- [ ] Update `src/pages/S3Page.tsx:165-170`: Pass `onViewBucket` to BucketList component
- [ ] Implement bucket details view (dialog or new component) for "View" action
- [ ] Verify page header displays "S3" / "aws local S3"
- [ ] Verify bucket list shows "View", "Open", "Delete" actions
- [ ] Verify "View" shows bucket metadata (creation date, versioning, encryption, region, etc.)
- [ ] Verify "Open" shows BucketContents with object listing
- [ ] Verify "Delete" shows confirmation and works
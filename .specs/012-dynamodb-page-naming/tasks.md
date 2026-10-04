# Implementation Tasks: DynamoDB Page Naming

## Tasks

- [X] Update `src/pages/DynamoDbPage.tsx`: Keep the error state label as "DynamoDB"
- [x] Update `src/pages/DynamoDbPage.tsx`: Set the error state title to "Tables"
- [X] Update `src/pages/DynamoDbPage.tsx`: Keep the main header label as "DynamoDB"
- [x] Update `src/pages/DynamoDbPage.tsx`: Set the main header title to "Tables"
- [ ] Update `src/features/dynamodb/components/TableList.tsx`: Add `onViewItems` prop to TableListProps interface
- [X] Use "View" for table metadata and keep "Items" for the records in the table
- [ ] Update `src/features/dynamodb/components/TableList.tsx`: Add "Items" button between Details and Delete
- [ ] Update `src/pages/DynamoDbPage.tsx`: Add `handleViewItems` handler (navigates to table with scan mode)
- [ ] Update `src/pages/DynamoDbPage.tsx:348-357`: Pass `onViewItems` to TableList component
- [X] Verify page header displays "DynamoDB" / "Tables"
- [ ] Verify table list shows "View", "Items", "Delete" actions
- [ ] Verify "View" shows table creation metadata and secondary indexes
- [ ] Verify "Items" shows Query/Scan tabs with table records
- [ ] Verify "Delete" shows confirmation and works

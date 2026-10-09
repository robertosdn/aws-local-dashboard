# Product

## Vision

Give developers a clear, lightweight way to inspect and work with AWS resources
in local and AWS-compatible development environments, without switching between
command-line tools and separate service consoles for routine tasks.

## Problem

When developing and testing applications that use AWS services, developers need
to verify resource state and exercise common operations. Emulator tools and
service-specific interfaces can make this work fragmented, while command-line
inspection is less convenient for quick visual checks.

## Target Users

### Application Developer

Needs to inspect local AWS-compatible resources, verify deployments, and test
service behavior during development.

### QA Engineer

Needs to review resource state and run repeatable checks against a development
or test environment.

### Local Environment Maintainer

Needs to confirm that the configured AWS-compatible endpoint is reachable and
that the dashboard is connected to the intended region and environment.

## Core Outcomes

- Make the active endpoint, region, and connection status easy to confirm.
- Provide a single place to inspect supported AWS-compatible resources.
- Make common development and testing actions discoverable and straightforward.
- Help users identify connection or service errors and retry when appropriate.

## Product Principles

- Optimize for local development and testing workflows.
- Show the current connection context clearly to help prevent work against the
  wrong environment.
- Keep resource-specific workflows focused on the tasks developers perform most
  often.
- Require confirmation for destructive operations.
- Do not imply that unsupported services or operations are available.

## Current Capabilities

- **Dashboard:** Shows the configured endpoint, region, and connection status.
- **Connection settings:** Allows users to view and change the endpoint and
  region, check connectivity, and retain settings between sessions.
- **Amazon SQS:** Lists queues, displays queue message counts, lets users inspect
  messages without consuming them, and supports purging a queue with
  confirmation.
- **AWS Lambda:** Lists functions, provides function details, and supports
  invoking a function with a test payload and reviewing the result.

## Available but Not Yet Implemented

S3 bucket and DynamoDB navigation entries are present, but their resource
workflows are not implemented yet. Users should not expect to browse or manage
S3 buckets or DynamoDB tables from the current product.

## Out of Scope

- Replacing the AWS Console or providing complete AWS service administration.
- Managing permanent AWS credentials or storing long-lived secrets.
- Creating or editing Lambda function code and configuration.
- S3 bucket and DynamoDB table or item management until those features are
  implemented.
- Accounting, payroll, marketing automation, or general business operations.

## Success Criteria

- Users can tell which endpoint and region the dashboard is using and whether
  that endpoint is reachable.
- Users can complete the supported SQS and Lambda inspection and testing
  workflows from the dashboard.
- Users receive clear loading, error, and operation feedback for supported
  workflows.
- The product clearly distinguishes implemented resource workflows from
  navigation areas that are not yet available.

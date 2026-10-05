# AWS Local Dashboard

A client-side AWS resource dashboard for local development. Connects directly to AWS-compatible endpoints (e.g., [ministack](https://github.com/ministackorg/ministack) on `localhost:4566`) from the browser — no backend required.

**Live Demo:** https://robertosdn.github.io/aws-local-dashboard/


## Features

- **SQS Queue Management**
  - List all queues with message counts (visible, in-flight, delayed)
  - Peek messages without consuming them
  - Purge queues with confirmation dialog
  - Auto-refresh and manual refresh

- **Local-First Architecture**
  - Runs entirely in the browser
  - Connects to local AWS emulator (ministack, LocalStack, etc.)
  - No credentials stored — uses dummy credentials for local development

## Tech Stack

- React 18 + TypeScript + Vite
- React Router for navigation
- Project-owned UI components styled with Tailwind CSS; shadcn/ui is used as a pattern reference and Radix UI provides selected accessible primitives
- TanStack React Query for data fetching
- AWS SDK v3 (@aws-sdk/client-sqs)

## Getting Started

### Prerequisites

- Node.js 18+
- [ministack](https://github.com/ministackorg/ministack) or LocalStack running on port 4566

### Start a local AWS-compatible endpoint

The repository includes a [`docker-compose.yml`](./docker-compose.yml) for
MinStack. Start it from the repository root:

```bash
docker compose up -d
```

```yaml
services:
  ministack:
    image: ministackorg/ministack
    ports:
      - "4566:4566"
```

To use LocalStack instead, start it on the same port and allow the dashboard's
development-server origins. `localhost` and `127.0.0.1` are different browser
origins, so allow both if you may open the dashboard using either address:

```yaml
services:
  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      EXTRA_CORS_ALLOWED_ORIGINS: "http://localhost:5173,http://127.0.0.1:5173,https://robertosdn.github.io"
```

Save this as a Compose file (for example, `docker-compose.localstack.yml`) and
start LocalStack with:

```bash
docker compose -f docker-compose.localstack.yml up -d
```

Run only one emulator on port `4566` at a time. If you use a different
development-server host or port, add that exact origin to
`EXTRA_CORS_ALLOWED_ORIGINS`. Restart the LocalStack container after changing
its configuration.

### Installation

```bash
# Clone and install
git clone https://github.com/robertosdn/aws-local-dashboard.git
cd aws-local-dashboard
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Configuration

The dashboard connects to `http://localhost:4566` by default. Configure via environment variables:

```bash
# .env.local
VITE_AWS_ENDPOINT=http://localhost:4566
VITE_AWS_REGION=us-east-1
```

## Project Structure

```
src/
├── features/sqs/           # SQS feature module
│   ├── api/               # AWS API client
│   ├── components/        # UI components
│   ├── hooks/             # React Query hooks
│   └── types/             # TypeScript types
├── pages/                 # Page components
├── components/
│   ├── ui/                # Reusable UI primitives
│   └── layout/            # Layout components
├── hooks/                 # Shared hooks
├── services/              # AWS service factories
└── config/                # App configuration
```

## Scripts

The `scripts/` directory contains Node.js helpers that use the AWS CLI to
provision and exercise local AWS test resources.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run format` | Format with Prettier |

### Create a local SQS-to-Lambda example

With ministack or LocalStack running on `http://localhost:4566`, Node.js,
project dependencies installed with `npm install`, and AWS CLI installed, run:

```bash
node scripts/create-sqs-lambda.mjs
```

The script creates the `dashboard-lambda-events` queue, the
`dashboard-sqs-consumer` Node.js Lambda function, and an SQS event source
mapping between them using AWS CLI commands. The Lambda code is packaged from
[`scripts/lambda-test.mjs`](scripts/lambda-test.mjs). The script uses dummy
credentials (`test`/`test`) and does not use credentials from your AWS profile.
Override the endpoint or resource names with the `AWS_ENDPOINT`, `QUEUE_NAME`,
and `FUNCTION_NAME` environment variables; set `LAMBDA_ROLE_ARN` if your
emulator requires a different role ARN. `AWS_REGION` can also be set to choose
the region (defaults to `us-east-1`).

### Send a test message to the SQS queue

After creating the local test queue, run:

```bash
node scripts/send-sqs-test-message.mjs
```

By default, the helper sends a sample JSON message to
`dashboard-lambda-events` at `http://localhost:4566`, using dummy credentials.
Pass a message body as the first argument, or set `MESSAGE_BODY`. Set
`QUEUE_NAME`, `AWS_ENDPOINT`, and `AWS_REGION` to target another local test
queue or endpoint.

## Security

- **Never** bundles permanent AWS credentials
- Uses dummy credentials (`test`/`test`) for local emulator only
- For real AWS: configure short-lived credentials with minimal permissions

## Documentation

- Architecture: [`docs/architecture.md`](docs/architecture.md)
- UI Patterns: [`docs/ui-patterns.md`](docs/ui-patterns.md)
- Constitution: [`docs/constitution.md`](docs/constitution.md)
- Product: [`docs/product.md`](docs/product.md)
- Specifications: [`.specs/`](.specs/)

## License

MIT
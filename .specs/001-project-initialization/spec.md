# Spec: Project Initialization

## Tech Stack
- **Framework**: React 18+ with React Router v7 (framework mode)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui-inspired primitives and styling patterns, created manually to keep the setup lightweight and aligned with the local MinStack workflow
- **AWS SDK**: @aws-sdk/client-sqs
- **Linting**: ESLint (airbnb-typescript or similar)
- **Formatting**: Prettier
- **Type Checking**: tsc --noEmit

## Project Structure
```
aws-local-dashboard/
├── package.json
├── docker-compose.yml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── .prettierrc
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.ts
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts      # shadcn/ui utility functions
│   ├── services/
│   │   └── aws.ts        # AWS client configuration
│   └── styles/
│       └── globals.css   # Tailwind imports
└── public/
```

## Configuration Details

### package.json Scripts
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write ."
}
```

### Key Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router": "^7.0.0",
    "@aws-sdk/client-sqs": "^3.x",
    "@aws-sdk/client-sts": "^3.x",
    "@aws-sdk/credential-providers": "^3.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "eslint": "^8.x",
    "@typescript-eslint/eslint-plugin": "^7.x",
    "@typescript-eslint/parser": "^7.x",
    "eslint-plugin-react-hooks": "^4.x",
    "eslint-plugin-react-refresh": "^0.x",
    "prettier": "^3.x",
    "prettier-plugin-tailwindcss": "^0.x"
  }
}
```

### Tailwind Config
- Content paths: `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`
- Theme: extend with CSS variables for shadcn/ui theming
- Plugins: tailwindcss-animate (for shadcn/ui)

### TypeScript Config
- Target: ES2020
- Module: ESNext
- ModuleResolution: Bundler
- Strict: true
- JSX: react-jsx
- Path aliases: `@/*` → `./src/*`

### Vite Config
- Plugin: @vitejs/plugin-react
- Alias: `@` → `/src`
- Server: port 5173, proxy for API if needed

## Ministack Docker Compose
Create a root-level `docker-compose.yml` to run the Ministack AWS-compatible emulator locally:

```yaml
services:
  ministack:
    image: ministackorg/ministack
    ports:
      - "4566:4566"
```

Start the emulator with `docker compose up -d` and connect the dashboard to `http://localhost:4566`. The compose configuration must use the `ministackorg/ministack` image and expose port `4566` on the host.

## shadcn/ui component setup
The project uses shadcn/ui styling patterns and a minimal set of hand-authored UI primitives instead of running a one-off `npx shadcn@latest add card` command. This keeps the initial setup simpler and avoids pulling in unnecessary generated files for the base dashboard layout.

The project currently includes primitives such as:
- `src/components/ui/button.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/separator.tsx`
- `src/lib/utils.ts` (cn helper)
- Tailwind CSS variables setup in globals.css

## AWS Service Layer
Create `src/services/aws.ts` with:
- Function to create configured AWS clients
- Endpoint, region, and optional credentials passed at runtime
- Support for LocalStack/Ministack endpoint override
- Local-development compatibility for emulator endpoints without user/password authentication

### MinStack credential model
For local emulator usage, the browser application does not need a real AWS username/password flow. The MinStack-compatible API is reached through its HTTP endpoint and a standard AWS SDK client configuration. In practice this means:

- `endpoint` is the critical configuration value
- `region` is required by the SDK and should be set for the target environment
- `credentials` are optional for local emulator use and can be dummy values when the SDK requires a credential provider
- `STS` is not required for basic queue operations such as listing queues, creating queues, sending messages, and reading messages

This keeps local development aligned with the project's security requirements: no permanent AWS secrets are embedded in the frontend, and only local emulator endpoints are used during development.
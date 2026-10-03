# Spec: Project Initialization

## Tech Stack
- **Framework**: React 18+ with React Router v7 (framework mode)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **UI Components**: Use project-owned primitives in `src/components/ui/`. Consult shadcn/ui only as a reference for common patterns and accessibility; implement components locally rather than downloading or generating shadcn/ui components.
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
│   │   └── ui/           # Project-owned reusable UI components
│   ├── lib/
│   │   └── utils.ts      # Shared class-name utilities
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
- Theme: project design tokens and CSS variables
- Plugins: tailwindcss-animate for animation utilities

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

## UI component setup
The project maintains its own reusable UI primitives and styling. shadcn/ui may be consulted as a reference for patterns and accessibility, but its components are not downloaded or generated as part of setup.

The project currently includes primitives such as:
- `src/components/ui/button.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/separator.tsx`
- `src/lib/utils.ts` (class-name helper)
- Project design tokens in `src/styles/globals.css`

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
# Tasks: Project Initialization

## Phase 1: Project Setup
- [x] Create package.json with all dependencies and scripts
- [x] Create tsconfig.json with strict mode and path aliases
- [x] Create vite.config.ts with React plugin and aliases
- [x] Create tailwind.config.ts with content paths and shadcn/ui theme
- [x] Create postcss.config.js with Tailwind and autoprefixer
- [x] Create eslint.config.js with TypeScript and React rules
- [x] Create .prettierrc with Tailwind plugin
- [x] Create index.html entry point

## Phase 2: Source Structure
- [x] Create src/main.tsx (React 18 createRoot entry)
- [x] Create src/App.tsx (root component with Router)
- [x] Create src/routes.ts (React Router route definitions)
- [x] Create src/styles/globals.css (Tailwind imports + CSS variables)
- [x] Create src/lib/utils.ts (shadcn/ui cn helper)

## Phase 3: shadcn/ui Initialization
- [x] Set up the required shadcn/ui helper and primitive pattern files for the project
- [x] Verify src/components/ui/ directory exists
- [x] Add at least one test component (Button) to verify setup
- [x] Keep the UI setup intentionally minimal and avoid unnecessary CLI-generated single-component additions such as a Card component

## Phase 4: AWS Service Layer
- [x] Create src/services/aws.ts with client factory functions
- [x] Export SQS client factory for the local MinStack flow
- [x] Accept endpoint, region, and local dummy credentials as parameters
- [x] Handle LocalStack/Ministack endpoint configuration
- [x] Document that MinStack local flows do not require a real user/password or STS auth for basic queue operations

## Phase 5: Verification
- [x] Run `npm install`
- [x] Run `npm run dev` - verify dev server starts
- [x] Run `npm run build` - verify production build succeeds
- [x] Run `npm run lint` - verify no linting errors
- [x] Run `npm run typecheck` - verify no TypeScript errors
- [x] Run `npm run format` - verify formatting works
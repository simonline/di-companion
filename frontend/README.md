# DI Companion Frontend

**Frontend for the Dynamic Innovation Companion application**

## Synopsis

This is the frontend React application for DI Companion, a platform designed to support startups and entrepreneurs through their innovation journey.

## Tech Stack

- ✅ [Vite](#vite) - `v5` 🔥
- ✅ [React](#react) - `v18` 🔥
- ✅ [TypeScript](#typescript)
- ✅ [Material-UI](#ui-framework) - `MUI v5`

## Core Features

- ✅ [Router](#router) - `React Router v6`
- ✅ [Notifications](#notifications)
- ✅ [Theme](#theme)
- ✅ [Base file/folder structure](#base-filefolder-structure)
- ✅ [Performance](#performance)
- ✅ [Error Handling](#error-handling)
- ✅ [Pages](#pages)
- ✅ [Analytics](#analytics) - `Amplitude`
- ✅ [AI Agent Chat](#ai-agent-chat) - `Google Gemini Integration` with `50:50 Split Screen Layout`

## Dev Tools and Tests

- ✅ [Tests](#tests) 🚀
  - [unit tests](#unit-tests) - `Vitest`
  - [e2e tests](#e2e-tests) - `Playwright`
- ✅ [GitHub Actions](#tests)
- ✅ [Environmental variables](#environmental-variables)
- ✅ [EsLint](#eslint)
- ✅ [Prettier](#prettier)
- ✅ [Husky](#husky)
- ✅ [Lint staged](#lint-staged)
- ✅ [https localhost](#https-localhost)

## Quick Start

### Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Strapi CMS: http://localhost:1337
```

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint:check` - Check linting
- `npm run prettier:check` - Check formatting
- `npm run ts:check` - TypeScript type checking

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:1337
VITE_BACKEND_URL=http://localhost:8000
VITE_AMPLITUDE_API_KEY=your_amplitude_key
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── lib/            # API clients and utilities
├── analytics/      # Analytics tracking
├── store/          # Zustand state management
├── routes/         # Route definitions
├── sections/       # App sections
└── theme/          # Theme configuration
```

## Key Features

### AI Coach Integration
The application includes an AI-powered coaching interface powered by Google Gemini, featuring:
- Split-screen layout for optimal interaction
- Multiple specialized advisors
- Real-time conversation streaming
- Context-aware responses

### Pattern & Method Library
Browse and explore innovation patterns and methods tailored for startups.

### Team Collaboration
Tools for team management including contracts, values, and invitations.

### Analytics Dashboard
Track startup progress with comprehensive analytics and metrics.

## Testing

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
```

## License

[MIT](./LICENSE)
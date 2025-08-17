# DI Companion - AI Assistant Documentation

## Project Overview
DI Companion (Dynamic Innovation Companion) is a full-stack monorepo application designed to support startups and entrepreneurs through their innovation journey. The application provides tools for self-assessment, pattern matching, method exploration, and team management.

## Architecture
The project uses a microservices architecture with three main components:
- **Frontend**: React/TypeScript application with Material-UI
- **Backend**: Python FastAPI service with Google Gemini integration
- **Strapi CMS**: Headless CMS for content management
- **Database**: PostgreSQL for data persistence

All services are containerized with Docker and can be orchestrated using Docker Compose.

## Technology Stack

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Form Handling**: Formik + Yup validation
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Animation**: Framer Motion
- **Testing**: Vitest + Playwright

### Backend (Python FastAPI)
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn
- **AI Integration**: Google Gemini API (Gemini 2.0 Flash)
- **Environment**: Python 3.11 with dotenv for configuration
- **Testing**: Pytest + pytest-asyncio

### CMS (Strapi)
- **Version**: Strapi 5.12.4
- **Database**: PostgreSQL 17
- **Email**: Nodemailer provider
- **Custom Content Types**: Patterns, Methods, Questions, Startups, Users

## Key Features
1. **Startup Management**: Create and manage startup profiles
2. **Pattern Library**: Browse innovation patterns and methods
3. **Self-Assessment Tools**: Surveys and questionnaires for evaluation
4. **Team Collaboration**: Team contracts, values, and invitations
5. **AI Coach**: Google Gemini-powered coaching interface
6. **Analytics**: Track startup progress and metrics
7. **Recommendations**: AI-driven pattern and method recommendations

## Quick Start

### Prerequisites
- Node.js 20+ and npm 9+
- Python 3.11+
- Docker and Docker Compose
- PostgreSQL 17 (if running locally)

### Installation
```bash
# Clone the repository
git clone https://github.com/simonline/di-companion.git
cd di-companion

# Install all dependencies
npm install && cd backend && pip install -r requirements.txt && cd ..

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development Commands

#### Using npm scripts (Monorepo)
```bash
npm run dev:all      # Start all services concurrently
npm run dev:frontend # Start frontend only
npm run dev:backend  # Start backend only
npm run dev:strapi   # Start Strapi only
npm run build:all    # Build all services
npm run test:all     # Run all tests
npm run lint:all     # Lint all code
npm run typecheck:all # Type check all TypeScript
```

#### Individual Services
```bash
# Frontend (from root or frontend/)
npm run dev --workspace=frontend
npm run build --workspace=frontend
npm run test:unit --workspace=frontend
npm run test:e2e --workspace=frontend

# Backend (from backend/)
python main.py              # Development server
python -m pytest            # Run tests

# Strapi (from root or strapi/)
npm run develop --workspace=strapi
npm run build --workspace=strapi
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: removes data)
docker-compose down -v

# Rebuild containers
docker-compose build

# List running containers
docker-compose ps
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:1337
VITE_BACKEND_URL=http://localhost:8000
VITE_AMPLITUDE_API_KEY=your_amplitude_key
```

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
HOST=0.0.0.0
PORT=8000
```

### Strapi (.env)
```
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=di
DATABASE_USERNAME=di
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret
APP_KEYS=key1,key2,key3,key4
```

## API Endpoints

### Backend API (Port 8000)
- `POST /api/chat` - AI chat endpoint for coaching conversations

### Strapi API (Port 1337)
- `/api/patterns` - Innovation patterns
- `/api/methods` - Innovation methods
- `/api/startups` - Startup profiles
- `/api/startup-patterns` - Startup pattern associations
- `/api/surveys` - Assessment surveys
- `/api/recommendations` - AI recommendations
- `/api/invitations` - Team invitations
- `/api/auth/local` - Authentication

## Project Structure
```
di-companion/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API clients and utilities
│   │   ├── analytics/        # Analytics tracking
│   │   ├── store/            # Zustand state management
│   │   ├── test/             # Test setup and utilities
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   ├── Dockerfile            # Docker build
│   ├── package.json          # Frontend dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── vite.config.ts        # Vite build configuration
├── backend/                  # Python FastAPI service
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   └── v1/
│   │   │       ├── endpoints/# Route handlers
│   │   │       └── api.py    # API router
│   │   ├── core/             # Core configurations
│   │   │   └── config.py     # Settings management
│   │   ├── models/           # Pydantic models
│   │   └── main.py           # FastAPI application
│   ├── main.py               # Entry point
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Docker build
├── strapi/                   # Strapi CMS
│   ├── src/
│   │   ├── api/              # Content type definitions
│   │   └── extensions/       # Custom extensions
│   ├── config/               # Strapi configuration
│   ├── package.json          # Strapi dependencies
│   └── Dockerfile            # Docker build
├── docker-compose.yml        # Docker orchestration
├── package.json              # Monorepo configuration
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── .editorconfig             # Editor configuration
├── .prettierrc               # Code formatting rules
├── .eslintrc.js              # Linting rules
├── .nvmrc                    # Node version specification
└── CLAUDE.md                 # This documentation
```

## Key Components

### Frontend Pages
- **Dashboard**: Main user dashboard
- **Explore**: Browse patterns and methods
- **Progress**: Track startup progress
- **Coach**: AI coaching interface
- **Tools**: Team contracts, pitch deck analyzer, interview analyzer
- **Profile**: User and startup profile management
- **Startups**: Startup management and analytics

### Custom Hooks
- `useAuth`: Authentication management
- `usePatterns`: Pattern data fetching
- `useSurvey`: Survey management
- `useStartups`: Startup data management
- `useRecommendations`: AI recommendations

### Content Types (Strapi)
- **Pattern**: Innovation patterns with categories
- **Method**: Implementation methods
- **Startup**: Startup profiles and metadata
- **Survey**: Assessment questionnaires
- **Question**: Survey questions
- **Recommendation**: AI-generated recommendations
- **Invitation**: Team member invitations

## Testing
- **Unit Tests**: Vitest for component testing
- **E2E Tests**: Playwright for end-to-end testing
- **Backend Tests**: `test_chat.py` for API testing

## Code Quality
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with import sorting
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky for pre-commit checks

## Best Practices Applied

### Code Organization
- **Monorepo Structure**: Unified codebase with npm workspaces for better dependency management
- **Modular Architecture**: Clean separation between frontend, backend, and CMS
- **TypeScript**: Strong typing across frontend and Strapi
- **Python Package Structure**: Organized backend with proper module separation

### Development Experience
- **npm Scripts**: Unified commands across the monorepo
- **Simple Docker Setup**: Easy-to-understand Dockerfiles and compose
- **Hot Reloading**: Enabled in all development environments
- **Shared Configurations**: Consistent code style across the monorepo

### Production Readiness
- **Environment Management**: Configuration via .env files
- **Health Checks**: Built into backend service
- **Optimized Builds**: Code splitting in frontend

## Deployment

### Local Development
```bash
npm run dev:all       # Start all services locally
```

### Production Deployment
```bash
# Build production images
docker-compose build

# Deploy with production settings
docker-compose up -d
```

### Cloud Deployment Options
- **AWS ECS**: Use the provided Dockerfiles with ECS task definitions
- **Google Cloud Run**: Deploy containerized services individually
- **Kubernetes**: Use the Docker images with Kubernetes manifests
- **Heroku**: Deploy using container registry

## Important Notes
- Authentication is handled through Strapi's user management
- Google Gemini API key is required for AI coaching features
- PostgreSQL database is shared between Strapi and custom services
- The application supports responsive design and mobile devices
- All services are containerized for consistent deployment

## Security Considerations
- JWT tokens for authentication
- CORS configured for specific origins
- Environment variables for sensitive data
- Health checks for service monitoring
- Input validation on all API endpoints
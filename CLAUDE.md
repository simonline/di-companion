# DI Companion - AI Assistant Documentation

## Project Overview
DI Companion (Dynamic Innovation Companion) is a full-stack application designed to support startups and entrepreneurs through their innovation journey. The application provides tools for self-assessment, pattern matching, method exploration, and team management.

## Architecture
The project uses a microservices architecture with three main components:
- **Frontend**: React/TypeScript application with Material-UI
- **Backend**: Python FastAPI service with OpenAI integration
- **Strapi CMS**: Headless CMS for content management
- **Database**: PostgreSQL for data persistence

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
- **PWA**: Vite PWA plugin

### Backend (Python FastAPI)
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn
- **AI Integration**: OpenAI API (GPT models)
- **Environment**: Python with dotenv for configuration

### CMS (Strapi)
- **Version**: Strapi 5.12.4
- **Database**: PostgreSQL
- **Email**: Nodemailer provider
- **Custom Content Types**: Patterns, Methods, Questions, Startups, Users

## Key Features
1. **Startup Management**: Create and manage startup profiles
2. **Pattern Library**: Browse innovation patterns and methods
3. **Self-Assessment Tools**: Surveys and questionnaires for evaluation
4. **Team Collaboration**: Team contracts, values, and invitations
5. **AI Coach**: ChatGPT-powered coaching interface
6. **Analytics**: Track startup progress and metrics
7. **Recommendations**: AI-driven pattern and method recommendations

## Development Commands

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint:check   # Run ESLint
npm run ts:check     # TypeScript type checking
npm run prettier:check # Check code formatting
npm run test:unit    # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright
```

### Backend
```bash
cd backend
pip install -r requirements.txt  # Install dependencies
python main.py                   # Start development server (port 8000)
```

### Strapi CMS
```bash
cd strapi
npm install          # Install dependencies
npm run develop      # Start development server (port 1337)
npm run build        # Build for production
npm run start        # Start production server
```

### Docker (All Services)
```bash
docker-compose up    # Start all services
docker-compose down  # Stop all services
docker-compose build # Rebuild containers
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
OPENAI_API_KEY=your_openai_api_key
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
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # API clients and utilities
│   │   ├── analytics/  # Analytics tracking
│   │   └── store/      # Zustand state management
│   └── public/         # Static assets
├── backend/            # Python FastAPI service
│   ├── main.py         # Main application
│   └── requirements.txt
├── strapi/             # Strapi CMS
│   ├── src/
│   │   ├── api/        # Content type definitions
│   │   └── extensions/ # Custom extensions
│   └── config/         # Configuration files
└── docker-compose.yml  # Docker orchestration
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

## Deployment
The application is containerized and can be deployed using Docker Compose. Each service has its own Dockerfile for independent scaling and deployment.

## Important Notes
- The frontend uses PWA capabilities for offline support
- Authentication is handled through Strapi's user management
- OpenAI API key is required for AI coaching features
- PostgreSQL database is shared between Strapi and custom services
- The application supports responsive design and mobile devices

## Security Considerations
- JWT tokens for authentication
- CORS configured for specific origins
- Environment variables for sensitive data
- Docker secrets for production deployment
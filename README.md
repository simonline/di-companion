# DI Companion

This repository contains the DI Companion application with the following structure:

## Project Structure

```
di-companion/
├── frontend/          # React/Vite frontend application
├── backend/           # Python backend service
├── strapi/            # Strapi CMS
└── docker-compose.yml # Docker orchestration
```

## Services

- **Frontend**: React application with Vite (Port 5173)
- **Backend**: Python backend service (Port 8000)
- **Strapi**: Headless CMS (Port 1337)
- **PostgreSQL**: Database (Port 5432)

## Getting Started

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the application at `http://localhost:5173`

## Development

Each service can be developed independently:

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && python main.py`
- Strapi: `cd strapi && npm run develop` 
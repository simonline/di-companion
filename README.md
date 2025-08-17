# DI Companion

Dynamic Innovation Companion - A full-stack application supporting startups and entrepreneurs through their innovation journey.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/simonline/di-companion.git
cd di-companion

# Install all dependencies
npm install && cd backend && pip install -r requirements.txt && cd ..

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration (especially GEMINI_API_KEY)

# Start all services with Docker
docker-compose up -d

# Or start services individually for development
npm run dev:all
```

## 📦 Project Structure

```
di-companion/
├── frontend/                 # React 18 + Vite + TypeScript
├── backend/                  # Python FastAPI + Google Gemini
├── strapi/                   # Strapi CMS v5
├── docker-compose.yml        # Main Docker orchestration
├── docker-compose.dev.yml    # Development overrides
├── docker-compose.prod.yml   # Production overrides
├── package.json              # Monorepo configuration
```

## 🛠️ Services

| Service    | Port | Description                        |
| ---------- | ---- | ---------------------------------- |
| Frontend   | 5173 | React application with Material-UI |
| Backend    | 8000 | FastAPI with Google Gemini AI      |
| Strapi     | 1337 | Headless CMS for content           |
| PostgreSQL | 5432 | Database                           |

## 💻 Development

### Using npm scripts (Monorepo)
```bash
npm run dev:all      # Start all services concurrently
npm run dev:frontend # Start frontend only
npm run dev:backend  # Start backend only
npm run dev:strapi   # Start Strapi only
npm run build:all    # Build all services
npm run test:all     # Run all tests
```

### Individual Services
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && python main.py

# Strapi
cd strapi && npm run develop
```

### Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Configuration

Create a `.env` file in the root directory with:

```env
# Frontend
VITE_API_URL=http://localhost:1337
VITE_BACKEND_URL=http://localhost:8000

# Backend (Required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Database
DATABASE_NAME=di
DATABASE_USERNAME=di
DATABASE_PASSWORD=your_secure_password
```

## 📚 Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed technical documentation.

## 📄 License

MIT 